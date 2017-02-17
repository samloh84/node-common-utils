const _ = require('lodash');
const Promise = require('bluebird');
const sprintf = require('sprintf-js').sprintf;
const vm = require('vm');
const util = require('util');

var VmUtil = {};


/**
 * @param options
 * @param options.script
 * @param options.context
 * @param [options.filename]
 * @param [options.lineOffset]
 * @param [options.columnOffset]
 * @param [options.displayErrors]
 * @param [options.timeout]
 * @param [options.cachedData]
 * @param [options.produceCachedData]
 * @param [options.async]
 */
VmUtil.exec = function (options) {
    return new Promise(function (resolve, reject) {

        var script = _.get(options, 'script');

        var context = _.get(options, 'context', {});

        _.assign(context, {
            console: console,
            resolve: resolve,
            reject: reject,

        });

        var runArgs = [script, context];

        var filename = _.get(options, 'filename');
        var lineOffset = _.get(options, 'lineOffset');
        var columnOffset = _.get(options, 'columnOffset');
        var displayErrors = _.get(options, 'displayErrors');
        var timeout = _.get(options, 'timeout');
        var cachedData = _.get(options, 'cachedData');
        var produceCachedData = _.get(options, 'produceCachedData');
        var async = _.get(options, 'async');

        var newScriptOptions = {
            filename: filename,
            lineOffset: lineOffset,
            columnOffset: columnOffset,
            displayErrors: displayErrors,
            timeout: timeout,
            cachedData: cachedData,
            produceCachedData: produceCachedData
        };

        newScriptOptions = _.omitBy(newScriptOptions, _.isUndefined);

        if (!_.isEmpty(newScriptOptions)) {
            runArgs.push(newScriptOptions);
        }

        try {
            vm.runInNewContext.apply(null, runArgs);

            if (!async) {
                return resolve(context.result || context);
            }

        } catch (err) {
            return reject(err);
        }
    });


};

module.exports = VmUtil;