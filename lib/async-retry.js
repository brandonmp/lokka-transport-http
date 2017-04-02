import retry from 'async-retry';

module.exports = async (endpointUrl, fetchOptions, retryOptions, fetchUrl) => {
  let retryCount = 0;
  const _onRetry = err => {
    if (retryOptions.onRetry !== null) {
      retryOptions.onRetry(retryCount, err);
    }
  };

  return await retry(
    async (bail, attemptNumber) => {
      retryCount = attemptNumber;
      const response = await fetchUrl(endpointUrl, fetchOptions);
      // if invalid response code, retry
      if (retryOptions.checkShouldAbortRetry) {
        const abortRetryError = retryOptions.checkShouldAbortRetry(response);
        if (abortRetryError instanceof Error) {
          bail(abortRetryError);
        }
      }
      if (response.status !== 200 && response.status !== 400) {
        throw new Error(`Invalid status code: ${response.status}`);
      }
      return response;
    },
    {
      retries: retryOptions.retries,
      onRetry: _onRetry,
    }
  );
};
