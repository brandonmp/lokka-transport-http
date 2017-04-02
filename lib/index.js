/* global fetch */
import LokkaTransport from 'lokka/transport';
import fetchWithRetries from './async-retry.js';
// In some envionment like in ReactNative, we don't need fetch at all.
// Technically, this should be handle by 'isomorphic-fetch'.
// But it's not happening. So this is the fix

const isNode = new Function(
  'try {return this===global;}catch(e){return false;}'
);

let fetchUrl;
if (typeof fetch === 'function') {
  // has a native fetch implementation
  fetchUrl = fetch;
} else if (isNode()) {
  // for Node.js
  fetchUrl = require('node-fetch');
  fetchUrl.Promise = Promise;
} else {
  // for the browser
  require('whatwg-fetch');
  fetchUrl = fetch;
}

// the default error handler
function handleErrors(errors /* Error | Error[]*/, data) {
  // this lets us take a single error or array of errs
  const message = errors instanceof Error ? errors.message : errors[0].message;
  const error = new Error(`GraphQL Error: ${message}`);
  error.rawError = errors;
  error.rawData = data;
  throw error;
}

export class Transport extends LokkaTransport {
  constructor(endpoint, options = {}) {
    if (!endpoint) {
      throw new Error('endpoint is required!');
    }

    super();
    this._httpOptions = {
      auth: options.auth,
      headers: options.headers || {},
      credentials: options.credentials,
    };
    this._retryOptions = Object.assign(
      {
        retries: 3,
        /* function to execute after each retry. If this function throws,
      * any remaining retries will be aborted (useful for logging &
      * conditioning a retry on the error that triggered it) (retryCount, error) => ?Error */
        onRetry: null,

        checkShouldAbortRetry: null /* null | (response) => ?Error */,
        /* Called as soon as a response is received by fetch.
        *  if an Error is returned, retries will be aborted and the fetch operation will throw.
      */
      },
      options.retryOptions || {}
    );
    this.endpoint = endpoint;
    this.handleErrors = options.handleErrors || handleErrors;
  }

  _buildOptions(payload) {
    const options = {
      method: 'post',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      // To pass cookies to the server. (supports CORS as well)
      credentials: 'include',
    };

    // use delete property for backward compatibility
    if (this._httpOptions.credentials === false) {
      delete options.credentials;
    }

    Object.assign(options.headers, this._httpOptions.headers);
    return options;
  }

  async send(query, variables, operationName) {
    const payload = { query, variables, operationName };
    const options = this._buildOptions(payload);
    try {
      const response = await fetchWithRetries(
        this.endpoint,
        options,
        this._retryOptions,
        fetchUrl
      );
      const { data, errors } = await response.json();
      if (errors) {
        this.handleErrors(errors, data);
      }
      return data;
    } catch (err) {
      const errors = Array.isArray(err) === true ? err : [ err ];
      this.handleErrors(errors, null);
      return null;
    }
  }
}

export default Transport;
