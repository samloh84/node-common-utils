const _ = require('lodash');
const Promise = require('bluebird');
const sprintf = require('sprintf-js').sprintf;
const child_process = require('child_process');
var _path = require("path");

var ExecUtil = {};

/**
 *
 * @param options
 * @param options.command {string}
 * @param options.cwd {string}
 * @param options.env {Object.<string,string>}
 * @returns {Promise.<{stdout:string, stderr:string}>}
 */
ExecUtil.exec = function (options) {
    return new Promise(function (resolve, reject) {
        try {
            var command = _.get(options, 'command');
            var cwd = _.get(options, 'cwd', process.cwd());
            var env = _.get(options, 'env');

            cwd = _path.resolve(process.cwd(), cwd);

            child_process.exec(command, {
                cwd: cwd,
                env: env
            }, function (err, stdout, stderr) {
                if (err) {
                    return reject(err);
                }
                return resolve({stdout: stdout, stderr: stderr});
            });
        } catch (err) {
            return reject(err);
        }
    })
};

module.exports = ExecUtil;