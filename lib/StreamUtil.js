const Promise = require('bluebird');
const _ = require('lodash');
const fs = require('fs');
const _path = require('path');
const sprintf = require('sprintf-js').sprintf;
const stream = require("stream");

/**
 * Node.js Stream Utility Methods, wrapped with Bluebird Promises
 * @see https://nodejs.org/api/stream.html
 *
 */
var StreamUtil = {};


/**
 *
 * @param options.source {ReadStream}
 * @param options.target {WriteStream}
 * @returns {boolean}
 */
StreamUtil.pipe = function (options) {
    var source = _.get(options, 'source');
    var target = _.get(options, 'target');


    return new Promise(function (resolve, reject) {
        source.once('error', function (err) {
            reject(err);
        });
        target.once('error', function (err) {
            reject(err);
        });
        target.once('finish', function () {
            resolve();
        });
        target.once('close', function () {
            resolve();
        });
        source.pipe(target);
    });
};


_.assign(StreamUtil, _.mapValues(StreamUtil, function (fn) {
    if (_.isFunction(fn)) {
        fn = Promise.method(fn);
    }
    return fn;
}));


/**
 *
 * @param obj
 * @returns {boolean}
 */
StreamUtil.isReadStream = function (obj) {
    return obj instanceof stream.Stream && (typeof obj._read) === 'function' && (typeof obj._readableState) === 'object';
};

/**
 *
 * @param obj
 * @returns {boolean}
 */
StreamUtil.isWriteStream = function (obj) {
    return obj instanceof stream.Stream && (typeof obj._write) === 'function' && (typeof obj._writeableState) === 'object';
};


// TODO: Implement writing into buffer and reading from buffers

module.exports = StreamUtil;
