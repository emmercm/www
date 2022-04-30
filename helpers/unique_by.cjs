'use strict';

module.exports = (array, key) => {
    const seenKeys = [];
    return array.reduce((acc, val) => {
        if (seenKeys.indexOf(val[key]) === -1) {
            acc.push(val);
            seenKeys.push(val[key]);
        }
        return acc;
    }, []);
}
