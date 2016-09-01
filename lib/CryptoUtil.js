const _ = require('lodash');
const crypto = require('crypto');

/**
 *
 * @param options
 * @param options.algorithm
 * @param options.password
 * @param options.initializationVectorLength
 * @constructor
 */
var CryptoUtil = function (options) {
    var instance = this;

    if (_.isNil(options)) {
        options = {};
    }

    instance._algorithm = _.get(options, 'algorithm', 'aes-256-cbc');
    instance._password = new Buffer(_.get(options, 'password'), 'hex');
    instance._initializationVectorLength = _.get(options, 'initializationVectorLength', 16);

};

/**
 *
 * @param data {*}
 * @return {Buffer}
 */
CryptoUtil.prototype.encrypt = function (data) {
    if (_.isNil(data) || _.isEmpty(data)) {
        return data;
    }

    try {
        var instance = this;

        var initializationVector = CryptoUtil.randomBytes(instance._initializationVectorLength);
        var cipher = crypto.createCipheriv(instance._algorithm, instance._password, initializationVector);
        cipher.end(JSON.stringify(data), 'utf-8');
        return Buffer.concat([initializationVector, cipher.read()]);
    } catch (error) {
        throw error;
    }
};


/**
 *
 * @param data {Buffer}
 * @return {*}
 */
CryptoUtil.prototype.decrypt = function (data) {
    if (_.isNil(data) || _.isEmpty(data) || !_.isBuffer(data)) {
        return data;
    }

    try {
        var instance = this;

        var buffer = new Buffer(data);

        var initializationVector = buffer.slice(0, instance._initializationVectorLength);
        data = buffer.slice(instance._initializationVectorLength);
        var decipher = crypto.createDecipheriv(instance._algorithm, instance._password, initializationVector);
        data = decipher.update(data, undefined, 'utf8') + decipher.final('utf8');
        return JSON.parse(data);
    } catch (error) {
        throw error;
    }

};


/**
 *
 * @param bytes {number}
 * @returns {Buffer}
 */
CryptoUtil.randomBytes = CryptoUtil.prototype.randomBytes = function (bytes) {
    if (_.isNil(bytes)) {
        bytes = 8;
    }

    return crypto.randomBytes(bytes);
};
/**
 *
 * @param bytes {number}
 * @returns {String}
 */
CryptoUtil.randomByteString = CryptoUtil.prototype.randomHexString = function (bytes) {
    if (_.isNil(bytes)) {
        bytes = 8;
    }

    return (new Buffer(CryptoUtil.randomBytes(bytes))).toString('hex');
};


module.exports = CryptoUtil;
