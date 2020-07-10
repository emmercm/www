'use strict';

/**
 * PHP array_values()
 *
 * @param {object} object
 * @returns {*[]}
 */
module.exports = (object) => Object.keys(object).map((key) => object[key]);
