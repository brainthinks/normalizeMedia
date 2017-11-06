'use strict';

const { spawn } = require('child_process');

// @todo - are these properly named based on the behavior of child_process.spawn?
class RunExecutionError extends Error {};
class RunExitError extends Error {};

class Runner {
  constructor (bin, runArgs = [], runOptions = {}, dependencies = {}) {
    this.logger = dependencies.logger || console;

    this.logger.log('Constructing new Runner');

    this.bin = bin;
    this.runArgs = runArgs;
    this.runOptions = runOptions;

    this.listeners = {
      stdout: this.defaultStdoutListener.bind(this),
      stderr: this.defaultStderrListener.bind(this),
      close: this.defaultCloseListener.bind(this),
      error: this.defaultErrorListener.bind(this),
    };

    this.running = false;
  }

  on (eventName, callback) {
    this.logger.log(`Registering event listener for ${eventName}`);

    this.listeners[eventName] = callback;

    return this;
  }

  run () {
    this.logger.log(`Executing the following command: "${this.bin} ${this.runArgs.join(' ')}" in directory ${this.runOptions.cwd}`);

    // Initialize the process
    this.runner = spawn(this.bin, this.runArgs, this.runOptions);

    // Set listeners
    this.runner.stdout.on('data', this.listeners.stdout);
    this.runner.stderr.on('data', this.listeners.stderr);
    this.runner.on('close', (...args) => {
      this.listeners.close(...args);
      this.running = false;
    });
    this.runner.on('error', (...args) => {
      this.listeners.error(...args);
      this.running = false;
    });

    // Create a way for the caller to know when the process is finished running
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });

    // Set this flag last to ensure runner and promise can actually be set
    this.running = true;

    return this;
  }

  defaultStdoutListener (data) {
    this.logger.log(`info: ${data}`);
  }

  defaultStderrListener (data) {
    this.logger.error(`error: ${data}`);
  }

  defaultCloseListener (code) {
    if (code === 0) {
      this.logger.log('Resolving promise...');
      return this.resolve();
    }

    this.reject(new RunExitError(`child process ${this.bin} exited with code ${code}`));
  }

  defaultErrorListener (code) {
    this.reject(new RunExecutionError(`child process ${this.bin} failed to execute with code ${code}`));
  }
}

module.exports = {
  Runner,
};
