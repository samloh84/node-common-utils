const _ = require('lodash');
const Promise = require('bluebird');
const sprintf = require('sprintf-js').sprintf;
const child_process = require('child_process');
var _path = require("path");

var ExecUtil = {};

/**
 * Spawns a shell then executes the command within that shell, buffering any generated output.
 * @param options
 * @param options.command {string}
 * @param [options.cwd] {string}
 * @param [options.env] {Object.<string,string>}
 * @param [options.encoding] {string}
 * @param [options.shell] {string}
 * @param [options.timeout] {number}
 * @param [options.maxBuffer] {number}
 * @param [options.killSignal] {string}
 * @param [options.uid] {number}
 * @param [options.gid] {number}
 * @returns {Promise.<{stdout:string, stderr:string}>}
 */
ExecUtil.exec = function (options) {
    return new Promise(function (resolve, reject) {
        try {
            var command = _.get(options, 'command');

            var execArgs = [command];

            var cwd = _.get(options, 'cwd', process.cwd());
            cwd = _path.resolve(process.cwd(), cwd);

            var env = _.get(options, 'env');
            var encoding = _.get(options, 'encoding');
            var shell = _.get(options, 'shell');
            var timeout = _.get(options, 'timeout');
            var maxBuffer = _.get(options, 'maxBuffer');
            var killSignal = _.get(options, 'killSignal');
            var uid = _.get(options, 'uid');
            var gid = _.get(options, 'gid');

            var execOptions = {
                cwd: cwd,
                env: env,
                encoding: encoding,
                shell: shell,
                timeout: timeout,
                maxBuffer: maxBuffer,
                killSignal: killSignal,
                uid: uid,
                gid: gid
            };

            execOptions = _.omitBy(execOptions, _.isUndefined);

            if (!_isEmpty(execOptions)) {
                execArgs.push(execOptions);
            }


            var callback = function (err, stdout, stderr) {
                if (err) {
                    return reject(err);
                }
                return resolve({stdout: stdout, stderr: stderr});
            };

            execArgs.push(callback);

            var childProcess = child_process.exec.apply(null, execArgs);
            childProcess.once('error', function (err) {
                reject(err);
            });


        } catch (err) {
            return reject(err);
        }
    })
};


/**
 * The child_process.execFile() function is similar to child_process.exec() except that it does not spawn a shell. Rather, the specified executable file is spawned directly as a new process making it slightly more efficient than child_process.exec().
 * @param options
 * @param options.file {string}
 * @param [options.args] {string[]}
 * @param [options.cwd] {string}
 * @param [options.env] {Object.<string,string>}
 * @param [options.encoding] {string}
 * @param [options.timeout] {number}
 * @param [options.maxBuffer] {number}
 * @param [options.killSignal] {string}
 * @param [options.uid] {number}
 * @param [options.gid] {number}
 * @returns {Promise.<{stdout:string, stderr:string}>}
 */
ExecUtil.execFile = function (options) {
    return new Promise(function (resolve, reject) {
        try {
            var file = _.get(options, 'file');
            file = _path.resolve(process.cwd(), file);
            var execFileArgs = [file];

            var args = _.get(options, 'args');
            if (!_.isNil(args)) {
                execFileArgs.push(args);
            }

            var cwd = _.get(options, 'cwd', process.cwd());
            cwd = _path.resolve(process.cwd(), cwd);

            var env = _.get(options, 'env');
            var encoding = _.get(options, 'encoding');
            var timeout = _.get(options, 'timeout');
            var maxBuffer = _.get(options, 'maxBuffer');
            var killSignal = _.get(options, 'killSignal');
            var uid = _.get(options, 'uid');
            var gid = _.get(options, 'gid');

            var execFileOptions = {
                cwd: cwd,
                env: env,
                encoding: encoding,
                timeout: timeout,
                maxBuffer: maxBuffer,
                killSignal: killSignal,
                uid: uid,
                gid: gid
            };

            execFileOptions = _.omitBy(execFileOptions, _.isUndefined);

            if (!_isEmpty(execFileOptions)) {
                execFileArgs.push(execFileOptions);
            }


            var callback = function (err, stdout, stderr) {
                if (err) {
                    return reject(err);
                }
                return resolve({stdout: stdout, stderr: stderr});
            };

            execFileArgs.push(callback);

            var childProcess = child_process.execFile.apply(null, execFileArgs);
            childProcess.once('error', function (err) {
                reject(err);
            });


        } catch (err) {
            return reject(err);
        }
    })
};


/**
 * The child_process.spawn() method spawns a new process using the given command, with command line arguments in args. If omitted, args defaults to an empty array.
 * @param options
 * @param options.command {string}
 * @param [options.args] {string[]}
 * @param [options.cwd] {string}
 * @param [options.env] {Object.<string,string>}
 * @param [options.encoding] {string}
 * @param [options.shell] {string}
 * @param [options.timeout] {number}
 * @param [options.maxBuffer] {number}
 * @param [options.killSignal] {string}
 * @param [options.uid] {number}
 * @param [options.gid] {number}
 * @returns {Promise.<{stdout:string, stderr:string}>}
 */
ExecUtil.spawn = function (options) {
    return new Promise(function (resolve, reject) {
        try {
            var command = _.get(options, 'command');

            var spawnArgs = [command];

            var args = _.get(options, 'args');
            if (!_.isNil(args)) {
                spawnArgs.push(args);
            }

            var cwd = _.get(options, 'cwd', process.cwd());
            cwd = _path.resolve(process.cwd(), cwd);

            var env = _.get(options, 'env');
            var argv0 = _.get(options, 'argv0');
            var stdio = _.get(options, 'stdio');
            var detached = _.get(options, 'detached');
            var uid = _.get(options, 'uid');
            var gid = _.get(options, 'gid');
            var shell = _.get(options, 'shell');


            var spawnOptions = {
                cwd: cwd,
                env: env,
                argv0: argv0,
                stdio: stdio,
                detached: detached,
                uid: uid,
                gid: gid,
                shell: shell

            };

            spawnOptions = _.omitBy(spawnOptions, _.isUndefined);

            if (!_isEmpty(spawnOptions)) {
                spawnArgs.push(spawnOptions);
            }

            var childProcess = child_process.spawn.apply(null, spawnArgs);


            childProcess.once('error', function (err) {
                reject(err);
            });

            resolve(childProcess);

        } catch (err) {
            return reject(err);
        }
    })
};


module.exports = ExecUtil;