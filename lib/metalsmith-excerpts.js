'use strict';

const excerpts = require('@metalsmith/excerpts');

const he        = require('he');
const minimatch = require('minimatch');

module.exports = (...excerptsArgs) => {
    return (files, metalsmith, done) => {
        excerpts(...excerptsArgs)(files, metalsmith, (...doneArgs) => {
            // Sanitize terrible Cheerio/HTML output
            Object.keys(files)
                .filter(minimatch.filter('**/*.html'))
                .forEach(filename => {
                    files[filename].excerpt = he.decode(
                        files[filename].excerpt
                            .replace(/<[^/][^>]*>/g, ' ') // HTML start tags
                            .replace(/<\/[^>]*>/g, '') // HTML end tags
                            .replace(/[ ][ ]+/g, ' ') // multiple spaces in a row
                            .trim() // leading/trailing whitespace
                    )
                });

            done(...doneArgs);
        });
    };
};
