'use strict';

/**
 * Perform a global regex replacement on a string.
 *
 * @param {string} str
 * @param {string} pattern
 * @param {string} replacement
 * @returns {string}
 */
module.exports = (str, pattern, replacement) => {
    if (typeof str !== 'string') {
        return '';
    }

    if (typeof pattern !== 'string') {
        return str;
    }

    if (typeof replacement !== 'string') {
        replacement = '';
    }

    return str.replace(new RegExp(pattern, 'g'), replacement);
};
