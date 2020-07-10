'use strict';

const jsonld = require('metalsmith-jsonld');

module.exports = (siteURL, options) => {
    return (files, metalsmith, done) => {
        /* **** BEFORE ACTIONS ***** */

        Object.keys(files)
            .forEach((filename) => {
                // Set URL in frontmatter
                if (files[filename].paths) {
                    files[filename].url = `${siteURL}${files[filename].paths.href}`;
                }

                // Fix https://github.com/thinktandem/metalsmith-jsonld/issues/2
                if (files[filename].tags) {
                    files[filename].tags = files[filename].tags.map(tag => ({
                        name: tag
                    }));
                }
            });

        jsonld(options)(files, metalsmith, (...args) => {
            /* **** AFTER ACTIONS ***** */

            Object.keys(files)
                .forEach((filename) => {
                    // Fix https://github.com/thinktandem/metalsmith-jsonld/issues/2
                    if (files[filename].tags) {
                        files[filename].tags = files[filename].tags.split(',')
                    }

                    // Make the output of metalsmith-metalsmithJsonld actually usable...
                    if (files[filename].jsonld) {
                        files[filename].jsonld = `<script type="application/ld+json">${
                            JSON.stringify({
                                '@context': 'http://schema.org',
                                '@graph': files[filename].jsonld
                                    .map((item) => {
                                        if (item['@context']) {
                                            delete item['@context'];
                                        }
                                        return item;
                                    })
                            })
                        }</script>`;
                    }
                });

            done(...args);
        });
    };
};
