'use strict';

/**
 * Reverse an array or a string.
 *
 * Note: necessary because handlebars-helpers defines this function twice.
 *
 * @param {string|Array}val
 * @returns {string|*}
 */
module.exports = (val) => {
    if (Array.isArray(val)) {
        val.reverse();
        return val;
    }
    if (val && typeof val === 'string') {
        return val.split('').reverse().join('');
    }
};
