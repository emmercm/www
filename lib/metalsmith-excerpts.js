'use strict';

import excerpts from '@metalsmith/excerpts';

import he from 'he';

export default (...excerptsArgs) => {
    return (files, metalsmith, done) => {
        excerpts(...excerptsArgs)(files, metalsmith, (...doneArgs) => {
            // Sanitize terrible Cheerio/HTML output
            metalsmith.match('**/*.html', Object.keys(files))
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
