'use strict';

/**
 * Create an array out of all function arguments.
 *
 * Note: last parameter is Handlebars "options", we don't want that.
 *
 * @param values
 * @returns {*[]}
 */
module.exports = (...values) => values.slice(0, -1);
