'use strict';

import path from 'node:path';
import url from "node:url";

import Metalsmith from 'metalsmith';
import cache      from 'metalsmith-build-cache';
import tracer     from 'metalsmith-tracer';
import msIf       from 'metalsmith-if';

// SETUP INPUT
import metaDirectory    from 'metalsmith-metadata-directory';
import githubProfile    from 'metalsmith-github-profile';
import gravatar         from 'metalsmith-gravatar';
import drafts           from '@metalsmith/drafts';
import renamer          from 'metalsmith-renamer';
import validate         from 'metalsmith-validate';
import dataLoader       from 'metalsmith-data-loader';
// BUILD CSS
import sass             from '@metalsmith/sass';
import postcss          from '@metalsmith/postcss';
// PROCESS IMAGES
import include          from 'metalsmith-include-files';
import remove           from '@metalsmith/remove';
import copy             from 'metalsmith-copy';
// BUILD PAGES
import discoverHelpers  from 'metalsmith-discover-helpers';
import discoverPartials from 'metalsmith-discover-partials';
import collections      from '@metalsmith/collections';
import collectionMeta   from 'metalsmith-collection-metadata';
import permalinks       from '@metalsmith/permalinks';
import paths            from 'metalsmith-paths';
import defaultValues    from '@metalsmith/default-values';
import branch           from 'metalsmith-branch';
import hbtmd            from './lib/metalsmith-hbt-md.js';
import mermaid          from 'metalsmith-mermaid';
import vega             from 'metalsmith-vega';
import markdown         from '@metalsmith/markdown';
import excerpts         from './lib/metalsmith-excerpts.js';
import except           from 'metalsmith-except';
import feed             from 'metalsmith-feed';
import readingTime      from 'metalsmith-reading-time';
import multiCollections from 'metalsmith-multi-collections';
import pagination       from 'metalsmith-pagination';
import jsonld           from './lib/metalsmith-jsonld.js';
import related          from 'metalsmith-collections-related';
import favicons         from 'metalsmith-html-favicons';
import layouts          from '@metalsmith/layouts';
import jquery           from 'metalsmith-jquery';
// INCLUDE EXTERNAL FILES
// EXPAND AND CONCATENATE OUTPUT
import concat           from 'metalsmith-concat';
// COMPRESS RESOURCES
import uglify           from 'metalsmith-uglify';
import cssUnused        from 'metalsmith-css-unused';
import sri              from 'metalsmith-html-sri';
// PROCESS LINKED RESOURCES
import glob             from 'metalsmith-html-glob';
import relative         from 'metalsmith-html-relative';
import htmlUnused       from 'metalsmith-html-unused';
// ADD SOCIAL TAGS
import openGraph        from 'metalsmith-open-graph';
import twitterCard      from 'metalsmith-twitter-card';
// ALTER & COMPRESS HTML
import htmlMinifier     from 'metalsmith-html-minifier';
// GENERATE SITEMAP
import sitemap          from 'metalsmith-sitemap';
// RUN TESTS
import linter           from 'metalsmith-html-linter';
import linkChecker      from 'metalsmith-link-checker';
// FINAL BUILD
import robots           from 'metalsmith-robots';

import async           from 'async';
import highlight       from 'highlight.js';
import {marked}        from 'marked';
import minimatch       from 'minimatch';
import {DateTime}      from 'luxon';
import transliteration from 'transliteration';

// Register Handlebars helper libraries
import Handlebars from 'handlebars';
import helpers from 'handlebars-helpers';
helpers({
    handlebars: Handlebars
});

import * as cheerio from 'cheerio';

// Set up Unsplash SDK
import fetch from 'node-fetch';
if (!globalThis.fetch) {
    globalThis.fetch = fetch;
}
import Unsplash from 'unsplash-js';
const unsplash = Unsplash.createApi({
    accessKey: process.env.UNSPLASH_ACCESS_KEY,
    secret: process.env.UNSPLASH_SECRET_KEY
});

import { blogImage, backgroundImage } from './lib/sharp.js';

const prodBuild = (process.env.NODE_ENV || 'development').toLowerCase() === 'production';
const prodDeploy = process.env.NETLIFY && process.env.CONTEXT === 'production';

const siteCharset     = 'utf-8';
const siteLanguage    = 'en-US';
const siteName        = 'Christian Emmer';
const siteURL         = process.env.NETLIFY && process.env.CONTEXT !== 'production' ? process.env.DEPLOY_PRIME_URL : (process.env.URL || 'https://emmer.dev');
const siteEmail       = 'emmercm@gmail.com';
const siteDescription = 'Software engineer with ' + Math.floor(DateTime.local().diff(DateTime.fromISO('2012-01-16'), 'years').years) + '+ years of experience developing full-stack solutions in JavaScript, PHP, Go, Java, and Python.';
const siteLogo        = '**/prologo1/logo3_Gray_Lighter.svg';
const blueskyHandle   = 'igir.io';
const twitterHandle   = 'emmercm';
const githubHandle    = 'emmercm';

const blogImageWidth = 720;
const blogImageSizes = [
    blogImageWidth, // default
    blogImageWidth * 2,
    blogImageWidth * 1.5,
    blogImageWidth * 0.75,
    blogImageWidth * 0.5,
]
    .map(width => ([width, width/2]));
const blogImageThumbWidth = 290;
const blogImageThumbSizes = [
    blogImageThumbWidth, // default
    blogImageThumbWidth * 2,
    blogImageThumbWidth * 1.5,
    blogImageThumbWidth * 0.75,
    blogImageThumbWidth * 0.5,
]
    .sort()
    .reverse()
    .map(width => ([width*2, width]));

const vegaOptions = {
    vega: {
        background: 'transparent',
        width: 500,
        height: 500/2
    }
};

const slugify = (source) => {
    let slug = transliteration.slugify(source.replace(/['"]/g, ''));

    // linthtml id-class-no-ad (E010)
    const bannedWords = ['ad', 'banner', 'social'];
    bannedWords.forEach(bannedWord => {
        slug = slug.replace(new RegExp(`^${bannedWord}-|-${bannedWord}-|-${bannedWord}$`, 'g'), '');
    });

    return slug.trim();
};

const markdownRenderer = new marked.Renderer();
markdownRenderer.heading = (text, level, raw) => {
    const title = raw
        .replace(/<\/?[^>]+>/g, '')
        .replace(/"/g, '')
        // linthtml attr-no-unsafe-char (E004)
        .replace(/[^\x00-\x7F]/g, '')
        .trim();
    const slug = slugify(title);
    return `<h${level} id="${slug}">
        <a href="#${slug}" title="${title}" class="link" aria-hidden="true">
            <i class="fa-regular fa-hashtag"></i>
        </a>
        ${text}
        </h${level}>`;
};
markdownRenderer.table = (header, body) => {
    if (body) {
        body = `<tbody>${body}</tbody>`;
    }
    return `<table class="table table-bordered table-striped">
        <thead class="table-dark">${header}</thead>
        ${body}
        </table>`;
};
markdownRenderer.code = (_code, infostring, escaped) => {
    const _highlight = (code, language) => highlight.getLanguage(language) ? highlight.highlight(code, {
        language,
        ignoreIllegals: true
    }).value : highlight.highlightAuto(code).value;
    // v1.1.0
    const escapeTest = /[&<>"']/;
    const escapeReplace = /[&<>"']/g;
    const escapeTestNoEncode = /[<>"']|&(?!#?\w+;)/;
    const escapeReplaceNoEncode = /[<>"']|&(?!#?\w+;)/g;
    const escapeReplacements = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    };
    const getEscapeReplacement = (ch) => escapeReplacements[ch];
    const escape = (html, encode) => {
        if (encode) {
            if (escapeTest.test(html)) {
                return html.replace(escapeReplace, getEscapeReplacement);
            }
        } else if (escapeTestNoEncode.test(html)) {
            return html.replace(escapeReplaceNoEncode, getEscapeReplacement);
        }
        return html;
    };
    const lang = (infostring || '').match(/\S*/)[0]
        .replace('json5', 'json');
    if (_highlight) {
        const out = _highlight(_code, lang);
        if (out != null && out !== _code) {
            escaped = true;
            _code = out;
        }
    }

    const escapedLang = escape(lang, true);

    let html = '<div class="card pre-card"><div class="card-header row g-0 justify-content-between py-2 px-3 fs-6 font-monospace">';
    if (['shell', 'console'].includes(lang)) {
        html += `<div class="col">
<span class="text-mac-red">●</span>
<span class="text-mac-yellow">●</span>
<span class="text-mac-green">●</span>
</div>
<div class="col text-center">${lang}</div>
<div class="col"></div>`;
    } else if (['dos', 'bat', 'cmd', 'powershell', 'ps', 'ps1'].includes(lang)) {
        html += `<div class="col">
<i class="fa-regular fa-rectangle-terminal"></i>
${lang}
</div>
<div class="col text-end">
<i class="fa-regular fa-hyphen"></i>
<i class="fa-regular fa-square"></i>
<i class="fa-regular fa-x"></i>
</div>`;
    } else {
        html += `<div class="col">${lang}</div>`;
    }
    html += `</div>`;
    html += escapedLang ? `<pre class="hljs card-body" data-lang="${escapedLang}">` : '<pre>';
    html += escapedLang ? `<code class="language-${escapedLang}">` : '<code>';
    html += escaped ? _code : escape(_code, true);
    html += '</code></pre></div>\n';
    return html;
};

/**************************
 *                        *
 *     PROCESS IMAGES     *
 *                        *
 **************************/

await cache.metalsmith(tracer(Metalsmith(path.resolve())))
    .source(path.join('src', 'static', 'img', 'blog'))
    .destination('build-img-blog')
    .clean(true)

    // Create static/img/blog/default.*
    .use(include({
        directories: {
            '': path.join('src', siteLogo)
        }
    }))
    .use(renamer({
        siteLogo: {
            pattern: `${siteLogo.split('/').pop()}`,
            rename: file => `default.${file.split('.').pop()}`
        }
    }))

    // Ignore files that can't be processed
    .use(remove(['*.@(psd|xcf)']))

    // Process blog images
    .use(copy({
        pattern: '*',
        transform: filename => filename.replace(/\.([^.]+)$/, '-thumb.$1')
    }))
    // TODO(cemmer): responsive image sizes
    .use(blogImage('**/!(*-thumb).*', blogImageSizes[0][0]*2, blogImageSizes[0][1]*2, prodBuild))
    .use(blogImage('**/*-thumb.*', blogImageThumbSizes[0][0]*2, blogImageThumbSizes[0][1]*2, prodBuild))
    .build();

/*********************
 *                   *
 *     BUILD CSS     *
 *                   *
 *********************/

await cache.metalsmith(tracer(Metalsmith(path.resolve())))
    .source(path.join('src', 'static', 'css'))
    .destination('build-css')
    .clean(true)

    // Compile Sass files
    .use(sass({
        style: 'expanded'
    }))

    // Run autoprefixer on CSS files
    .use(postcss({
        plugins: {
            'autoprefixer': {}
        }
    }))
    .build();

/**********************
 *                    *
 *     MAIN BUILD     *
 *                    *
 **********************/

tracer(Metalsmith(path.resolve()))
    // Files from cached builds above
    .use(remove([
        'static/css/**',
        'static/img/blog/**',
    ]))
    .use(include({
        directories: {
            'static/css': 'build-css/**',
            'static/img/blog': 'build-img-blog/**'
        }
    }))

    /***********************
     *                     *
     *     SETUP INPUT     *
     *                     *
     ***********************/

    // Global variables available in layouts
    .metadata({
        sitecharset: siteCharset,
        sitelanguage: siteLanguage,
        sitename: siteName,
        siteurl: siteURL,
        sitedescription: siteDescription,
        sitelogo: siteLogo,
        blueskyhandle: `@${blueskyHandle}`,
        twitterhandle: `@${twitterHandle}`
    })

    // Add all env vars to global metadata
    .env(process.env)

    // Load metadata files
    .use(metaDirectory({
        directory: "./src/data/*.yml"
    }))

    // Load GitHub information
    .use(msIf(prodBuild, githubProfile({
        username: githubHandle,
        authorization: {
            username: githubHandle,
            token: process.env.GITHUB_PERSONAL_ACCESS_TOKEN
        }
    })))

    // Load Gravatar URL
    .use(gravatar({
        options: {
            protocol: 'https'
        },
        avatars: {
            main: siteEmail
        }
    }))

    // Set source directory
    .source('./src')

    // Ignore junk files
    .ignore([
        '**/.*',
        '**/*.json',
        '**/*.rsls*'
    ])

    // Ignore draft files
    .use(drafts())

    .use((files, metalsmith, done) => {
        Object.keys(files).forEach((filename) => files[filename].originalPath = filename);
        done();
    })

    // Lowercase extensions
    .use(renamer({
        lowercase: {
            pattern: '**/*.*',
            rename: file => {
                const split = file.split('.');
                return split.slice(0, split.length - 1).join('.') + '.' + split[split.length-1].toLowerCase();
            }
        }
    }))

    // Validate required metadata
    .use(validate([
        {
            pattern: 'blog/*.md',
            metadata: {
                title: true,
                date: {
                    exists: true,
                    pattern: value => value
                        && value.getTime()
                        && (value.getTime() - new Date()) < 24 * 60 * 60 * 1000 // not more than 1 day in the future
                }
            }
        }
    ]))

    // Load external YAML files into page metadata
    .use(dataLoader({
        removeSource: true
    }))

    /**************************
     *                        *
     *     PROCESS IMAGES     *
     *                        *
     **************************/

    // Transform Unsplash image pages into CDN URLs
    .use((files, metalsmith, done) => {
        const htmlFiles = Object.keys(files)
            .filter(filename => files[filename].image && files[filename].image.indexOf('unsplash.com') !== -1);
        async.eachLimit(htmlFiles, 5, async filename => {
            const original = files[filename].image;
            const photoId = files[filename].image
                .replace(/.*unsplash\.com\/photos\/([^\/?]+).*/, '$1')
                .replace(/.*source\.unsplash\.com\/([^\/?]+).*/, '$1');
            let imageUrlGenerator;
            if (prodBuild) {
                const result = (await unsplash.photos.get({photoId}));
                if (result.errors) {
                    throw `Failed to fetch ${original}: ${result.errors.join(', ')}`;
                }
                const photo = result.response;
                const imgixParameters = '&auto=format&q=80&cs=srgb&fit=crop&crop=entropy';
                imageUrlGenerator = (width, height) => `${photo.urls.raw}${imgixParameters}&w=${width}&h=${height}`;
                const utmParameters = '?utm_source=emmer-dev&utm_medium=referral';
                files[filename].imageAlt = photo.alt_description;
                files[filename].imageCredit = `Photo by <a href="${photo.user.links.html}${utmParameters}">${photo.user.name}</a> on <a href="${photo.links.html}${utmParameters}">Unsplash</a>`;
            } else {
                imageUrlGenerator = (width, height) => `https://source.unsplash.com/${photoId}/${width}x${height}`;
                files[filename].imageCredit = `Photo on <a href="${original}">Unsplash</a>`
            }
            const imageSourceGenerator = (imageSizes, maxWidth) => {
                const srcset = imageSizes
                    .sort((res1, res2) => res1[0] - res2[0]) // ascending
                    .map(resolution => `${imageUrlGenerator(resolution[0], resolution[1])} ${resolution[0]}w`)
                    .join(', ');
                // TODO(cemmer): use <img sizes="auto" loading="lazy"> when it has better support
                // This pixel density strategy is borrowed from Medium's primary article image
                const sizes = [4, 3, 2.5, 2]
                    .flatMap((dppx) => ([
                        `(min-resolution: ${dppx}dppx) and (max-width: ${maxWidth}px) ${100/dppx*2}vw`,
                        `(-webkit-min-device-pixel-ratio: ${dppx}) and (max-width: ${maxWidth}px) ${100/dppx*2}vw`,
                    ]))
                    .join(', ')
                return `<source srcset="${srcset}" sizes="${sizes}, ${maxWidth}px">`;
            };
            files[filename].image = imageUrlGenerator(blogImageSizes[0][0], blogImageSizes[0][1]);
            files[filename].imageSources = imageSourceGenerator(blogImageSizes, blogImageWidth);
            files[filename].thumb = imageUrlGenerator(blogImageThumbSizes[0][0], blogImageThumbSizes[0][1]);
            // TODO(cemmer): this doesn't work quite right for thumbnails
            files[filename].thumbSources = imageSourceGenerator(blogImageThumbSizes, blogImageThumbWidth);
        }, (err) => {
            done(err);
        });
    })

    /***********************
     *                     *
     *     BUILD PAGES     *
     *                     *
     ***********************/

    // Find Handlebars helpers
    .use(discoverHelpers({
        directory: 'helpers',
        pattern: /\.c?js$/
    }))

    // Find Handlebars partials
    .use(discoverPartials({
        directory: 'layouts/partials'
    }))

    // Generate collections of pages from folders - before any markdown conversion, and before permalinks() moves them
    .use(collections({
        blog: {
            pattern: 'blog/*.md',
            sortBy: (a, b) => DateTime.fromJSDate(a.date).toMillis() - DateTime.fromJSDate(b.date).toMillis(),
            reverse: true
        }
    }))
    .use(collectionMeta({
        blog: {
            pageHeader: true,
            pageFooter: true
        }
    }))

    // Move pages to separate index.html inside folders
    .use(permalinks({
        match: '**/*.md',
        directoryIndex: 'index.md',
        slug: slugify,
        linksets: [
            {
                match: { collection: 'blog' },
                pattern: 'blog/:title'
            }
        ]
    }))
    .use((files, metalsmith, done) => {
        // TODO(cemmer): remove when https://github.com/metalsmith/permalinks/pull/145 releases
        Object.keys(files).forEach(filename => {
            if (filename.indexOf('\0') !== -1) {
                files[filename].permalink = files[filename].permalink.replace(/\x00/g, '.');
                files[filename.replace(/\x00/g, '.')] = files[filename];
                delete files[filename];
            }
        });
        done();
    })

    // Add a "paths" object to each file's metadata - after permalinks() moves them
    .use(paths({
        property: 'paths',
        directoryIndex: 'index.md'
    }))

    // Validate markdown file naming
    .use((files, metalsmith, done) => {
        const pathMismatches = metalsmith.match('**/*.md', Object.keys(files))
            .map((filename) => {
                const file = files[filename];
                const permanentPath = `${file.paths.dir || 'index'}${file.paths.ext}`
                if (permanentPath !== file.path) {
                    return `'${permanentPath}' != '${file.path}'`;
                }
            })
            .filter((err) => err);
        if (pathMismatches.length) {
            done(`Some blog articles are named incorrectly:\n${pathMismatches.map((err) => `  ${err}`).join('\n')}`);
        }
        done();
    })

    // Find images for pages
    .use((files, metalsmith, done) => defaultValues([
        {
            pattern: '**/*.@(html|md)',
            defaults: {
                image: file => {
                    const basenameWithoutExt = file.path
                        .replace(/\/index\.[a-z]+$/, '')
                        .split('/').pop()
                        .replace(/\.[a-z]+$/, '');
                    return metalsmith.match(`static/img/{**/,}${basenameWithoutExt}.*`, Object.keys(files))[0]
                        ?.replace(/^/, '/');
                },
                thumb: file => {
                    const basenameWithoutExt = file.path
                        .replace(/\/index\.[a-z]+$/, '')
                        .split('/').pop()
                        .replace(/\.[a-z]+$/, '');
                    return metalsmith.match(`static/img/{**/,}${basenameWithoutExt}-thumb.*`, Object.keys(files))[0]
                        ?.replace(/^/, '/');
                }
            }
        }
    ])(files, metalsmith, done))

    // Render blog article partials (same as below) first so excerpts can be parsed before being referenced on other pages
    .use(branch('blog/*/*.md')
        // Default some sparse metadata
        .use(defaultValues([{
            pattern: '**/*',
            defaults: {
                updated: file => file.date
            }
        }]))
        // Render the files
        .use(hbtmd(Handlebars))
        .use(mermaid())
        .use(vega(vegaOptions))
        .use(markdown({
            renderer: markdownRenderer
        }))
        // Extract first paragraph as an excerpt and then change the page description (needs to happen after metalsmith-markdown)
        .use(excerpts())
        .use(except('pageDescription'))
        .use(defaultValues([{
            pattern: '**/*',
            defaults: {
                pageDescription: file => file.excerpt
            }
        }]))
        // Use excerpt for RSS feed
        .use(feed({
            // metalsmith-feed
            collection: 'blog',
            limit: 20,
            destination: 'blog/rss.xml',
            // https://www.npmjs.com/package/rss#itemoptions
            preprocess: (file) => ({
                ...file,
                url: url.resolve(siteURL, file.permalink),
                categories: file.tags,
                author: undefined, // undocumented & unneeded, will default to `author` below
            }),
            // https://www.npmjs.com/package/rss#feedoptions
            title: siteName,
            description: siteDescription,
            author: siteName,
            site_url: siteURL,
        }))
        // Estimate pages' reading times
        .use(readingTime())
    )
    .use(branch('blog/*/*.html')
        // Automatically add {{>blog_crosspost}} partials
        .use((files, metalsmith, done) => {
            Object.keys(files)
                .forEach(filename => {
                    const $ = cheerio.load(files[filename].contents.toString(), {}, false);
                    let modified = false;
                    $('a')
                        .each((_, elem) => {
                            const $elem = $(elem);
                            if (!/^\/?blog\/(?!tag\/).+?$/.test($elem.attr('href'))) {
                                return;
                            }
                            modified = true;
                            const textToAdd = `\n{{>blog_crosspost path="${$elem.attr('href').replace(/^\/+|\/+$/g, '')}"}}`;
                            // If the link is within an <li>, append the content at the end
                            const $li = $elem
                                .parents('li')
                                .first()
                                .append(textToAdd);
                            if ($li.length > 0) {
                                return;
                            }
                            // Otherwise, find the block-level element that we're inside of and append the content after
                            const added = $elem
                                .parents('h1, h2, h3, h4, h5, h6, p, div, table')
                                .first()
                                .nextAll(':not(blockquote, pre, .pre-card)')
                                .first()
                                .before(textToAdd);
                        });
                    if (modified) {
                        files[filename].contents = Buffer.from($.html().replaceAll('{{&gt;', '{{>'));
                    }
                });
            done();
        })
        .use(hbtmd(Handlebars, { pattern: '**/*' }))
    )

    // Generate and render paginated blog index partials
    .use(multiCollections.default({
        pattern: 'blog/**',
        key: 'tags',
        collection: 'blog/tag/{val}',
        settings: {
            sortBy: (a, b) => DateTime.fromJSDate(a.date).toMillis() - DateTime.fromJSDate(b.date).toMillis(),
            reverse: true
        }
    }))
    .use((files, metalsmith, done) => {
        const collections = metalsmith.metadata().collections;
        const options = Object.keys(collections).reduce((acc, val) => {
            const tag = val.split('/').length > 1 ? val.split('/').pop() : null;
            const blogTags = metalsmith.metadata().blog_tags;
            const tagTitle = blogTags[tag] ? blogTags[tag].title : null;
            acc[`collections['${val}']`] = {
                perPage: 12,
                first: path.join(val, 'index.html'),
                noPageOne: true,
                path: path.join(val, ':num', 'index.html'),
                pageMetadata: {
                    collection: [],
                    priority: 0.9,
                    pageSize: 'lg',
                    pageTitle: `Blog${tagTitle ? ` - ${tagTitle}` : ''} | ${siteName}`,
                    title: tagTitle,
                    description: `A collection of personal blog articles${tagTitle ? ` on ${tagTitle}` : ''}.`
                },
                layout: 'blog_index.hbs'
            };
            return acc;
        }, {});
        pagination(options)(files, metalsmith, done);
    })
    .use(branch('blog/{tag/**/,}{[0-9]*/,}index.html')
        // Re-run some above plugins
        .use(paths({
            property: 'paths',
            directoryIndex: 'index.html'
        }))
        // Render the partial
        .use(layouts({
            engine: 'handlebars'
        }))
        .use(except('layout'))
    )

    // Add schema.org structured data
    .use((files, metalsmith, done) => jsonld(siteURL, {
        defaults: [
            {
                '@context': 'http://schema.org',
                '@type': 'WebSite',
                '@id': `${siteURL}/#website`,
                url: siteURL,
                name: siteName,
                description: siteDescription,
                publisher: {
                    '@id': `${siteURL}/#organization`
                },
                inLanguage: siteLanguage
            },
            {
                '@context': 'http://schema.org',
                '@type': 'ImageObject',
                '@id': `${siteURL}/#logo`,
                url: `${siteURL}/android-chrome-512x512.png` // metalsmith-favicons
            },
            // {
            //     '@context': 'http://schema.org',
            //     '@type': 'WebPage',
            //     // TODO: @id
            //     isPartOf: {
            //         '@id': `${siteURL}/#website`
            //     },
            //     // TODO
            //     url: 'url',
            //     name: 'title',
            //     description: 'excerpt',
            //     inLanguage: siteLanguage
            // },
            {
                '@context': 'http://schema.org',
                '@type': 'Organization',
                '@id': `${siteURL}/#organization`,
                name: siteName,
                description: siteDescription,
                logo: {
                    '@id': `${siteURL}/#logo`
                }
            },
            {
                '@context': 'http://schema.org',
                '@type': 'Person',
                '@id': `${siteURL}/#person`,
                name: siteName,
                description: siteDescription,
                image: `${metalsmith.metadata().gravatar.main}?s=512`,
                url: siteURL,
                sameAs: [
                    metalsmith.metadata().github ? metalsmith.metadata().github.profile.user.html_url : null,
                    `https://twitter.com/${twitterHandle}`,
                    'https://www.linkedin.com/in/emmercm/'
                ].filter(url=>url)
            }
        ],
        collections: {
            blog: [
                {
                    '@context': 'http://schema.org',
                    '@type': 'BlogPosting',
                    publisher: {
                        '@id': `${siteURL}/#organization`
                    },
                    author: {
                        '@id': `${siteURL}/#person`
                    },
                    inLanguage: siteLanguage,
                    // Things to get from frontmatter
                    url: 'url',
                    mainEntityOfPage: 'url', // TODO: @id /#webpage
                    name: 'title',
                    headline: 'title',
                    description: 'excerpt', // metalsmith-excerpts
                    image: 'image',
                    thumbnail: 'thumb',
                    keywords: 'tags',
                    dateCreated: 'date',
                    datePublished: 'date',
                    dateModified: 'updated'
                }
            ]
        }
    })(files, metalsmith, done))

    // Add default page metadata
    .use(defaultValues([{
        pattern: '**/*.@(html|md)',
        defaults: {
            // Metadata
            description: file => file.description ? file.description : siteDescription,
            pageTitle: file => {
                // Leave non-strings alone
                if (file.pageTitle && typeof file.pageTitle !== 'string') {
                    return file.pageTitle
                }
                // Assemble string
                let pageTitle = '';
                if (file.title) {
                    if (pageTitle) {
                        pageTitle += ' - ';
                    }
                    pageTitle += file.title + ' | ';
                }
                pageTitle += siteName;
                return pageTitle;
            },
            pageDescription: file => file.description || siteDescription,
            // Style
            pageContainer: true
        }
    }]))

    // Process handlebars templating inside markdown
    .use(hbtmd(Handlebars))

    // Convert markdown to HTML
    .use(mermaid())
    .use(vega(vegaOptions))
    .use(markdown({
        renderer: markdownRenderer
    }))

    // Find related files
    .use(related({
        maxRelated: 6
    }))

    // Use Handlebars templating
    .use(layouts({
        pattern: '**/*.html',
        default: 'page.hbs',
        engine: 'handlebars'
    }))

    // Add favicons and web manifests
    .use(favicons({
        icon: siteLogo,
        favicons: {
            appName: siteName,
            appDescription: siteDescription,
            developerName: siteName,
            developerURL: siteURL,
            theme_color: '#343a40', // $dark
            start_url: siteURL,
        },
    }))

    // Change all links with a protocol (external) to be target="_blank"
    .use(jquery('**/*.html', $ => {
        $('a[href*="://"]').attr('target', '_blank');
        $('a[target="_blank"]').each((i, elem) => {
            $(elem).attr('rel', 'noopener');
            if($(elem).children().length === 0 ||
                ($(elem).children().length === 1 && $(elem).children().first().prop('tagName') === 'CODE')) {
                    const immediateText = $(elem).contents().not($(elem).children()).text();
                    $(elem).html(`${$(elem).html()}${immediateText ? ' ' : ''}<i class="fa-regular fa-external-link fa-xs"></i>`);
                }
        });
    }))

    /**********************************
     *                                *
     *     INCLUDE EXTERNAL FILES     *
     *                                *
     **********************************/

    .use(include({
        directories: {
            'static/css': [
                // ***** Un-minified files that can be concatenated *****
            ],
            'static/js/vendor': [
                // ***** Un-minified files that can be concatenated *****
                // TODO(cemmer): rewrite local JS to eliminate jQuery
                './node_modules/jquery/dist/jquery.slim.js',
                // TODO(cemmer): only grab the needed module files (requires a bundler?)
                './node_modules/bootstrap/dist/js/bootstrap.js',
                // TODO(cemmer): this JS replaces tags with SVGs inline, maybe run it through Puppeteer as a build step?
                './node_modules/@fortawesome/fontawesome-pro/js/fontawesome.js',
                './node_modules/@fortawesome/fontawesome-pro/js/brands.js',
                './node_modules/@fortawesome/fontawesome-pro/js/light.js',
                './node_modules/@fortawesome/fontawesome-pro/js/regular.js',
            ],
            'static/webfonts': []
        }
    }))

    /*****************************************
     *                                       *
     *     EXPAND AND CONCATENATE OUTPUT     *
     *                                       *
     *****************************************/

    // Concatenate all JS (non-vendor first so they appear last)
    .use(concat({
        files: '**/!(vendor)*/*.js',
        output: 'static/js/non-vendor.js'
    }))
    .use(concat({
        files: '**/*.js',
        output: 'static/js/scripts.js'
    }))

    // Concatenate all CSS
    .use(concat({
        files: '**/*.css',
        output: 'static/css/styles.css'
    }))

    /******************************
     *                            *
     *     COMPRESS RESOURCES     *
     *                            *
     ******************************/

    // Prod: minify JavaScript
    .use(msIf(prodBuild, uglify({
        removeOriginal: true,
        uglify: {
            sourceMap: false
        }
    })))

    // Remove unused CSS
    .use(msIf(prodBuild, cssUnused({
        purgecss: {
            safelist: [
                // Bootstrap 5 JavaScript
                // /\.carousel-.+/,
                'collapse', 'collapsing', 'collapsed',
                // /\.modal-.+/,
                /.*\.show/, /.*\.fade/
            ]
        }
    })))

    // Prod: minify CSS
    .use(msIf(prodBuild, postcss({
        plugins: {
            'cssnano': {}
        }
    })))
    .use(msIf(prodBuild, renamer({
        css: {
            pattern: '**/*.css',
            rename: file => file.replace(/\.css$/, '.min.css')
        }
    })))

    // Add subresource integrity attributes (after minification) (can require internet connection)
    .use(msIf(prodBuild, sri({
        ignoreResources: [
            'fonts.googleapis.com/css',
            'googletagmanager.com/gtag/js',
            'platform.twitter.com/widgets.js'
        ]
    })))

    /************************************
     *                                  *
     *     PROCESS LINKED RESOURCES     *
     *                                  *
     ************************************/

    // Process glob wildcards in href= and src=
    .use(glob())

    // Resolve all local links to relative links
    .use(relative())

    // Remove unused files
    // TODO: Remove unused images before metalsmith-sharp?
    .use(msIf(prodBuild, htmlUnused({
        pattern: '**/*.@('
            + [
                'css', 'js',
                'ai', 'bmp', 'gif', 'jpg', 'jpeg', 'png', 'svg', 'tif', 'tiff', 'webp',
                'csv', 'json', 'tsv', 'xml', 'yml',
                'doc', 'docx', 'pdf', 'ppt', 'pptx', 'xls', 'xlsx'
            ].join('|')
            + ')',
    })))

    /***************************
     *                         *
     *     ADD SOCIAL TAGS     *
     *                         *
     ***************************/

    // Add Facebook OpenGraph meta tags
    .use(msIf(prodBuild, openGraph({
        pattern: '{*,blog/*,blog/[0-9]*/index}.html',
        sitename: siteName,
        siteurl: siteURL,
        image: '.og-image'
    })))
    .use(msIf(prodBuild, openGraph({
        pattern: 'blog/!([0-9]*)/index.html',
        sitetype: 'article',
        sitename: siteName,
        siteurl: siteURL,
        image: '.og-image'
    })))

    // Add Twitter meta
    .use((files, metalsmith, done) => defaultValues([{
        pattern: '**/*.html',
        defaults: {
            twitter: file => {
                const meta = {
                    // TODO: get rid of .replace()s
                    //  https://github.com/vitaliy-bobrov/metalsmith-twitter-card/issues/2
                    title: file.pageTitle
                        .replace(/^\./, '&#46;')
                        .replace(/^#/, '&#35;'),
                    description: file.pageDescription
                        .replace(/^\./, '&#46;')
                        .replace(/^#/, '&#35;')
                };
                // TODO: change this to '.og-image'
                //  https://github.com/vitaliy-bobrov/metalsmith-twitter-card/issues/3
                if(file.image && file.image.indexOf('://') === -1) {
                    meta.image = Object.keys(files)
                        .filter(minimatch.filter(file.image.replace(/^\/+/, '')))
                        .find(e => true);
                }
                return meta;
            }
        }
    }])(files, metalsmith, done))
    .use(twitterCard({
        // TODO: Homepage entity decoding is screwed up
        siteurl: siteURL,
        card: 'summary_large_image',
        site: `@${twitterHandle}`,
        creator: `@${twitterHandle}`
    }))

    /*********************************
     *                               *
     *     ALTER & COMPRESS HTML     *
     *                               *
     *********************************/

    // Fix Cheerio-mangled attribute values
    // .use(jquery('**/*.html', $ => {
    //     $('*').each((i, elem) => {
    //         Object.keys(elem.attribs)
    //             .forEach(attribute => $(elem).attr(attribute, he.decode(elem.attribs[attribute])));
    //     });
    // }, {decodeEntities: false}))

    // Fix Windows path separator URLs
    // TODO: Figure out what plugins are doing this
    .use(jquery('**/*.html', $ => {
        $('a[href*="://"]').each((i, elem) => {
            $(elem).attr('href', $(elem).attr('href').replace(/\\/g, '/'));
            $(elem).attr('href', $(elem).attr('href').replace(/%5C/g, '%2F'));
        });
    }))

    // Prod: minify HTML
    .use(msIf(prodBuild, htmlMinifier({
        minifierOptions: {
            // Fix metalsmith-html-minifier defaults
            removeAttributeQuotes: false,
            // Fix html-minifier defaults
            decodeEntities: true, // needed for double quotes inside attribute values
            // Additional minification rules
            minifyCSS: true,
            minifyJS: true,
            quoteCharacter: '"',
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true
        }
    })))

    /****************************
     *                          *
     *     GENERATE SITEMAP     *
     *                          *
     ****************************/

    // Ignore non-HTML pages that will get included again later
    .use(remove([
        '**/google{*/,}*.html'
    ]))

    // Generate a sitemap
    .use(sitemap({
        hostname: siteURL,
        omitIndex: true,
        modifiedProperty: 'updated'
    }))

    /*********************
     *                   *
     *     RUN TESTS     *
     *                   *
     *********************/

    // Lint HTML
    .use(msIf(prodBuild, linter()))

    // Ensure no broken links
    .use(msIf(prodBuild, linkChecker({
        attempts: 3,
        ignore: [
            // Anti-bot 403
            'discogs.com',
            'hackernoon.com',
            'linux.die.net',
            'pixabay.com',
            'mysql.com',
            'qbittorrent.org',
            'mitpress.mit.edu',
            'npmjs.com',
            'fvue.nl',
            'patreon.com',
            'news.ycombinator.com',
            // Anti-bot 404
            'fonts.gstatic.com$',
            'support.google.com',
            'twitter.com',
            // Anti-bot 429 rate limiting
            'bsky.app',
            'github.com',
            'instagram.com',
            'linkedin.com',
            'web.archive.org',
            // Anti-bot ECONNREFUSED
            'tldp.org',
            // Anti-bot timeouts
            'usnews.com',
            // Temporary?
            'console.cloud.google.com',
            'gitpkg.vercel.app',
            'meredithbroussard.com',
            'brunoscheufler.com',
            'zsh.org',
        ]
    })))

    /***********************
     *                     *
     *     FINAL BUILD     *
     *                     *
     ***********************/

    // Include raw Google ownership verification file
    .use(include({
        directories: {
            '': './src/google*.html'
        }
    }))

    // Generate robots.txt
    .use(robots({
        disallow: prodDeploy ? [] : ['/'],
        sitemap: `${siteURL}/sitemap.xml`
    }))
    .use((files, metalsmith, done) => {
        // https://github.com/woodyrew/metalsmith-robots/issues/3
        files['robots.txt'].contents = Buffer.from(files['robots.txt'].contents.toString().replace(/^Disallow: ([^*/])/m, 'Disallow: /$1'));
        done();
    })

    // Set destination directory
    .destination('./build')

    // Clean destination
    .clean(true)

    // Build
    .build((err) => {
        if (err) {
            throw err;
        }
    });
