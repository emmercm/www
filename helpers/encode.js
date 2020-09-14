const he = require('he');

/**
 * Encode a string to use HTML entities.
 *
 * @param {string} val
 * @returns {string}
 */
module.exports = (val) => he.encode(val);
