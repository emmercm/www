'use strict';

/**
 * Return the first truthy parameter.
 *
 * @param values
 * @returns {*|null}
 */
module.exports = (...values) => {
    // Note: last parameter is Handlebars "options", we don't want that
    for (let i = 0; i < values.length - 1; i++) {
        if (values[i]) {
            return values[i];
        }
    }
    return null;
};
