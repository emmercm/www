'use strict';

import async from 'async';
import cheerio from 'cheerio';
import deepmerge from 'deepmerge';
import Unsplash from 'unsplash-js';

import fetch from 'node-fetch';
if (!globalThis.fetch) {
    globalThis.fetch = fetch;
}

const getPhotoId = (patterns, url) => {
    for (let i = 0; i < patterns.length; i++) {
        const pattern = patterns[i];
        const matches = url.match(pattern);
        if (matches) {
            return matches[1];
        }
    }
}

const generateHtml = (response, options) => {
    const url = new URL(response.urls[options.photoUrl]);
    Object.keys(options.queryParams).forEach((param) => url.searchParams.set(param, options.queryParams[param]));
    // TODO: merge query params from the original URL in

    const description = response.description || response.alt_description;
    const img = `<img src="${url.href}" alt="${description}" class="fill">`;

    const sources = options.sizes.map((size) => {
        url.searchParams.set('w', size[0]);
        url.searchParams.set('h', size[1]);
        return `<source srcset="${url.href}" media="(min-width:${size[0]}px)">`;
    });
    // TODO: configurable classes
    return `<picture class="fill">${sources}${img}</picture>`;
};

export default (options) => {
    options = deepmerge({
        html: '**/*.html',
        parallelism: 5,
        photoIdPatterns: [
            /.*unsplash\.com\/photos\/([^\/?]+).*/,
            /.*source\.unsplash\.com\/([^\/?]+).*/
        ],
        photoUrl: 'full',
        queryParams: {
            auto: 'format',
            cs: 'srgb'
        },
        sizes: []
    }, options || {}, { arrayMerge: (destinationArray, sourceArray) => sourceArray });

    const unsplash = Unsplash.createApi({
        accessKey: process.env.UNSPLASH_ACCESS_KEY,
        secret: process.env.UNSPLASH_SECRET_KEY
    });

    return (files, metalsmith, done) => {
        const htmlFiles = metalsmith.match(options.html, Object.keys(files));
        async.eachLimit(htmlFiles, options.parallelism, async (filename, complete) => {
            const file = files[filename];
            const $ = cheerio.load(file.contents);

            // TODO: this can't be async?
            $('img').each(async (i, elem) => {
                const src = $(elem).attr('src');
                const photoId = getPhotoId(options.photoIdPatterns, src);
                if (!photoId) {
                    return;
                }

                // TODO: cache this
                const result = await unsplash.photos.get({photoId});
                if (result.errors) {
                    throw `Failed to fetch ${src}: ${result.errors.join(', ')}`;
                }

                const html = generateHtml(result.response, options);
                $(elem).replaceWith(html);
            });

            file.contents = Buffer.from($.html());
            complete();
        }, () => {
            done();
        });
    };
};
