'use strict';

import hbtmd from 'metalsmith-hbt-md';

import minimatch from 'minimatch';

export default (...hbtmdArgs) => {
    return (files, metalsmith, done) => {
        // Stop handlebars markup inside markdown code blocks from getting rendered by adding some zero-width spaces
        Object.keys(files)
            .filter(minimatch.filter('**/*.md'))
            .forEach(filename => {
                files[filename].contents = Buffer.from(
                    files[filename].contents.toString()
                        .replace(/```(.+?)```/gs, val => val.replace(/([{}])/g, '$1\u200B'))
                        .replace(/`([^`]*?)`/g, val => val.replace(/([{}])/g, '$1\u200B'))
                );
            });
        Object.keys(files)
            .filter(minimatch.filter('**/*.html'))
            .forEach(filename => {
                files[filename].contents = Buffer.from(
                    files[filename].contents.toString()
                        .replace(/<code[^>]*?>(.+?)<\/code>/gs, val => val.replace(/([{}])/g, '$1\u200B'))
                );
            });

        hbtmd(...hbtmdArgs)(files, metalsmith, (...doneArgs) => {
            // Remove zero-width spaces from above
            Object.keys(files)
                .filter(minimatch.filter('**/*.@(md|html)'))
                .forEach(filename => {
                    files[filename].contents = Buffer.from(files[filename].contents.toString()
                        .replace(/([{}])\u200B+/g, '$1'));
                });

            done(...doneArgs);
        })
    };
};
