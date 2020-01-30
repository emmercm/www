'use strict';

/**
 * Create an array out of all function parameters (except the Handlebars "options").
 *
 * @param values
 * @returns {*[]}
 */
module.exports = (...values) => values.slice(0, -1);
