'use strict';

const {DateTime} = require('luxon');

const parseDate = (text) => {
    if (text instanceof Date) {
        let date = DateTime.fromJSDate(text);
        if (date.isValid) {
            return date;
        }
    }

    let date = DateTime.fromISO(text);
    if (date.isValid) {
        return date;
    }

    date = DateTime.fromRFC2822(text);
    if (date.isValid) {
        return date;
    }

    return DateTime.local();
};

module.exports = (str, pattern, options) => {
    // Param massaging
    if (typeof pattern === 'object' && typeof pattern.hash === 'object') {
        options = pattern;
        pattern = null;
    }
    if (typeof str === 'object' && typeof str.hash === 'object') {
        options = str;
        pattern = null;
        str = null;
    }

    const date = parseDate(str).setLocale('en');
    const now = DateTime.local().setLocale('en');

    // Zero params passed, give a default "now" response
    if (!str && !pattern) {
        return now.toLocaleString(DateTime.DATE_FULL);
    }

    // First param is an object (date), give formatted response
    if (typeof str === 'object') {
        if (pattern) {
            return date.toFormat(pattern);
        } else {
            return date.toISO();
        }
    }

    // One param passed (string), use it as format string
    if (typeof str === 'string' && !pattern) {
        return now.toLocaleString(DateTime.DATE_FULL);
    }

    // Two params passed, give formatted response
    return date.toFormat(pattern);
};
