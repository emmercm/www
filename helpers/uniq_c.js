'use strict';

/**
 * Count the unique occurrences of strings in an array.
 *
 * @param {Array} array
 * @returns {object}
 */
module.exports = (array) => {
    return array.reduce((acc, val) => {
        if (!(val in acc)) {
            acc[val] = 1;
        } else {
            acc[val]++;
        }
        return acc;
    }, {});
};
