const _ = require('lodash');
const moment = require('moment');

var RandomUtil = {};

/**
 *
 * @param array {[*]}
 * @returns {*}
 */
RandomUtil.arrayValue = function randomArrayValue(array) {
    return _.sample(array);
};

/**
 *
 * @param length
 * @param options
 * @param options.alpha
 * @param options.alphanumeric
 * @param options.lowercaseAlpha
 * @param options.uppercaseAlpha
 * @param options.hexadecimal
 *
 * @returns {string}
 */
RandomUtil.string = function randomString(length, options) {
    const lowercaseAlpha = 'abcdefghijklmnopqrstuvwxyz'.split('');
    const uppercaseAlpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const numeric = '0123456789'.split('');
    const hexadecimal = 'abcdef0123456789'.split('');

    if (_.isNil(options)) {
        options = {};
    }

    var characterRanges = [];

    if (options.hexadecimal) {
        characterRanges.push(hexadecimal);

    } else {
        if (_.isEmpty(options) || options.alpha || options.alphanumeric || options.lowercaseAlpha) {
            characterRanges.push(lowercaseAlpha);
        }
        if (_.isEmpty(options) || options.alpha || options.alphanumeric || options.uppercaseAlpha) {
            characterRanges.push(uppercaseAlpha);
        }
        if (_.isEmpty(options) || options.numeric || options.alphanumeric) {
            characterRanges.push(numeric);
        }

    }

    var string = [];
    for (var i = 0; i < length; i++) {
        string.push(_.sample(_.sample(characterRanges)));
    }

    return string.join('');
};

/**
 *
 * @param min
 * @param max
 * @returns {*}
 */
RandomUtil.decimal = function randomDecimal(min, max) {
    var args = _.toArray(arguments);
    if (args.length < 2) {
        max = args[0];
        min = 0;
    }

    if (_.isNil(min) && _.isNil(max)) {
        min = 0;
        max = 1;
    }

    return (Math.random() * (max - min)) + min;
};


/**
 *
 * @param min
 * @param max
 * @returns {number}
 */
RandomUtil.integer = function randomInteger(min, max) {
    var args = _.toArray(arguments);
    if (args.length < 2) {
        max = args[0];
        min = 0;
    }

    if (_.isNil(min) && _.isNil(max)) {
        min = 0;
        max = 1;
    }

    return Math.round(RandomUtil.decimal(min, max));
};

/**
 *
 * @returns {boolean}
 */
RandomUtil.boolean = function () {
    return _.sample([true, false]);
};


/**
 *
 * @param min
 * @param max
 * @returns {*}
 */
RandomUtil.timestamp = function randomTimestamp(min, max) {

    if (moment.isMoment(min)) {
        min = min.unix();
    } else {
        min = moment(min).unix();
    }

    if (moment.isMoment(max)) {
        max = max.unix();
    } else {
        max = moment(max).unix();
    }

    return RandomUtil.integer(min, max);
};


/**
 *
 * @param min
 * @param max
 * @returns {*}
 */
RandomUtil.date = function randomDate(min, max) {
    return moment.unix(RandomUtil.timestamp(min, max));
};

/**
 *
 * @param length
 * @param generatorFunction
 * @param options
 * @returns {Array}
 */
RandomUtil.repeat = function repeat(length, generatorFunction, options) {
    var args = _.toArray(arguments);
    var generatorFunctionArgs = args.slice(2);

    var array = [];
    for (var i = 0; i < length; i++) {
        array.push(generatorFunction.apply(this, generatorFunctionArgs));
    }

    return array;
};


module.exports = RandomUtil;
