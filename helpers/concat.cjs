'use strict';

/**
 * Concat all function parameters together (except the Handlebars "options").
 *
 * @param values
 * @returns {string}
 */
module.exports = (...values) => values.slice(0, -1).join('');
