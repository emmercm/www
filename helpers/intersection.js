'use strict';

/**
 * PHP array_intersect_key()
 *
 * @param {object} object1
 * @param {object} object2
 */
module.exports = (object1, object2) => {
    return Object.keys(object1)
        .filter(key => key in object2)
        .reduce((obj, key) => {
            obj[key] = object1[key];
            return obj;
        });
};
