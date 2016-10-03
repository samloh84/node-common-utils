const Promise = require('bluebird');
const _ = require('lodash');
const fs = require('fs');
const _path = require('path');
const sprintf = require('sprintf-js').sprintf;
const StreamUtil = require('./StreamUtil');
const stream = require("stream");

/**
 * Node.js File System Utility Methods, wrapped with Bluebird Promises
 * @see https://nodejs.org/api/fs.html
 *
 */
var FileUtil = {};

/**
 * Tests a user's permissions for the file or directory specified by path.
 * @param options {object}
 * @param options.path {string}
 * @param [options.mode] {integer} - The mode argument is an optional integer that specifies the accessibility checks to be performed. The following constants define the possible values of mode. It is possible to create a mask consisting of the bitwise OR of two or more values.
 * FileUtil.constants.F_OK - path is visible to the calling process. This is useful for determining if a file exists, but says nothing about rwx permissions. Default if no mode is specified.
 * FileUtil.constants.R_OK - path can be read by the calling process.
 * FileUtil.constants.W_OK - path can be written by the calling process.
 * FileUtil.constants.X_OK - path can be executed by the calling process. This has no effect on Windows (will behave like fs.constants.F_OK).
 * @returns {Promise.<undefined>}
 */
FileUtil.access = function (options) {
    if (_.isString(options)) {
        options = {path: options};
    }

    var path = _.get(options, 'path');

    if (_.isNil(path)) {
        throw new Error("Missing parameter: path");
    }

    path = _path.resolve(process.cwd(), path);
    var accessArgs = [path];


    var mode = _.get(options, 'mode');
    if (!_.isNil(mode)) {
        accessArgs.push(mode);
    }


    return new Promise(function (resolve, reject) {
        try {
            var callback = function (err) {
                if (err) {
                    return reject(err);
                } else {
                    return resolve();
                }
            };
            accessArgs.push(callback);

            fs.access.apply(null, accessArgs);
        } catch (err) {
            return reject(err);
        }
    });
};


/**
 * Asynchronously append data to a file, creating the file if it does not yet exist. data can be a string or a buffer.
 * @param options {object}
 * @param options.path {string|Buffer|number} - filename or file descriptor
 * @param options.data {string|Buffer}
 * @param [options.encoding] {string}
 * @param [options.mode] {number}
 * @param [options.flag] {string}
 * @returns {Promise.<undefined>}
 */
FileUtil.appendFile = function (options) {
    var path = _.get(options, 'path');

    if (_.isNil(path)) {
        throw new Error("Missing parameter: path");
    }

    path = _path.resolve(process.cwd(), path);

    var data = _.get(options, 'data');
    var appendFileArgs = [path, data];

    var encoding = _.get(options, 'encoding');
    var mode = _.get(options, 'mode');
    var flag = _.get(options, 'flag');

    var appendFileOptions = {encoding: encoding, mode: mode, flag: flag};
    appendFileOptions = _.omitBy(appendFileOptions, _.isUndefined);
    if (!_.isEmpty(appendFileOptions)) {
        appendFileArgs.push(appendFileOptions);
    }

    return new Promise(function (resolve, reject) {
        try {
            var callback = function (err) {
                if (err) {
                    return reject(err);
                }
                return resolve();
            };
            appendFileArgs.push(callback);
            fs.appendFile.apply(null, appendFileArgs);
        } catch (err) {
            return reject(err);
        }
    });
};


/**
 * Asynchronous {@link http://man7.org/linux/man-pages/man2/chmod.2.html|chmod(2)}.
 * @param options {object}
 * @param options.path {string}
 * @param options.mode {number}
 * @returns {Promise.<undefined>}
 */
FileUtil.chmod = function (options) {
    if (_.isString(options)) {
        options = {path: options};
    }

    var path = _.get(options, 'path');

    if (_.isNil(path)) {
        throw new Error("Missing parameter: path");
    }

    path = _path.resolve(process.cwd(), path);

    var mode = _.get(options, 'mode');

    return new Promise(function (resolve, reject) {
        try {

            var callback = function (err) {
                if (err) {
                    return reject(err);
                }
                return resolve();
            };
            fs.chmod(path, mode, callback)
        } catch (err) {
            return reject(err);
        }
    });
};

/**
 * Asynchronous {@link http://man7.org/linux/man-pages/man2/chown.2.html|chown(2)}.
 * @param options {object}
 * @param options.path {string}
 * @param options.uid {number}
 * @param options.gid {number}
 * @returns {Promise.<undefined>}
 */
FileUtil.chown = function (options) {
    if (_.isString(options)) {
        options = {path: options};
    }

    var path = _.get(options, 'path');

    if (_.isNil(path)) {
        throw new Error("Missing parameter: path");
    }

    path = _path.resolve(process.cwd(), path);

    var uid = _.get(options, 'uid');
    var gid = _.get(options, 'gid');


    return new Promise(function (resolve, reject) {
        try {

            var callback = function (err) {
                if (err) {
                    return reject(err);
                }
                return resolve();
            };
            fs.chown(path, uid, gid, callback)
        } catch (err) {
            return reject(err);
        }
    });
};


/**
 * Asynchronous {@link http://man7.org/linux/man-pages/man2/close.2.html|close(2)}.
 * @param options
 * @param options.fd
 * @returns {Promise.<undefined>}
 */
FileUtil.close = function (options) {
    var fd = _.get(options, 'fd');

    if (_.isNil(fd)) {
        throw new Error("Missing parameter: fd");
    }

    return new Promise(function (resolve, reject) {
        try {
            var callback = function (err) {
                if (err) {
                    return reject(err);
                }
                return resolve();
            };
            fs.close(fd, callback)
        } catch (err) {
            return reject(err);
        }
    });
};


/**
 * Returns a new ReadStream object.
 * @param options {object}
 * @param options.path {string|Buffer}
 * @param [options.flags] {string}
 * @param [options.encoding] {string}
 * @param [options.fd] {number}
 * @param [options.mode] {number}
 * @param [options.autoClose] {boolean}
 * @param [options.start] {number}
 * @param [options.end] {number}
 * @returns {Promise.<ReadStream>}
 */
FileUtil.createReadStream = function (options) {
    return new Promise(function (resolve, reject) {
        if (_.isString(options)) {
            options = {path: options};
        }

        var path = _.get(options, 'path');
        var fd = _.get(options, 'fd');

        if (_.isNil(path) && _.isNil(fd)) {
            throw new Error("Missing parameters: path or fd");
        }

        if (!_.isNil(path)) {
            path = _path.resolve(process.cwd(), path);
        }
        var createReadStreamArgs = [path];

        var flags = _.get(options, 'flags');
        var encoding = _.get(options, 'encoding');
        var mode = _.get(options, 'mode');
        var autoClose = _.get(options, 'autoClose');
        var start = _.get(options, 'start');
        var end = _.get(options, 'end');

        var createReadStreamOptions = {
            flags: flags,
            encoding: encoding,
            fd: fd,
            mode: mode,
            autoClose: autoClose,
            start: start,
            end: end
        };

        createReadStreamOptions = _.omitBy(createReadStreamOptions, _.isUndefined);
        if (!_.isEmpty(createReadStreamOptions)) {
            createReadStreamArgs.push(createReadStreamOptions);
        }

        try {

            var readStream = fs.createReadStream.apply(null, createReadStreamArgs);

            readStream.once('open', function () {
                return resolve(readStream);
            });

            readStream.once('readable', function () {
                return resolve(readStream);
            });

            readStream.once('error', function (err) {
                return reject(err);
            });
        } catch (err) {
            return reject(err);
        }
    });
};

/**
 * Returns a new WriteStream object.
 * @param options {object}
 * @param options.path {string|Buffer}
 * @param [options.flags] {string}
 * @param [options.defaultEncoding ] {string}
 * @param [options.fd] {number}
 * @param [options.mode] {number}
 * @param [options.autoClose] {boolean}
 * @param [options.start] {number}
 * @returns {Promise.<WriteStream>}
 */
FileUtil.createWriteStream = function (options) {
    if (_.isString(options)) {
        options = {path: options};
    }

    var path = _.get(options, 'path');
    var fd = _.get(options, 'fd');

    if (_.isNil(path) && _.isNil(fd)) {
        throw new Error("Missing parameters: path or fd");
    }

    if (!_.isNil(path)) {
        path = _path.resolve(process.cwd(), path);
    }

    var createWriteStreamArgs = [path];

    var flags = _.get(options, 'flags');
    var defaultEncoding = _.get(options, 'defaultEncoding');
    var mode = _.get(options, 'mode');
    var autoClose = _.get(options, 'autoClose');
    var start = _.get(options, 'start');

    var createWriteStreamOptions = {
        flags: flags,
        defaultEncoding: defaultEncoding,
        fd: fd,
        mode: mode,
        autoClose: autoClose,
        start: start
    };
    createWriteStreamOptions = _.omitBy(createWriteStreamOptions, _.isUndefined);
    if (!_.isEmpty(createWriteStreamOptions)) {
        createWriteStreamArgs.push(createWriteStreamOptions);
    }

    return new Promise(function (resolve, reject) {
        try {

            var writeStream = fs.createWriteStream.apply(this, createWriteStreamArgs);

            writeStream.once('open', function () {
                return resolve(writeStream);
            });

            writeStream.once('error', function (err) {
                return reject(err);
            });
        } catch (err) {
            return reject(err);
        }
    });
};

/**
 * Asynchronous {@link http://man7.org/linux/man-pages/man2/fchmod.2.html|fchmod(2)}.
 * @param options {object}
 * @param options.fd {number}
 * @param options.mode {number}
 * @returns {Promise.<undefined>}
 */
FileUtil.fchmod = function (options) {
    var fd = _.get(options, 'fd');


    if (_.isNil(fd)) {
        throw new Error("Missing parameter: fd");
    }


    var mode = _.get(options, 'mode');

    return new Promise(function (resolve, reject) {
        try {
            var callback = function (err) {
                if (err) {
                    return reject(err);
                }
                return resolve();
            };
            fs.fchmod(path, mode, callback)
        } catch (err) {
            return reject(err);
        }
    });
};

/**
 * Asynchronous {@link http://man7.org/linux/man-pages/man2/fchown.2.html|fchown(2)}.
 * @param options
 * @param options.fd
 * @param options.uid
 * @param options.gid
 * @returns {Promise.<undefined>}
 */
FileUtil.fchown = function (options) {
    var fd = _.get(options, 'fd');

    if (_.isNil(fd)) {
        throw new Error("Missing parameter: fd");
    }

    var uid = _.get(options, 'uid');
    var gid = _.get(options, 'gid');
    return new Promise(function (resolve, reject) {
        try {


            var callback = function (err) {
                if (err) {
                    return reject(err);
                }
                return resolve();
            };
            fs.fchown(fd, uid, gid, callback)
        } catch (err) {
            return reject(err);
        }
    });
};

/**
 * Asynchronous {@link http://man7.org/linux/man-pages/man2/fdatasync.2.html|fdatasync(2)}.
 * @param options
 * @param options.fd
 * @returns {Promise.<undefined>}
 */
FileUtil.fdatasync = function (options) {
    var fd = _.get(options, 'fd');

    if (_.isNil(fd)) {
        throw new Error("Missing parameter: fd");
    }

    return new Promise(function (resolve, reject) {
        try {
            var callback = function (err) {
                if (err) {
                    return reject(err);
                }
                return resolve();
            };
            fs.fdatasync(fd, callback)
        } catch (err) {
            return reject(err);
        }
    });
};

/**
 * Asynchronous {@link http://man7.org/linux/man-pages/man2/fstat.2.html|fstat(2)}.
 * @param options
 * @param options.fd
 * @returns {Promise.<Stats>}
 */
FileUtil.fstat = function (options) {
    var fd = _.get(options, 'fd');

    if (_.isNil(fd)) {
        throw new Error("Missing parameter: fd");
    }

    return new Promise(function (resolve, reject) {
        try {
            var callback = function (err) {
                if (err) {
                    return reject(err);
                }
                return resolve();
            };
            fs.fstat(fd, callback)
        } catch (err) {
            return reject(err);
        }
    });
};

/**
 * Asynchronous {@link http://man7.org/linux/man-pages/man2/fsync.2.html|fsync(2)}.
 * @param options
 * @param options.fd
 * @returns {Promise.<Stats>}
 */
FileUtil.fsync = function (options) {
    var fd = _.get(options, 'fd');

    if (_.isNil(fd)) {
        throw new Error("Missing parameter: fd");
    }


    return new Promise(function (resolve, reject) {
        try {


            var callback = function (err) {
                if (err) {
                    return reject(err);
                }
                return resolve();
            };
            fs.fsync(fd, callback)
        } catch (err) {
            return reject(err);
        }
    });
};

/**
 * Asynchronous {@link http://man7.org/linux/man-pages/man2/ftruncate.2.html|ftruncate(2)}.
 * @param options
 * @param options.fd
 * @param options.len {number}
 * @returns {Promise.<Stats>}
 */
FileUtil.ftruncate = function (options) {
    var fd = _.get(options, 'fd');

    if (_.isNil(fd)) {
        throw new Error("Missing parameter: fd");
    }

    var len = _.get(options, 'len');

    return new Promise(function (resolve, reject) {
        try {

            var callback = function (err) {
                if (err) {
                    return reject(err);
                }
                return resolve();
            };
            fs.ftruncate(fd, len, callback)
        } catch (err) {
            return reject(err);
        }
    });
};


/**
 * Change the file timestamps of a file referenced by the supplied file descriptor.
 * @param options
 * @param options.fd
 * @param options.len {number}
 * @returns {Promise.<Stats>}
 */
FileUtil.futimes = function (options) {
    var fd = _.get(options, 'fd');

    if (_.isNil(fd)) {
        throw new Error("Missing parameter: fd");
    }


    var atime = _.get(options, 'atime');
    var mtime = _.get(options, 'mtime');

    return new Promise(function (resolve, reject) {
        try {


            var callback = function (err) {
                if (err) {
                    return reject(err);
                }
                return resolve();
            };
            fs.futimes(fd, atime, mtime, callback)
        } catch (err) {
            return reject(err);
        }
    });
};


/**
 * Asynchronous {@link http://man7.org/linux/man-pages/man2/link.2.html|link(2)}.
 * @param options
 * @param options.srcPath {string}
 * @param options.destPath {string}
 * @returns {Promise.<Stats>}
 */
FileUtil.link = function (options) {
    var srcPath = _.get(options, 'srcPath');

    if (_.isNil(srcPath)) {
        throw new Error("Missing parameters: srcPath");
    }

    srcPath = _path.resolve(process.cwd(), srcPath);


    var destPath = _.get(options, 'destPath');

    if (_.isNil(destPath)) {
        throw new Error("Missing parameters: destPath");
    }


    destPath = _path.resolve(process.cwd(), destPath);


    return new Promise(function (resolve, reject) {
        try {

            var callback = function (err) {
                if (err) {
                    return reject(err);
                }
                return resolve();
            };
            fs.link(srcPath, destPath, callback)
        } catch (err) {
            return reject(err);
        }
    });
};


/**
 * Asynchronous {@link http://man7.org/linux/man-pages/man2/lstat.2.html|lstat(2)}. lstat() is identical to stat(), except that if path is a symbolic link, then the link itself is stat-ed, not the file that it refers to.
 * @param options
 * @param options.path
 * @returns {Promise.<Stats>}
 */
FileUtil.lstat = function (options) {


    if (_.isString(options)) {
        options = {path: options};
    }

    var path = _.get(options, 'path');

    if (_.isNil(path)) {
        throw new Error("Missing parameters: path");
    }

    path = _path.resolve(process.cwd(), path);

    return new Promise(function (resolve, reject) {
        try {

            var callback = function (err, stats) {
                if (err) {
                    return reject(err);
                }
                return resolve(stats);
            };

            fs.lstat(path, callback)
        } catch (err) {
            return reject(err);
        }
    });
};


/**
 * Asynchronous {@link http://man7.org/linux/man-pages/man2/mkdir.2.html|mkdir(2)}.
 * @param options {object}
 * @param options.path {string|Buffer}
 * @param [options.mode] {number}
 * @param [options.parents] {boolean}
 * @returns {Promise.<undefined>}
 */
FileUtil.mkdir = function (options) {
    if (_.isString(options)) {
        options = {path: options};
    }

    var path = _.get(options, 'path');


    if (_.isNil(path)) {
        throw new Error("Missing parameters: path");
    }

    path = _path.resolve(process.cwd(), path);

    var mode = _.get(options, 'mode');

    var parents = _.get(options, 'parents');

    if (parents) {
        var root = _path.parse(path).root;
        var currentPath = path;
        var directories = [];
        while (currentPath !== root) {
            directories.unshift(currentPath);
            currentPath = _path.dirname(currentPath);
        }

        return Promise.each(directories, function (directory) {
            return FileUtil.stat({path: directory})
                .catch(function (err) {
                    return null;
                })
                .then(function (stats) {
                    if (_.isNil(stats)) {
                        return FileUtil.mkdir({path: directory, mode: mode});
                    }
                });
        });
    } else {
        var mkdirArgs = [path];

        if (!_.isNil(mode)) {
            mkdirArgs.push(mode);
        }

        return new Promise(function (resolve, reject) {
            try {

                var callback = function (err) {
                    if (err) {
                        return reject(err);
                    }
                    return resolve();
                };
                mkdirArgs.push(callback);

                fs.mkdir.apply(null, mkdirArgs);
            }
            catch (err) {
                return reject(err);
            }
        });
    }

};


/**
 * Asynchronous {@link http://man7.org/linux/man-pages/man2/mkdir.2.html|mkdir(2)}. Will create all parent directories.
 * @param options {object}
 * @param options.path {string|Buffer}
 * @param [options.mode] {number}
 * @returns {Promise.<undefined>}
 */
FileUtil.mkdirp = function (options) {

    if (_.isString(options)) {
        options = {path: options};
    }

    var path = _.get(options, 'path');


    if (_.isNil(path)) {
        throw new Error("Missing parameters: path");
    }

    var mode = _.get(options, 'mode');

    return FileUtil.mkdir({path: path, mode: mode, parents: true});
};


/**
 * Creates a unique temporary directory.
 * Generates six random characters to be appended behind a required prefix to create a unique temporary directory.
 * @param options
 * @param options.prefix
 * @returns {Promise.<string>} The created folder path.
 */
FileUtil.mkdtemp = function (options) {
    if (_.isString(options)) {
        options = {path: options};
    }

    var prefix = _.get(options, 'prefix');


    if (_.isNil(prefix)) {
        throw new Error("Missing parameters: prefix");
    }


    prefix = _path.resolve(process.cwd(), prefix) + _path.sep;


    return new Promise(function (resolve, reject) {
        try {
            var callback = function (err, path) {
                if (err) {
                    return reject(err);
                }
                return resolve(path);
            };

            fs.mkdtemp(prefix, callback)
        } catch (err) {
            return reject(err);
        }
    });
};


/**
 * Asynchronous file open. See {@link http://man7.org/linux/man-pages/man2/open.2.html|open(2)}.
 * @param options
 * @param options.path {string}
 * @param options.flags {string} - flags can be:
 *
 * 'r' - Open file for reading. An exception occurs if the file does not exist.
 *
 * 'r+' - Open file for reading and writing. An exception occurs if the file does not exist.
 *
 * 'rs+' - Open file for reading and writing in synchronous mode. Instructs the operating system to bypass the local file system cache.
 *
 * This is primarily useful for opening files on NFS mounts as it allows you to skip the potentially stale local cache. It has a very real impact on I/O performance so don't use this flag unless you need it.
 *
 * Note that this doesn't turn fs.open() into a synchronous blocking call. If that's what you want then you should be using fs.openSync()
 *
 * 'w' - Open file for writing. The file is created (if it does not exist) or truncated (if it exists).
 *
 * 'wx' - Like 'w' but fails if path exists.
 *
 * 'w+' - Open file for reading and writing. The file is created (if it does not exist) or truncated (if it exists).
 *
 * 'wx+' - Like 'w+' but fails if path exists.
 *
 * 'a' - Open file for appending. The file is created if it does not exist.
 *
 * 'ax' - Like 'a' but fails if path exists.
 *
 * 'a+' - Open file for reading and appending. The file is created if it does not exist.
 *
 * 'ax+' - Like 'a+' but fails if path exists.
 * @param [options.mode] {number} - mode sets the file mode (permission and sticky bits), but only if the file was created. It defaults to 0666, readable and writable.
 * @returns {Promise.<number>} - File Descriptor
 */
FileUtil.open = function (options) {
    var path = _.get(options, 'path');


    if (_.isNil(path)) {
        throw new Error("Missing parameters: path");
    }


    path = _path.resolve(process.cwd(), path);

    var flags = _.get(options, 'flags');

    var openArgs = [path, flags];

    var mode = _.get(options, 'mode');
    if (!_.isNil(mode)) {
        openArgs.push(mode);
    }

    return new Promise(function (resolve, reject) {
        try {

            var callback = function (err, fd) {
                if (err) {
                    return reject(err);
                }
                return resolve(fd);
            };

            openArgs.push(callback);
            fs.open.apply(null, openArgs);

        } catch (err) {
            return reject(err);
        }
    });
};


/**
 * Read data from the file specified by fd.
 * @param options
 * @param options.fd {number}
 * @param options.buffer {Buffer}
 * @param options.offset {number}
 * @param options.length {number}
 * @param options.position {number}
 * @returns {Promise.<{bytesRead:number, buffer:Buffer}>}
 */
FileUtil.read = function (options) {
    var fd = _.get(options, 'fd');


    if (_.isNil(fd)) {
        throw new Error("Missing parameters: fd");
    }


    var buffer = _.get(options, 'buffer');
    var offset = _.get(options, 'offset');
    var length = _.get(options, 'length');
    var position = _.get(options, 'position');

    return new Promise(function (resolve, reject) {
        try {

            var callback = function (err, bytesRead, buffer) {
                if (err) {
                    return reject(err);
                }
                return resolve({bytesRead: bytesRead, buffer: buffer});
            };


            fs.read(fd, buffer, offset, length, position, callback);

        } catch (err) {
            return reject(err);
        }
    });
};


/**
 * Synchronous readdir(3). Returns an array of filenames excluding '.' and '..'.
 * @param options
 * @param options.path {string}
 * @param options.encoding {string}
 * @returns {Promise.<Array.<object|string>>}
 */
FileUtil.readdir = function (options) {
    if (_.isString(options)) {
        options = {path: options};
    }

    var path = _.get(options, 'path');


    if (_.isNil(path)) {
        throw new Error("Missing parameters: path");
    }


    path = _path.resolve(process.cwd(), path);
    var readdirArgs = [path];

    var encoding = _.get(options, 'encoding');
    var readdirOptions = {encoding: encoding};
    readdirOptions = _.omitBy(readdirOptions, _.isUndefined);
    if (!_.isEmpty(readdirOptions)) {
        readdirArgs.push(readdirOptions);
    }

    return new Promise(function (resolve, reject) {
        try {
            var callback = function (err, files) {
                if (err) {
                    return reject(err);
                }
                return resolve(files);
            };
            readdirArgs.push(callback);
            fs.readdir.apply(null, readdirArgs);
        } catch (err) {
            return reject(err);
        }
    });

};


/**
 * Asynchronously reads the entire contents of a file.
 * @param options
 * @param options.path {string|buffer|number} - filename or file descriptor
 * @param [options.encoding]
 * @param [options.flags]
 * @returns {Promise.<Buffer>}
 */
FileUtil.readFile = function (options) {
    if (_.isString(options)) {
        options = {path: options};
    }

    var path = _.get(options, 'path');


    if (_.isNil(path)) {
        throw new Error("Missing parameters: path");
    }


    path = _path.resolve(process.cwd(), path);
    var readFileArgs = [path];

    var encoding = _.get(options, 'encoding');
    var flags = _.get(options, 'flags');
    var readFileOptions = {encoding: encoding, flag: flags};
    readFileOptions = _.omitBy(readFileOptions, _.isUndefined);

    if (!_.isEmpty(readFileOptions)) {
        readFileArgs.push(readFileOptions);
    }

    return new Promise(function (resolve, reject) {
        try {
            var callback = function (err, data) {
                if (err) {
                    return reject(err);
                }
                return resolve(data);
            };

            readFileArgs.push(callback);

            fs.readFile.apply(null, readFileArgs);
        } catch (err) {
            return reject(err);
        }
    });

};


/**
 * Asynchronous {@link http://man7.org/linux/man-pages/man2/readlink.2.html|readlink(2)}.
 * @param options
 * @param options.path {string|buffer|number} - filename or file descriptor
 * @param [options.encoding] {string} - The optional options argument can be a string specifying an encoding, or an object with an encoding property specifying the character encoding to use for the link path passed to the callback. If the encoding is set to 'buffer', the link path returned will be passed as a Buffer object.
 * @returns {Promise.<string>}
 */
FileUtil.readlink = function (options) {
    if (_.isString(options)) {
        options = {path: options};
    }

    var path = _.get(options, 'path');


    if (_.isNil(path)) {
        throw new Error("Missing parameters: path");
    }


    path = _path.resolve(process.cwd(), path);
    var readlinkArgs = [path];

    var encoding = _.get(options, 'encoding');
    var readlinkOptions = {encoding: encoding};
    readlinkOptions = _.omitBy(readlinkOptions, _.isUndefined);

    if (!_.isEmpty(readlinkOptions)) {
        readlinkArgs.push(readlinkOptions);
    }

    return new Promise(function (resolve, reject) {
        try {
            var callback = function (err, linkString) {
                if (err) {
                    return reject(err);
                }
                return resolve(linkString);
            };

            readlinkArgs.push(callback);

            fs.readFile.readlink(null, readlinkArgs);
        } catch (err) {
            return reject(err);
        }
    });

};


/**
 * Asynchronous {@link http://man7.org/linux/man-pages/man3/realpath.3.html|realpath(3)}.
 * @param options
 * @param options.path {string|buffer|number} - filename or file descriptor
 * @param [options.encoding] {string} - The optional options argument can be a string specifying an encoding, or an object with an encoding property specifying the character encoding to use for the link path passed to the callback. If the encoding is set to 'buffer', the link path returned will be passed as a Buffer object.
 * @returns {Promise.<string>}
 */
FileUtil.realpath = function (options) {
    if (_.isString(options)) {
        options = {path: options};
    }

    var path = _.get(options, 'path');


    if (_.isNil(path)) {
        throw new Error("Missing parameters: path");
    }


    path = _path.resolve(process.cwd(), path);
    var realpathArgs = [path];

    var encoding = _.get(options, 'encoding');
    var realpathOptions = {encoding: encoding};
    realpathOptions = _.omitBy(realpathOptions, _.isUndefined);

    if (!_.isEmpty(realpathOptions)) {
        realpathArgs.push(realpathOptions);
    }

    return new Promise(function (resolve, reject) {
        try {
            var callback = function (err, linkString) {
                if (err) {
                    return reject(err);
                }
                return resolve(linkString);
            };

            realpathArgs.push(callback);

            fs.readFile.realpath(null, realpathArgs);
        } catch (err) {
            return reject(err);
        }
    });

};

/**
 * Asynchronous {@link http://man7.org/linux/man-pages/man2/rename.2.html|rename(2)}.
 * @param options
 * @param options.oldPath
 * @param options.newPath
 * @returns {Promise.<undefined>}
 */
FileUtil.rename = function (options) {
    var oldPath = _.get(options, 'oldPath');


    if (_.isNil(oldPath)) {
        throw new Error("Missing parameters: oldPath");
    }


    oldPath = _path.resolve(process.cwd(), oldPath);
    var newPath = _.get(options, 'newPath');


    if (_.isNil(newPath)) {
        throw new Error("Missing parameters: newPath");
    }

    newPath = _path.resolve(process.cwd(), newPath);

    return new Promise(function (resolve, reject) {
        try {
            fs.rename(oldPath, newPath, function (err) {
                if (err) {
                    return reject(err);
                }
                return resolve();
            })
        } catch (err) {
            return reject(err);
        }
    });
};


/**
 * Asynchronous {@link http://man7.org/linux/man-pages/man2/rmdir.2.html|rmdir(2)}.
 * @param options
 * @param options.path {string|Buffer}
 * @returns {Promise.<undefined>}
 */
FileUtil.rmdir = function (options) {
    if (_.isString(options)) {
        options = {path: options};
    }

    var path = _.get(options, 'path');

    if (_.isNil(path)) {
        throw new Error("Missing parameter: path");
    }

    path = _path.resolve(process.cwd(), path);

    return new Promise(function (resolve, reject) {
        try {
            fs.rmdir(path, function (err) {
                if (err) {
                    return reject(err);
                }
                return resolve();
            })
        } catch (err) {
            return reject(err);
        }
    });
};

/**
 * Asynchronous {@link http://man7.org/linux/man-pages/man2/stat.2.html|stat(2)}.
 * @param options
 * @param options.path {string}
 * @returns {Promise.<fs.Stats>}
 */
FileUtil.stat = function (options) {
    if (_.isString(options)) {
        options = {path: options};
    }

    var path = _.get(options, 'path');


    if (_.isNil(path)) {
        throw new Error("Missing parameter: path");
    }


    path = _path.resolve(process.cwd(), path);

    return new Promise(function (resolve, reject) {
        try {
            fs.stat(path, function (err, stats) {
                if (err) {
                    return reject(err);
                }
                return resolve(stats);
            })
        } catch (err) {
            return reject(err);
        }
    });
};


/**
 * Asynchronous {@link http://man7.org/linux/man-pages/man2/symlink.2.html|symlink(2)}.
 * @param options
 * @param options.target
 * @param options.path
 * @param [options.type]
 * @returns {Promise.<undefined>}
 */
FileUtil.symlink = function (options) {
    var target = _.get(options, 'target');

    if (_.isNil(target)) {
        throw new Error("Missing parameter: target");
    }


    target = _path.resolve(process.cwd(), target);
    var path = _.get(options, 'path');

    if (_.isNil(path)) {
        throw new Error("Missing parameter: path");
    }


    path = _path.resolve(process.cwd(), path);
    var symlinkArgs = [target, path];

    var type = _.get(options, 'type');
    if (!_.isUndefined(type)) {
        symlinkArgs.push(type);
    }

    return new Promise(function (resolve, reject) {
        try {
            var callback = function (err) {
                if (err) {
                    return reject(err);
                }
                return resolve();
            };
            symlinkArgs.push(callback);

            fs.symlink.apply(null, symlinkArgs);
        } catch (err) {
            return reject(err);
        }
    });
};


/**
 * Asynchronous {@link http://man7.org/linux/man-pages/man2/truncate.2.html|truncate(2)}.
 * @param options
 * @param options.path
 * @param options.len {number}
 * @returns {Promise.<fs.Stats>}
 */
FileUtil.truncate = function (options) {
    if (_.isString(options)) {
        options = {path: options};
    }

    var path = _.get(options, 'path');


    if (_.isNil(path)) {
        throw new Error("Missing parameter: path");
    }

    path = _path.resolve(process.cwd(), path);
    var len = _.get(options, 'len');

    return new Promise(function (resolve, reject) {
        try {

            var callback = function (err) {
                if (err) {
                    return reject(err);
                }
                return resolve();
            };
            fs.truncate(path, len, callback)
        } catch (err) {
            return reject(err);
        }
    });
};


/**
 * Asynchronous {@link http://man7.org/linux/man-pages/man2/unlink.2.html|unlink(2)}.
 * @param options
 * @param options.path
 * @returns {Promise.<undefined>}
 */
FileUtil.unlink = function (options) {
    if (_.isString(options)) {
        options = {path: options};
    }

    var path = _.get(options, 'path');

    if (_.isNil(path)) {
        throw new Error("Missing parameter: path");
    }

    path = _path.resolve(process.cwd(), path);

    return new Promise(function (resolve, reject) {
        try {
            var callback = function (err) {
                if (err) {
                    return reject(err);
                }
                return resolve();
            };
            fs.unlink(path, callback)
        } catch (err) {
            return reject(err);
        }
    });
};


/**
 * Stop watching for changes on filename.
 * @param options
 * @param options.path
 * @param [options.listener] {function} -  If listener is specified, only that particular listener is removed. Otherwise, all listeners are removed and you have effectively stopped watching filename.
 * @returns {Promise.<fs.Stats>}
 */
FileUtil.unwatchFile = function (options) {
    if (_.isString(options)) {
        options = {path: options};
    }

    var path = _.get(options, 'path');


    if (_.isNil(path)) {
        throw new Error("Missing parameter: path");
    }


    path = _path.resolve(process.cwd(), path);
    var unwatchFileArgs = [path];

    var listener = _.get(options, 'listener');
    if (!_.isNil(listener)) {
        unwatchFileArgs.push(listener);
    }


    return new Promise(function (resolve, reject) {
        try {
            var callback = function (err) {
                if (err) {
                    return reject(err);
                }
                return resolve();
            };
            unwatchFileArgs.push(callback);
            fs.unwatchFile.apply(null, unwatchFileArgs);
        } catch (err) {
            return reject(err);
        }
    });
};


/**
 * Stop watching for changes on filename.
 * @param options
 * @param options.path
 * @param options.atime
 * @param options.mtime
 * @returns {Promise.<fs.Stats>}
 */
FileUtil.utimes = function (options) {
    if (_.isString(options)) {
        options = {path: options};
    }

    var path = _.get(options, 'path');


    if (_.isNil(path)) {
        throw new Error("Missing parameter: path");
    }


    path = _path.resolve(process.cwd(), path);
    var atime = _.get(options, 'atime');
    var mtime = _.get(options, 'mtime');


    return new Promise(function (resolve, reject) {
        try {

            var callback = function (err) {
                if (err) {
                    return reject(err);
                }
                return resolve();
            };
            fs.utimes(path, atime, mtime, callback);
        } catch (err) {
            return reject(err);
        }
    });
};


/**
 * Write buffer to the file specified by fd.
 * @param options
 * @param options.fd {number}
 * @param options.buffer {Buffer}
 * @param options.offset {number}
 * @param options.length {number}
 * @param [options.position] {number}
 * @param [options.encoding] {number}
 * @returns {Promise.<{bytesWrite:number, buffer:Buffer}>}
 */
FileUtil.write = function (options) {
    var fd = _.get(options, 'fd');


    if (_.isNil(fd)) {
        throw new Error("Missing parameter: fd");
    }


    var buffer = _.get(options, 'buffer');
    var offset = _.get(options, 'offset');
    var length = _.get(options, 'length');
    var position = _.get(options, 'position');
    var encoding = _.get(options, 'encoding');

    return new Promise(function (resolve, reject) {
        try {

            var callback = function (err, written, buffer) {
                if (err) {
                    return reject(err);
                }
                return resolve({written: written, buffer: buffer});
            };

            if (!_.isNil(length)) {
                fs.write(fd, buffer, offset, length, position, callback);
            } else {
                fs.write(fd, buffer, position, encoding, callback);
            }
        } catch (err) {
            return reject(err);
        }
    });
};
/**
 * Watch for changes on filename, where filename is either a file or a directory.
 * @param options
 * @param options.path {string}
 * @param [options.persistent] {boolean}
 * @param [options.recursive] {boolean}
 * @param [options.encoding] {string}
 * @param [options.listener] {function}
 * @returns {Promise.<{fs.FSWatcher}>}
 */
FileUtil.watch = function (options) {
    if (_.isString(options)) {
        options = {path: options};
    }

    var path = _.get(options, 'path');

    if (_.isNil(path)) {
        throw new Error("Missing parameter: path");
    }


    path = _path.resolve(process.cwd(), path);
    var watchArgs = [path];

    var persistent = _.get(options, 'persistent');
    var recursive = _.get(options, 'recursive');
    var encoding = _.get(options, 'encoding');
    var watchOptions = {
        persistent: persistent,
        recursive: recursive,
        encoding: encoding
    };
    watchOptions = _.omitBy(watchOptions, _.isUndefined);
    if (!_.isEmpty(watchOptions)) {
        watchArgs.push(watchOptions);
    }

    var listener = _.get(options, 'listener');
    if (!_.isNil(listener)) {
        watchArgs.push(listener);
    }

    return new Promise(function (resolve, reject) {
        try {
            var fsWatcher = fs.watch.apply(null, watchArgs);
            resolve(fsWatcher);
        } catch (err) {
            return reject(err);
        }
    });
};

/**
 * Watch for changes on filename, where filename is either a file or a directory.
 * @param options
 * @param options.path {string}
 * @param [options.persistent] {boolean}
 * @param [options.interval]  {number}
 * @param options.listener {function}
 * @returns {Promise.<{fs.FSWatcher}>}
 */
FileUtil.watchFile = function (options) {
    if (_.isString(options)) {
        options = {path: options};
    }

    var path = _.get(options, 'path');

    if (_.isNil(path)) {
        throw new Error("Missing parameter: path");
    }


    path = _path.resolve(process.cwd(), path);
    var watchFileArgs = [path];

    var persistent = _.get(options, 'persistent');
    var interval = _.get(options, 'interval');
    var watchFileOptions = {
        persistent: persistent,
        interval: interval
    };
    watchFileOptions = _.omitBy(watchFileOptions, _.isUndefined);
    if (!_.isEmpty(watchFileOptions)) {
        watchFileArgs.push(watchFileOptions);
    }

    var listener = _.get(options, 'listener');
    if (!_.isNil(listener)) {
        watchFileArgs.push(listener);
    }

    return new Promise(function (resolve, reject) {
        try {
            fs.watchFile.apply(null, watchFileArgs);
            resolve();
        } catch (err) {
            return reject(err);
        }
    });
};


/**
 * Asynchronously writes data to a file, replacing the file if it already exists.
 * @param options
 * @param options.path {string|Buffer|number}
 * @param options.data {string|Buffer}
 * @param [options.encoding] {string}
 * @param [options.mode] {number}
 * @param [options.flags] {string}
 * @returns {Promise.<undefined>}
 */
FileUtil.writeFile = function (options) {
    if (_.isString(options)) {
        options = {path: options};
    }

    var path = _.get(options, 'path');

    if (_.isNil(path)) {
        throw new Error("Missing parameter: path");
    }


    path = _path.resolve(process.cwd(), path);

    var data = _.get(options, 'data');

    var writeFileArgs = [path, data];

    var encoding = _.get(options, 'encoding');
    var mode = _.get(options, 'mode');
    var flags = _.get(options, 'flags');
    var writeFileOptions = {
        encoding: encoding,
        mode: mode,
        flags: flags
    };
    writeFileOptions = _.omitBy(writeFileOptions, _.isUndefined);
    if (!_.isEmpty(writeFileOptions)) {
        writeFileArgs.push(writeFileOptions);
    }

    return new Promise(function (resolve, reject) {
        try {
            var callback = function (err) {
                if (err) {
                    return reject(err);
                }
                return resolve();
            };
            writeFileArgs.push(callback);
            fs.writeFile.apply(null, writeFileArgs);
        } catch (err) {
            return reject(err);
        }
    });

};


/**
 *
 * @param options
 * @param options.path
 * @returns {Promise.<boolean>}
 */
FileUtil.exists = function (options) {

    if (_.isString(options)) {
        options = {path: options};
    }

    var path = _.get(options, 'path');

    if (_.isNil(path)) {
        throw new Error("Missing parameter: path");
    }


    path = _path.resolve(process.cwd(), path);

    return FileUtil.stat(options)
        .then(function () {
            return true;
        })
        .catch(function (err) {
            if (err.code === 'ENOENT') {
                return false;
            } else {
                throw err;
            }
        })

};


/**
 *
 * @param options
 * @param options.sourcePath
 * @param options.destinationPath
 * @returns {Promise.<undefined>}
 */
FileUtil.copy = function (options) {

    // TODO: implement recursive copy
    var sourcePath = _.get(options, 'sourcePath');

    if (_.isNil(sourcePath)) {
        throw new Error("Missing parameter: sourcePath");
    }


    sourcePath = _path.resolve(process.cwd(), sourcePath);
    var destinationPath = _.get(options, 'destinationPath');

    if (_.isNil(destinationPath)) {
        throw new Error("Missing parameter: destinationPath");
    }

    destinationPath = _path.resolve(process.cwd(), destinationPath);

    return Promise.props({
        readStream: FileUtil.createReadStream(sourcePath),
        writeStream: FileUtil.createWriteStream(destinationPath)
    })
        .then(function (props) {
            var readStream = props.readStream;
            var writeStream = props.writeStream;
            return StreamUtil.pipe({source: readStream, target: writeStream});
        });
};

// TODO: implement move and move recursive


/**
 *
 * @param options
 * @param options.path
 * @param options.details
 * @param options.recursive
 * @returns {Promise.<Array.<object|string>>}
 */
FileUtil.ls = function (options) {
    if (_.isString(options)) {
        options = {path: options};
    }

    var path = _.get(options, 'path');


    if (_.isNil(path)) {
        throw new Error("Missing parameter: path");
    }
    path = _path.resolve(process.cwd(), path);

    var details = _.get(options, 'details', true);
    var recursive = _.get(options, 'recursive', true);

    var fileList = [];
    var callback = function (file, fileStats) {
        if (path === file && fileStats.isDirectory()) {
            return;
        }

        if (details) {
            fileList.push({
                path: file,
                isFile: fileStats.isFile(),
                isDirectory: fileStats.isDirectory(),
                mode: fileStats.mode,
                uid: fileStats.uid,
                gid: fileStats.gid,
                size: fileStats.size,
                atime: fileStats.atime,
                mtime: fileStats.mtime,
                ctime: fileStats.ctime,
                birthtime: fileStats.birthtime
            });
        } else {
            fileList.push(file);
        }
    };

    return FileUtil.walk({path: path, callback: callback, recursive: recursive})
        .then(function () {
            return fileList;
        });
};


/**
 *
 * @param options
 * @param options.path
 * @param options.recursive
 * @returns {Promise.<undefined>}
 */
FileUtil.rm = function (options) {
    if (_.isString(options)) {
        options = {path: options};
    }


    var path = _.get(options, 'path');


    if (_.isNil(path)) {
        throw new Error("Missing parameter: path");
    }
    path = _path.resolve(process.cwd(), path);
    var recursive = _.get(options, 'recursive');

    return FileUtil.ls({path: path, recursive: recursive, details: true})
        .then(function (fileList) {
            fileList.reverse();

            return Promise.each(fileList, function (file) {
                if (file.isDirectory) {
                    return FileUtil.rmdir({path: file.path});
                }
                else {
                    return FileUtil.unlink({path: file.path});
                }
            })
        });
};

/**
 *
 * @param options
 * @param options.path
 * @param options.callback
 * @param options.recursive
 * @returns {Promise.<undefined>}
 */
FileUtil.walk = function (options) {
    if (_.isString(options)) {
        options = {path: options};
    }

    var path = _.get(options, 'path');

    if (_.isNil(path)) {
        throw new Error("Missing parameter: path");
    }
    path = _path.resolve(process.cwd(), path);

    var callback = _.get(options, 'callback');
    var errorHandler = _.get(options, 'errorHandler');
    var recursive = _.get(options, 'recursive', true);


    if (_.isNil(errorHandler)) {
        errorHandler = function (err) {
            throw err;
        }
    }

    return FileUtil.stat({path: path})
        .catch(errorHandler)
        .then(function (pathStats) {
            callback(path, pathStats);

            if (!_.isNil(pathStats) && pathStats.isDirectory()) {
                var directoryQueue = [path];

                var whileLoop = Promise.method(function () {
                    if (directoryQueue.length > 0) {
                        var currentDirectory = directoryQueue.shift();

                        var processFile = function (file) {
                            var currentPath = _path.resolve(currentDirectory, file);
                            return FileUtil.stat({path: currentPath})
                                .catch(errorHandler)
                                .then(function (currentPathStats) {
                                    if (!_.isNil(currentPathStats)) {
                                        if (recursive && currentPathStats.isDirectory()) {
                                            directoryQueue.push(currentPath);
                                        }
                                    }

                                    callback(currentPath, currentPathStats);
                                });
                        };


                        return FileUtil.readdir({path: currentDirectory})
                            .then(function (currentDirectoryFiles) {
                                return Promise.each(currentDirectoryFiles, processFile);
                            })
                            .then(function () {
                                return whileLoop();
                            });
                    }
                });

                return whileLoop();
            }
        });
};


_.assign(FileUtil, _.mapValues(FileUtil, function (fn) {
    if (_.isFunction(fn)) {
        fn = Promise.method(fn);
    }
    return fn;
}));


FileUtil.constants = fs.constants;

/**
 *
 * @param obj
 * @returns {boolean}
 */
FileUtil.isReadStream = StreamUtil.isReadStream;

/**
 *
 * @param obj
 * @returns {boolean}
 */
FileUtil.isWriteStream = StreamUtil.isWriteStream;


module.exports = FileUtil;
