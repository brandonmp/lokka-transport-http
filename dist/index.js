'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Transport = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _transport = require('lokka/transport');

var _transport2 = _interopRequireDefault(_transport);

var _asyncRetry = require('./async-retry.js');

var _asyncRetry2 = _interopRequireDefault(_asyncRetry);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// In some envionment like in ReactNative, we don't need fetch at all.
// Technically, this should be handle by 'isomorphic-fetch'.
// But it's not happening. So this is the fix

/* global fetch */
var isNode = new Function('try {return this===global;}catch(e){return false;}');

var fetchUrl = void 0;
if (typeof fetch === 'function') {
  // has a native fetch implementation
  fetchUrl = fetch;
} else if (isNode()) {
  // for Node.js
  fetchUrl = require('node-fetch');
  fetchUrl.Promise = _promise2.default;
} else {
  // for the browser
  require('whatwg-fetch');
  fetchUrl = fetch;
}

// the default error handler
function handleErrors(errors /* Error | Error[]*/, data) {
  // this lets us take a single error or array of errs
  var message = errors instanceof Error ? errors.message : errors[0].message;
  var error = new Error('GraphQL Error: ' + message);
  error.rawError = errors;
  error.rawData = data;
  throw error;
}

var Transport = exports.Transport = function (_LokkaTransport) {
  (0, _inherits3.default)(Transport, _LokkaTransport);

  function Transport(endpoint) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    (0, _classCallCheck3.default)(this, Transport);

    if (!endpoint) {
      throw new Error('endpoint is required!');
    }

    var _this = (0, _possibleConstructorReturn3.default)(this, (Transport.__proto__ || (0, _getPrototypeOf2.default)(Transport)).call(this));

    _this._httpOptions = {
      auth: options.auth,
      headers: options.headers || {},
      credentials: options.credentials
    };
    _this._retryOptions = (0, _assign2.default)({
      retries: 3,
      /* function to execute after each retry. If this function throws,
      * any remaining retries will be aborted (useful for logging &
      * conditioning a retry on the error that triggered it) (retryCount, error) => ?Error */
      onRetry: null,

      checkShouldAbortRetry: null /* null | (response) => ?Error */
    }, options.retryOptions || {});
    _this.endpoint = endpoint;
    _this.handleErrors = options.handleErrors || handleErrors;
    return _this;
  }

  (0, _createClass3.default)(Transport, [{
    key: '_buildOptions',
    value: function _buildOptions(payload) {
      var options = {
        method: 'post',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: (0, _stringify2.default)(payload),
        // To pass cookies to the server. (supports CORS as well)
        credentials: 'include'
      };

      // use delete property for backward compatibility
      if (this._httpOptions.credentials === false) {
        delete options.credentials;
      }

      (0, _assign2.default)(options.headers, this._httpOptions.headers);
      return options;
    }
  }, {
    key: 'send',
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(query, variables, operationName) {
        var payload, options, response, _ref2, data, errors, _errors;

        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                payload = { query: query, variables: variables, operationName: operationName };
                options = this._buildOptions(payload);
                _context.prev = 2;
                _context.next = 5;
                return (0, _asyncRetry2.default)(this.endpoint, options, this._retryOptions, fetchUrl);

              case 5:
                response = _context.sent;
                _context.next = 8;
                return response.json();

              case 8:
                _ref2 = _context.sent;
                data = _ref2.data;
                errors = _ref2.errors;

                if (errors) {
                  this.handleErrors(errors, data);
                }
                return _context.abrupt('return', data);

              case 15:
                _context.prev = 15;
                _context.t0 = _context['catch'](2);
                _errors = Array.isArray(_context.t0) === true ? _context.t0 : [_context.t0];

                this.handleErrors(_errors, null);
                return _context.abrupt('return', null);

              case 20:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[2, 15]]);
      }));

      function send(_x2, _x3, _x4) {
        return _ref.apply(this, arguments);
      }

      return send;
    }()
  }]);
  return Transport;
}(_transport2.default);

exports.default = Transport;