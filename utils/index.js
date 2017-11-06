'use strict';

const utils = {};

/**
 * Get all arguments that were passed to the currently executing node process.
 *
 * @return {array}
 */
utils.getArgs = () => {
  const [ , , ...args ] = process.argv;

  return args;
};

/**
 * Allow non-Promise-compatible asynchrounous functions to be used as Promises
 * and/or with async/await.
 *
 * This assumes that the `func` expects its last argument to be a callback, and
 * that the first value that is used when executing the callback is the error.
 *
 * @todo - what is the best way to handle context (aka `this`)?
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
utils.toPromise = (func, ...executionArgs) => new Promise((resolve, reject) => {
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

utils.forEachAsyncSeries = async (array, callback) => {
  for (let i = 0; i < array.length; i++) {
    await callback(array[i]);
  }
};

module.exports = utils;
