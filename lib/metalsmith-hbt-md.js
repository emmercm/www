'use strict';

import hbtmd from 'metalsmith-hbt-md';

export default (...hbtmdArgs) => {
    return (files, metalsmith, done) => {
        // Stop handlebars markup inside markdown code blocks from getting rendered by adding some zero-width spaces
        metalsmith.match('**/*.md', Object.keys(files))
            .forEach(filename => {
                files[filename].contents = Buffer.from(
                    files[filename].contents.toString()
                        .replace(/```(.+?)```/gs, val => val.replace(/([{}])/g, '$1\u200B'))
                        .replace(/`([^`]*?)`/g, val => val.replace(/([{}])/g, '$1\u200B'))
                );
            });
        metalsmith.match('**/*.html', Object.keys(files))
            .forEach(filename => {
                files[filename].contents = Buffer.from(
                    files[filename].contents.toString()
                        .replace(/<code[^>]*?>(.+?)<\/code>/gs, val => val.replace(/([{}])/g, '$1\u200B'))
                );
            });

        hbtmd(...hbtmdArgs)(files, metalsmith, (...doneArgs) => {
            // Remove zero-width spaces from above
            metalsmith.match('**/*.@(md|html)', Object.keys(files))
                .forEach(filename => {
                    files[filename].contents = Buffer.from(files[filename].contents.toString()
                        .replace(/([{}])\u200B+/g, '$1'));
                });

            done(...doneArgs);
        })
    };
};
