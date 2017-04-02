'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _asyncRetry = require('async-retry');

var _asyncRetry2 = _interopRequireDefault(_asyncRetry);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(endpointUrl, fetchOptions, retryOptions, fetchUrl) {
    var retryCount, _onRetry;

    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            retryCount = 0;

            _onRetry = function _onRetry(err) {
              if (retryOptions.onRetry !== null) {
                retryOptions.onRetry(retryCount, err);
              }
            };

            _context2.next = 4;
            return (0, _asyncRetry2.default)(function () {
              var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(bail, attemptNumber) {
                var response, abortRetryError;
                return _regenerator2.default.wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        retryCount = attemptNumber;
                        _context.next = 3;
                        return fetchUrl(endpointUrl, fetchOptions);

                      case 3:
                        response = _context.sent;

                        // if invalid response code, retry
                        if (retryOptions.checkShouldAbortRetry) {
                          abortRetryError = retryOptions.checkShouldAbortRetry(response);

                          if (abortRetryError instanceof Error) {
                            bail(abortRetryError);
                          }
                        }

                        if (!(response.status !== 200 && response.status !== 400)) {
                          _context.next = 7;
                          break;
                        }

                        throw new Error('Invalid status code: ' + response.status);

                      case 7:
                        return _context.abrupt('return', response);

                      case 8:
                      case 'end':
                        return _context.stop();
                    }
                  }
                }, _callee, undefined);
              }));

              return function (_x5, _x6) {
                return _ref2.apply(this, arguments);
              };
            }(), {
              retries: retryOptions.retries,
              onRetry: _onRetry
            });

          case 4:
            return _context2.abrupt('return', _context2.sent);

          case 5:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function (_x, _x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  };
}();