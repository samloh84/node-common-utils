const Promise = require('bluebird');
const _ = require('lodash');
const http = require('http');
const https = require('https');
const fs = require('fs');
const _path = require('path');


let HttpServerUtil = {};
/**
 *
 * @param options
 * @param options.requestListener {Function}
 * @param options.port {Number}
 * @param options.host {String}
 * @param options.backlog {Number}
 * @param options.path {String}
 * @param options.exclusive {Boolean}
 * @return {Promise<http.Server>}
 */
HttpServerUtil.createHttpServer = function (options) {
    let requestListener = _.get(options, 'requestListener');
    let port = _.get(options, 'port');
    let host = _.get(options, 'host');
    let backlog = _.get(options, 'backlog');
    let path = _.get(options, 'path');
    let exclusive = _.get(options, 'exclusive');

    return new Promise(function (resolve, reject) {
        try {
            let server = http.createServer(requestListener);

            server.listen({
                port: port,
                host: host,
                backlog: backlog,
                path: path,
                exclusive: exclusive
            }, function (err) {
                if (err) {
                    return reject(err);
                }

                return resolve(server);
            })

        } catch (err) {
            return reject(err);
        }

    });
};

/**
 *
 * @param options
 * @param options.requestListener {Function}
 * @param options.port {Number}
 * @param options.host {String}
 * @param options.backlog {Number}
 * @param options.path {String}
 * @param options.exclusive {Boolean}
 * @param options.pfx {String|Buffer}
 * @param options.key {String|String[]|Buffer|Buffer[]|{pem: String|Buffer,passphrase: String}[]}
 * @param options.passphrase {String}
 * @param options.cert {String|String[]|Buffer|Buffer[]}
 * @param options.ca {String|String[]|Buffer|Buffer[]}
 * @param options.crl {String|String[]|Buffer|Buffer[]}
 * @param options.ciphers {String}
 * @param options.honorCipherOrder {Boolean}
 * @param options.ecdhCurve {String}
 * @param options.dhparam {String|Buffer}
 * @param options.secureProtocol {String}
 * @param options.secureOptions {Number}
 * @param options.sessionIdContext {String}
 * @param options.handshakeTimeout {Number}
 * @param options.requestCert {Boolean}
 * @param options.rejectUnauthorized {Boolean}
 * @param options.NPNProtocols {String[]|Buffer}
 * @param options.ALPNProtocols {String[]|Buffer}
 * @param options.SNICallback {Function}
 * @param options.sessionTimeout {Number}
 * @param options.ticketKeys {Buffer}
 * @param options.readFiles {Boolean}
 * @return {Promise<https.Server>}
 */
HttpServerUtil.createHttpsServer = function (options) {
    let requestListener = _.get(options, 'requestListener');
    let port = _.get(options, 'port');
    let host = _.get(options, 'host');
    let backlog = _.get(options, 'backlog');
    let path = _.get(options, 'path');
    let exclusive = _.get(options, 'exclusive');

    let pfx = _.get(options, 'pfx');
    let key = _.get(options, 'key');
    let passphrase = _.get(options, 'passphrase');
    let cert = _.get(options, 'cert');
    let ca = _.get(options, 'ca');
    let crl = _.get(options, 'crl');
    let ciphers = _.get(options, 'ciphers');
    let honorCipherOrder = _.get(options, 'honorCipherOrder');
    let ecdhCurve = _.get(options, 'ecdhCurve');
    let dhparam = _.get(options, 'dhparam');
    let secureProtocol = _.get(options, 'secureProtocol');
    let secureOptions = _.get(options, 'secureOptions');
    let sessionIdContext = _.get(options, 'exclusive');

    let handshakeTimeout = _.get(options, 'handshakeTimeout');
    let requestCert = _.get(options, 'requestCert');
    let rejectUnauthorized = _.get(options, 'rejectUnauthorized');
    let NPNProtocols = _.get(options, 'NPNProtocols');
    let ALPNProtocols = _.get(options, 'ALPNProtocols');
    let SNICallback = _.get(options, 'SNICallback');
    let sessionTimeout = _.get(options, 'sessionTimeout');
    let ticketKeys = _.get(options, 'ticketKeys');

    let load = _.get(options, 'load', true);

    return new Promise(function (resolve, reject) {
        try {

            var createServerOptions = {
                handshakeTimeout: handshakeTimeout,
                requestCert: requestCert,
                rejectUnauthorized: rejectUnauthorized,
                NPNProtocols: NPNProtocols,
                ALPNProtocols: ALPNProtocols,
                SNICallback: SNICallback,
                sessionTimeout: sessionTimeout,
                ticketKeys: ticketKeys,
                pfx: pfx,
                key: key,
                passphrase: passphrase,
                cert: cert,
                ca: ca,
                crl: crl,
                ciphers: ciphers,
                honorCipherOrder: honorCipherOrder,
                ecdhCurve: ecdhCurve,
                dhparam: dhparam,
                secureProtocol: secureProtocol,
                secureOptions: secureOptions,
                sessionIdContext: sessionIdContext
            };

            if (load) {
                function loadFile(path) {
                    return fs.readFileSync(_path.resolve(process.cwd(), path));
                }

                _.each(['pfx', 'key', 'cert', 'ca', 'crl'], function (attribute) {
                    let path = _.get(createServerOptions, attribute);

                    if (_.isArray(path)) {
                        path = _.map(path, function (pathArrayElement) {
                            if (_.isString(pathArrayElement)) {
                                pathArrayElement = loadFile(pathArrayElement);
                            } else if (attribute == 'key' && _.isPlainObject(pathArrayElement) && _.isString(pathArrayElement.pem)) {
                                pathArrayElement.pem = loadFile(pathArrayElement);
                            }
                            return pathArrayElement;
                        });
                    } else if (_.isString(ca)) {
                        path = loadFile(ca);
                    }

                    _.set(createServerOptions, attribute, path);
                });
            }

            let server = https.createServer(createServerOptions, requestListener);

            var listenOptions = {
                port: port,
                host: host,
                backlog: backlog,
                path: path,
                exclusive: exclusive
            };

            var listenCallback = function (err) {
                if (err) {
                    return reject(err);
                }

                return resolve(server);
            };

            server.listen(listenOptions, listenCallback)
        } catch (err) {
            return reject(err);
        }

    });
};

HttpServerUtil.closeServer = function (server) {
    return new Promise(function (resolve, reject) {
        try {
            var address = server.address();
            var bind = typeof address === 'string'
                ? 'pipe ' + address
                : 'port ' + address.port;


            server.close(function () {
                console.log("Server listening on " + bind + " closed.");
                resolve();
            });
        } catch (err) {
            return reject(err);
        }
    });
};
HttpServerUtil.attachDefaultListeners = function (server) {


    server.on('error', function (err) {
        if (err.syscall !== 'listen') {
            throw err;
        }

        var bind = typeof port === 'string'
            ? 'Pipe ' + port
            : 'Port ' + port;

        // handle specific listen errors with friendly messages
        switch (err.code) {
            case 'EACCES':
                console.error(bind + ' requires elevated privileges\n' + err.stack);
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(bind + ' is already in use\n' + err.stack);
                process.exit(1);
                break;
            default:
                console.error(err.stack);
                throw err;
        }
    });

    server.once('listen', function () {
        var address = server.address();
        var bind = typeof address === 'string'
            ? 'pipe ' + address
            : 'port ' + address.port;

        console.info('Listening on ' + bind);
        console.info('NODE_ENV=' + process.env.NODE_ENV);
    });


};

module.exports = HttpServerUtil;