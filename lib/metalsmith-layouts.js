'use strict';

const layouts = require('metalsmith-layouts');

const minimatch = require('minimatch');

module.exports = (...layoutsArgs) => {
    return (files, metalsmith, done) => {
        // Stop handlebars markup inside <code> blocks from getting rendered by adding some zero-width spaces
        Object.keys(files)
            .filter(minimatch.filter('**/*.html'))
            .forEach(filename => {
                files[filename].contents = Buffer.from(
                    files[filename].contents.toString()
                        .replace(/<code[^>]*?>(.+?)<\/code>/gs, val => val.replace(/([{}])/g, '$1\u200B'))
                );
            });

        layouts(...layoutsArgs)(files, metalsmith, (...doneArgs) => {
            // Remove zero-width spaces from above
            Object.keys(files)
                .filter(minimatch.filter('**/*.html'))
                .forEach(filename => {
                    files[filename].contents = Buffer.from(files[filename].contents.toString()
                        .replace(/([{}])\u200B+/g, '$1'));
                });

            done(...doneArgs);
        })
    };
};
