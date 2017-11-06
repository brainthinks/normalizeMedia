'use strict';

/**
 * Allow non-Promise-compatible asynchrounous functions to be used as Promises
 * and/or with async/await.
 *
 * This assumes that the `func` expects its last argument to be a callback, and
 * that the first value that is used when executing the callback is the error.
 *
 * Note that if you need a particular context when the function is executed,
 * you should bind the function to the desired context.
 *
 *
 * @param  {func}
 *   The non-Promise asynchronous function to execute.
 *
 * @param  {...[executionArgs]}
 *   The arguments to be used when calling `func`.
 *
 * @return {Promise}
 *   The Promise-wrapped `func`.
 */
function toPromise (func, ...executionArgs) {
  return new Promise((resolve, reject) => {
    func(...executionArgs, (err, ...responseArgs) => {
      // If there is an error, reject
      if (err) {
        return reject(err);
      }

      // If there are no responseArgs, then we expect the caller to do nothing
      // with the resolve value, so don't resolve any value.
      if (responseArgs.length === 0) {
        return resolve();
      }

      // If there is only a single responseArg, resolve only that, to make this
      // more natural to use with async/await.
      if (responseArgs.length === 1) {
        return resolve(responseArgs[0]);
      }

      // If there are multiple responseArgs, resolve all of them in an array.
      resolve(responseArgs);
    });
  });
}

/**
 * Iterate over an array, passing each item to the callback, waiting for the
 * callback to resolve before proceeding to the next item.  The result of the
 * callback is ignored.
 *
 * If an error is encountered, it will be thrown/rejected.  It is up to the
 * caller to handle this.  If an error is thrown or a Promise is rejected, the
 * remaining items will not be processed.  If you want processing to continue
 * in the event of an error, the callback must not throw or reject.
 *
 * @param  {array}
 *   The items to iterate over.
 *
 * @param  {Function}
 *   The callback to use to process each item.  If this callback is a Promise,
 *   it will be resolved before the next item is processed.
 *
 * @return {void}
 */
async function forEachAsyncSeries (array, callback) {
  for (let i = 0; i < array.length; i++) {
    await callback(array[i]);
  }
};

/**
 * Iterate over an array, passing each item to the callback, waiting for the
 * callback to resolve before proceeding to the next item.  The result of the
 * callback will be placed in an array at the same index as the item was in the
 * original array.
 *
 * If an error is encountered, it will be thrown/rejected.  It is up to the
 * caller to handle this.  If an error is thrown or a Promise is rejected, the
 * remaining items will not be processed.  If you want processing to continue
 * in the event of an error, the callback must not throw or reject.
 *
 * @param  {array}
 *   The items to iterate over.
 *
 * @param  {Function}
 *   The callback to use to process each item.  If this callback is a Promise,
 *   it will be resolved before the next item is processed.  The result will be
 *   placed into the returned array.
 *
 * @return {array}
 *   The array containing the results of each callback return or resolve value
 *   in order.
 */
async function mapAsyncSeries (array, callback) {
  const processedItems = [];

  for (let i = 0; i < array.length; i++) {
    processedItems.push(await callback(array[i]));
  }

  return processedItems;
};

module.exports = {
  toPromise,
  forEachAsyncSeries,
  mapAsyncSeries,
};
