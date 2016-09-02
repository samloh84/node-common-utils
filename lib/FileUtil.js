const Promise = require('bluebird');
const _ = require('lodash');
const fs = require('fs');
const _path = require('path');
const sprintf = require('sprintf-js').sprintf;
const stream = require("stream");

var FileUtil = {};


/**
 *
 * @param options
 * @param options.path
 * @param options.mode
 * @returns {Promise.<undefined>}
 */
FileUtil.chmod = function (options) {
    if (_.isString(options)) {
        options = {path: options};
    }

    var path = _.get(options, 'path');
    path = _path.resolve(process.cwd(), path);

    var mode = _.get(options, 'mode');

    return new Promise(function (resolve, reject) {
        try {
            fs.chmod(path, mode, function (err) {
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
 *
 * @param options
 * @param options.path
 * @param options.uid
 * @param options.gid
 * @returns {Promise.<undefined>}
 */
FileUtil.chown = function (options) {
    if (_.isString(options)) {
        options = {path: options};
    }

    var path = _.get(options, 'path');
    path = _path.resolve(process.cwd(), path);

    var uid = _.get(options, 'uid');
    var gid = _.get(options, 'gid');


    return new Promise(function (resolve, reject) {
        try {
            fs.chown(path, uid, gid, function (err) {
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
 *
 * @param options
 * @param options.path
 * @param options.flags
 * @param options.encoding
 * @param options.fd
 * @param options.mode
 * @param options.autoClose
 * @param options.start
 * @param options.end
 * @returns {Promise.<ReadStream>}
 */
FileUtil.createReadStream = function (options) {
    if (_.isString(options)) {
        options = {path: options};
    }

    var path = _.get(options, 'path');
    path = _path.resolve(process.cwd(), path);

    var flags = _.get(options, 'flags');
    var encoding = _.get(options, 'encoding');
    var fd = _.get(options, 'fd');
    var mode = _.get(options, 'mode');
    var autoClose = _.get(options, 'autoClose');
    var start = _.get(options, 'start');
    var end = _.get(options, 'end');


    return new Promise(function (resolve, reject) {
        try {
            var readStream = fs.createReadStream(path, {
                flags: flags,
                encoding: encoding,
                fd: fd,
                mode: mode,
                autoClose: autoClose,
                start: start,
                end: end
            });

            readStream.once('open', function () {
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
 *
 * @param options
 * @param options.path
 * @param options.flags
 * @param options.defaultEncoding
 * @param options.fd
 * @param options.mode
 * @param options.autoClose
 * @param options.start
 * @returns {Promise.<WriteStream>}
 */
FileUtil.createWriteStream = function (options) {
    if (_.isString(options)) {
        options = {path: options};
    }

    var path = _.get(options, 'path');
    path = _path.resolve(process.cwd(), path);

    var flags = _.get(options, 'flags');
    var defaultEncoding = _.get(options, 'defaultEncoding');
    var fd = _.get(options, 'fd');
    var mode = _.get(options, 'mode');
    var autoClose = _.get(options, 'autoClose');
    var start = _.get(options, 'start');

    return new Promise(function (resolve, reject) {
        try {
            var writeStream = fs.createWriteStream(path, {
                flags: flags,
                defaultEncoding: defaultEncoding,
                fd: fd,
                mode: mode,
                autoClose: autoClose,
                start: start
            });

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
 *
 * @param options
 * @param options.path
 * @param options.mode
 * @returns {Promise.<undefined>}
 */
FileUtil.mkdir = function (options) {
    if (_.isString(options)) {
        options = {path: options};
    }

    var path = _.get(options, 'path');
    path = _path.resolve(process.cwd(), path);

    var mode = _.get(options, 'mode');

    return new Promise(function (resolve, reject) {
        try {
            fs.mkdir(path, mode, function (err) {
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
 *
 * @param options
 * @param options.path
 * @param options.mode
 * @returns {Promise.<undefined>}
 */
FileUtil.mkdirp = function (options) {
    if (_.isString(options)) {
        options = {path: options};
    }

    var path = _.get(options, 'path');
    path = _path.resolve(process.cwd(), path);

    var mode = _.get(options, 'mode');

    var root = _path.parse(path).root;
    var currentPath = path;
    var directories = [];
    while (currentPath !== root) {
        directories.unshift(currentPath);
        currentPath = _path.dirname(currentPath);
    }

    return Promise.each(directories, function (directory) {
        return FileUtil.stat({path: directory})
            .catch(function () {
                return null;
            })
            .then(function (stats) {
                if (_.isNil(stats)) {
                    return FileUtil.mkdir({path: directory, mode: mode});
                } else if (stats.isFile()) {
                    throw new Error("Invalid Path: " + directory);
                }
            })
    });

};


/**
 *
 * @param options
 * @param options.path
 * @returns {Promise.<[{}]>}
 */
FileUtil.readdir = function (options) {
    if (_.isString(options)) {
        options = {path: options};
    }

    var path = _.get(options, 'path');
    path = _path.resolve(process.cwd(), path);

    return new Promise(function (resolve, reject) {
        try {
            fs.readdir(path, function (err, files) {
                if (err) {
                    return reject(err);
                }
                return resolve(files);
            })
        } catch (err) {
            return reject(err);
        }
    });

};


/**
 *
 * @param options
 * @param options.path
 * @param options.encoding
 * @param options.flags
 * @returns {Promise.<Buffer>}
 */
FileUtil.readFile = function (options) {
    if (_.isString(options)) {
        options = {path: options};
    }

    var path = _.get(options, 'path');
    path = _path.resolve(process.cwd(), path);

    var encoding = _.get(options, 'encoding');
    var flags = _.get(options, 'flags');

    return new Promise(function (resolve, reject) {
        try {
            fs.readFile(path, {encoding: encoding, flag: flags}, function (err, data) {
                if (err) {
                    return reject(err);
                }
                return resolve(data);
            })
        } catch (err) {
            return reject(err);
        }
    });

};


/**
 *
 * @param options
 * @param options.path
 * @param options.data
 * @param options.encoding
 * @param options.mode
 * @param options.flags
 * @returns {Promise.<undefined>}
 */
FileUtil.writeFile = function (options) {
    if (_.isString(options)) {
        options = {path: options};
    }

    var path = _.get(options, 'path');
    path = _path.resolve(process.cwd(), path);

    var data = _.get(options, 'data');

    var encoding = _.get(options, 'encoding');
    var mode = _.get(options, 'mode');
    var flags = _.get(options, 'flags');

    return new Promise(function (resolve, reject) {
        try {
            fs.writeFile(path, data, {
                encoding: encoding,
                mode: mode,
                flag: flags
            }, function (err) {
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
 *
 * @param options
 * @param options.path
 * @returns {Promise.<fs.Stats>}
 */
FileUtil.stat = function (options) {
    if (_.isString(options)) {
        options = {path: options};
    }

    var path = _.get(options, 'path');
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
    path = _path.resolve(process.cwd(), path);

    return FileUtil.stat(options)
        .then(function () {
            return true;
        })
        .catch(function (err) {
            return err.code !== 'ENOENT';
        })

};


/**
 *
 * @param options
 * @param options.oldPath
 * @param options.newPath
 * @returns {Promise.<undefined>}
 */
FileUtil.rename = function (options) {
    var oldPath = _.get(options, 'oldPath');
    oldPath = _path.resolve(process.cwd(), oldPath);
    var newPath = _.get(options, 'newPath');
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
 *
 * @param options
 * @param options.path
 * @returns {Promise.<undefined>}
 */
FileUtil.unlink = function (options) {
    if (_.isString(options)) {
        options = {path: options};
    }

    var path = _.get(options, 'path');
    path = _path.resolve(process.cwd(), path);

    return new Promise(function (resolve, reject) {
        try {
            fs.unlink(path, function (err) {
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
 *
 * @param options
 * @param options.sourcePath
 * @param options.destinationPath
 * @returns {Promise.<undefined>}
 */
FileUtil.copy = function (options) {
    var sourcePath = _.get(options, 'sourcePath');
    sourcePath = _path.resolve(process.cwd(), sourcePath);
    var destinationPath = _.get(options, 'destinationPath');
    destinationPath = _path.resolve(process.cwd(), destinationPath);

    return Promise.props({
        readStream: FileUtil.createReadStream(sourcePath),
        writeStream: FileUtil.createWriteStream(destinationPath)
    })
        .then(function (props) {
            var readStream = props.readStream;
            var writeStream = props.writeStream;

            return new Promise(function (resolve, reject) {
                writeStream.once('finish', function () {
                    return resolve();
                });
                writeStream.once('close', function () {
                    return resolve();
                });

                readStream.once('error', function (err) {
                    return reject(err);
                });

                readStream.pipe(writeStream);
            });
        });

};


/**
 *
 * @param options
 * @param options.path
 * @param options.details
 * @param options.recursive
 * @returns {Promise.<[{}]>}
 */
FileUtil.ls = function (options) {
    if (_.isString(options)) {
        options = {path: options};
    }

    var path = _.get(options, 'path');
    var details = _.get(options, 'details', true);
    path = _path.resolve(process.cwd(), path);
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
 * @returns {Promise.<undefined>}
 */
FileUtil.rmdir = function (options) {
    if (_.isString(options)) {
        options = {path: options};
    }

    var path = _.get(options, 'path');
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


    var path = _.get(options, 'path', '');
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

    var path = _.get(options, 'path', '');
    var callback = _.get(options, 'callback');
    var recursive = _.get(options, 'recursive', true);

    path = _path.resolve(process.cwd(), path);

    return FileUtil.stat({path: path})
        .catch(function (err) {
            throw new Error(sprintf("Path %s does not exist", path));
        })
        .then(function (pathStats) {
            callback(path, pathStats);
            if (pathStats.isDirectory()) {
                var directoryQueue = [path];

                var whileLoop = Promise.method(function () {
                    if (directoryQueue.length > 0) {
                        var currentDirectory = directoryQueue.shift();
                        return FileUtil.readdir({path: currentDirectory})
                            .then(function (currentDirectoryFiles) {
                                return Promise.each(currentDirectoryFiles, function (file) {
                                    var currentPath = _path.resolve(currentDirectory, file);
                                    return FileUtil.stat({path: currentPath})
                                        .then(function (currentPathStats) {
                                            if (recursive && currentPathStats.isDirectory()) {
                                                directoryQueue.push(currentPath);
                                            }

                                            callback(currentPath, currentPathStats);
                                        });
                                });
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


/**
 *
 * @param obj
 * @returns {boolean}
 */
FileUtil.isReadStream = function (obj) {
    return obj instanceof stream.Stream && (typeof obj._read) === 'function' && (typeof obj._readableState) === 'object';
};

/**
 *
 * @param obj
 * @returns {boolean}
 */
FileUtil.isWriteStream = function (obj) {
    return obj instanceof stream.Stream && (typeof obj._write) === 'function' && (typeof obj._writeableState) === 'object';
};


module.exports = FileUtil;
