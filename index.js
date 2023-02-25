'use strict';

import path from 'path';

import Metalsmith from 'metalsmith';
import tracer     from 'metalsmith-tracer';
import msIf       from 'metalsmith-if';

import env              from 'metalsmith-env';
import buildinfo        from 'metalsmith-build-info';
import metaDirectory    from 'metalsmith-metadata-directory';
import githubProfile    from 'metalsmith-github-profile';
import gravatar         from 'metalsmith-gravatar';
import drafts           from '@metalsmith/drafts';
import validate         from 'metalsmith-validate';
import dataLoader       from 'metalsmith-data-loader';
import sass             from '@metalsmith/sass';
import postcss          from '@metalsmith/postcss';
import include          from 'metalsmith-include-files';
import renamer          from 'metalsmith-renamer';
import remove           from '@metalsmith/remove';
import copy             from 'metalsmith-copy';
import discoverHelpers  from 'metalsmith-discover-helpers';
import discoverPartials from 'metalsmith-discover-partials';
import collect          from 'metalsmith-auto-collections';
import collectionMeta   from 'metalsmith-collection-metadata';
import permalinks       from '@metalsmith/permalinks';
import paths            from 'metalsmith-paths';
import branch           from 'metalsmith-branch';
import readingTime      from 'metalsmith-reading-time';
import pagination       from 'metalsmith-pagination';
import jsonld           from './lib/metalsmith-jsonld.js';
import defaultValues    from '@metalsmith/default-values';
import hbtmd            from './lib/metalsmith-hbt-md.js';
import mermaid          from 'metalsmith-mermaid';
import vega             from 'metalsmith-vega';
import markdown         from '@metalsmith/markdown';
import excerpts         from './lib/metalsmith-excerpts.js';
import except           from 'metalsmith-except';
import feed             from 'metalsmith-feed';
import related          from 'metalsmith-collections-related';
import favicons         from 'metalsmith-favicons';
import layouts          from '@metalsmith/layouts';
import jquery           from 'metalsmith-jquery';
import openGraph        from 'metalsmith-open-graph';
import twitterCard      from 'metalsmith-twitter-card';
import concat           from 'metalsmith-concat';
import glob             from 'metalsmith-html-glob';
import relative         from 'metalsmith-html-relative';
import htmlUnused       from 'metalsmith-html-unused';
import uglify           from 'metalsmith-uglify';
import cssUnused        from 'metalsmith-css-unused';
import htmlMinifier     from 'metalsmith-html-minifier';
import sri              from 'metalsmith-html-sri';
import sitemap          from 'metalsmith-sitemap';
import linter           from 'metalsmith-html-linter';
import linkChecker      from 'metalsmith-link-checker';
import robots           from 'metalsmith-robots';

import collections from '@metalsmith/collections';

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
const siteBackground  = '**/trianglify.svg';
const twitterHandle   = '@emmercm';
const githubHandle    = 'emmercm';

const blogImageSizes = [
    [768,768/2], // default: full width
    [1536,1536/2], // full width retina
    [414,414/2], // mobile
    [360,360/2], // mobile
];
const blogImageThumbSizes = [
    [159,159], // default: card two line title
    [318,318], // card two line title retina
    [135,135], // card single line title
    [222,222], // index retina
    [111,111], // index
];

const vegaOptions = {
    vega: {
        background: 'transparent',
        width: 500,
        height: 500/2
    }
};

const slugify = (source) => {
    let slug = transliteration.slugify(source);

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
            <i class="fa-regular fa-link"></i>
        </a>
        ${text}
        </h${level}>`;
};
markdownRenderer.table = (header, body) => {
    if (body) {
        body = `<tbody>${body}</tbody>`;
    }
    return `<table class="table table-bordered border-dark table-striped">
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
    if (!lang) {
        return `<pre><code>${escaped ? _code : escape(_code, true)}</code></pre>\n`;
    }
    return `<pre><code class="language-${escape(lang, true)}">${escaped ? _code : escape(_code, true)}</code></pre>\n`;
};

tracer(Metalsmith(path.resolve()))
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
        twitterhandle: twitterHandle
    })

    // Add all env vars to global metadata
    .use(env())

    // Add build info to global metadata
    .use(buildinfo())

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

    // Ignore draft files
    .use(drafts())

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

    /*********************
     *                   *
     *     BUILD CSS     *
     *                   *
     *********************/

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
                files[filename].imageCredit = `Photo by <a href="${photo.user.links.html}${utmParameters}">${photo.user.name}</a> on <a href="${photo.links.html}${utmParameters}">Unsplash</a>`;
            } else {
                imageUrlGenerator = (width, height) => `https://source.unsplash.com/${photoId}/${width}x${height}`;
                files[filename].imageCredit = `Photo on <a href="${original}">Unsplash</a>`
            }
            files[filename].image = imageUrlGenerator(blogImageSizes[0][0], blogImageSizes[0][1]);
            // TODO(cemmer): double check this is semantically right
            files[filename].imageSources = blogImageSizes
                .sort((res1, res2) => res2[0] - res1[0])
                .map(resolution => `<source srcset="${imageUrlGenerator(resolution[0], resolution[1])}" media="(min-width:${resolution[0]}px)">`).join('');
            files[filename].thumb = imageUrlGenerator(blogImageThumbSizes[0][0], blogImageThumbSizes[0][1]);
            files[filename].thumbSources = blogImageThumbSizes
                .sort((res1, res2) => res2[0] - res1[0])
                .map(resolution => `<source srcset="${imageUrlGenerator(resolution[0], resolution[1])}" media="(min-width:${resolution[0]}px)">`).join('');
        }, (err) => {
            done(err);
        });
    })

    // Process background images
    // TODO(cemmer): webp formats
    .use(backgroundImage(siteBackground, 1024, prodBuild)) // catch all
    .use(backgroundImage(siteBackground, 926, prodBuild)) // iPhone 12 Pro Max
    .use(backgroundImage(siteBackground, 896, prodBuild)) // iPhone 11 Pro Max, XR, XS Max
    .use(backgroundImage(siteBackground, 736, prodBuild)) // iPhone 8 Plus, 7 Plus, 6/S Plus

    // Create static/img/blog/default.*
    .use(include({
        'static/img/blog': [
            siteLogo
        ]
    }))
    .use(renamer({
        siteLogo: {
            pattern: `static/img/blog/${siteLogo.split('/').pop()}`,
            rename: file => `default.${file.split('.').pop()}`
        }
    }))

    // Ignore files that can't be processed
    .use(remove(['static/img/blog/*.@(psd|xcf)']))

    // Process blog images
    .use(copy({
        pattern: 'static/img/blog/*',
        transform: filename => filename.replace(/\.([^.]+)$/, '-thumb.$1')
    }))
    // TODO(cemmer): responsive image sizes
    .use(blogImage('static/img/blog/!(*-thumb).*', blogImageSizes[0][0]*2, blogImageSizes[0][1]*2, prodBuild))
    .use(blogImage('static/img/blog/*-thumb.*', blogImageThumbSizes[0][0]*2, blogImageThumbSizes[0][1]*2, prodBuild))

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
    .use(collect({
        pattern: '*/**/*.md',
        settings: {
            sortBy: (a, b) => {
                if (DateTime.fromJSDate(a.date) > DateTime.fromJSDate(b.date)) {
                    return 1;
                } else if (DateTime.fromJSDate(a.date) < DateTime.fromJSDate(b.date)) {
                    return -1;
                }
                return 0;
            },
            reverse: true
        }
    }))
    .use(collectionMeta({
        blog: {
            pageHeader: true,
            pageFooter: true
        }
    }))

    // Temporarily rename .md to .html for permalinks() and paths()
    // Use metalsmith-renamer instead of metalsmith-copy because it breaks the reference from collections to files
    .use(renamer({
        md: {
            pattern: '**/*.md',
            rename: file => file.replace(/\.md$/, '.html')
        }
    }))

    // Move pages to separate index.html inside folders
    .use(permalinks({
        relative: false,
        slug: slugify,
        linksets: [
            {
                match: { collection: 'blog' },
                pattern: 'blog/:title'
            }
        ]
    }))

    // Add a "paths" object to each file's metadata - after permalinks() moves them
    .use(paths({
        property: 'paths',
        directoryIndex: 'index.html'
    }))

    // Rename .html back to .md for templating
    .use(renamer({
        html: {
            pattern: '**/*.html',
            rename: file => file.replace(/\.html$/, '.md')
        }
    }))

    // Find images for pages
    .use((files, metalsmith, done) => defaultValues([
        {
            pattern: '**/*.@(html|md)',
            defaults: {
                image: file => {
                    const basename = file.path
                        .replace(/\/index\.[a-z]+$/, '')
                        .split('/').pop()
                        .replace(/\.[a-z]+$/, '');
                    const path = (Object.keys(files)
                        .filter(minimatch.filter(`static/img/{**/,}${basename}.*`))
                        .find(() => true) || '')
                        .replace(/^([^/])/, '/$1')
                        .replace(/\.[a-z]+$/, '');
                    return path ? `${path}.*` : null;
                }
            }
        },
        {
            pattern: '**/*.@(html|md)',
            defaults: {
                thumb: file => file.image ? file.image.replace(/(\.[^\.]+)$/, '-thumb.*') : null
            }
        }
    ])(files, metalsmith, done))

    // Render blog article partials (same as below) first so excerpts can be parsed before being referenced on other pages
    .use(branch('blog/*/*.md')
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
            destination: 'blog/rss.xml',
            // rss
            title: siteName,
            description: siteDescription,
            site_url: siteURL
        }))
        // Estimate pages' reading times
        .use(readingTime())
    )
    .use(branch('blog/*/*.html')
        // Automatically add {{>blog_crosspost}} partials
        .use((files, metalsmith, done) => {
            Object.keys(files)
                .forEach(filename => {
                    files[filename].contents = Buffer.from(
                        files[filename].contents.toString()
                            // Lines that contain blog links
                            .replace(/^(.*?href="\/?blog\/.*?".*?)$/gm, val => {
                                // Each blog link
                                /href="(\/?blog\/.*?)"/g.exec(val).slice(1)
                                    // Append the partial to the end
                                    // TODO: place the crosspost after any <pre> immediately following
                                    .forEach(match => val = `${val}\n\n{{>blog_crosspost path="${match.replace(/^\/+|\/+$/g, '')}"}}`)
                                return val;
                            })
                    );
                });
            done();
        })
        .use(hbtmd(Handlebars, { pattern: '**/*' }))
    )

    .use((files, metalsmith, done) => {
        // TODO: metalsmith-tag-collections

        const options = {
            pattern: 'blog/**',
            key: 'tags',
            collection: 'blog/tag/{tag}',
            settings: {
                sortBy: (a, b) => {
                    if (DateTime.fromJSDate(a.date) > DateTime.fromJSDate(b.date)) {
                        return 1;
                    } else if (DateTime.fromJSDate(a.date) < DateTime.fromJSDate(b.date)) {
                        return -1;
                    }
                    return 0;
                },
                reverse: true
            }
        };

        const collectionsConfig = {};

        // Clear side-effect data from previous metalsmith-colletions
        // const metadata = metalsmith.metadata();
        // Object.keys(metadata.collections || {})
        //     .forEach((collection) => {
        //         if(metadata[collection]) {
        //             delete metadata[collection];
        //         }
        //
        //     });

        // const tags = Object.keys(files)
        //     .filter(minimatch.filter(options.pattern))
        //     .map((filename) => {
        //         const file = files[filename];
        //         if(file[options.key]) {
        //             const val = file[options.key];
        //             return Array.isArray(val) ? val : [val];
        //         }
        //     })
        //     .filter((tags) => tags)
        //     .reduce((acc, val) => acc.concat(val), []) // .flat()
        //     .filter((value, index, self) => self.indexOf(value) === index);

        Object.keys(files)
            .filter(minimatch.filter(options.pattern))
            .forEach((filename) => {
                const file = files[filename];

                if(file[options.key]) {
                    const val = file[options.key];

                    (Array.isArray(val) ? val : [val]).forEach((tag) => {
                        const collection = options.collection.replace('{tag}', tag);

                        // Set the collection in the file's metadata
                        files[filename].collection = [...(files[filename].collection || []), collection];

                        // Build the settings for metalsmith-collections
                        collectionsConfig[collection] = options.settings;
                    });
                }
            });

        // Clear side-effect data from previous metalsmith-colletions,
        //  otherwise we could end up with duplicate pages in collections
        const metadata = metalsmith.metadata();
        Object.keys(metadata.collections || {})
            .forEach((collection) => {
                if(metadata[collection]) {
                    delete metadata[collection];
                }
            });

        // Snapshot any collections we didn't intend to change
        //  metalsmith-collections will end up overwriting them and forgetting previous settings
        const collectionsSnapshot = Object.keys(metadata.collections || [])
            .filter((collection) => !collectionsConfig[collection])
            .reduce((acc, val) => ({...acc, [val]: metadata.collections[val]}), {})

        // Run metalsmith-collections
        collections(collectionsConfig)(files, metalsmith, (...args) => {
            // Restore collections we didn't intend to change
            Object.keys(collectionsSnapshot)
                .forEach((collection) => {
                    metadata.collections[collection] = collectionsSnapshot[collection];
                })

            done(...args);
        });
    })

    // Generate and render paginated blog index partials
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
                    description: `A collection of personal blog articles${tagTitle ? `on ${tagTitle}` : ''}.`
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
                    'https://twitter.com/emmercm',
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
                    image: 'image', // TODO: full URL?
                    keywords: 'tags',
                    dateCreated: 'date',
                    datePublished: 'date',
                    dateModified: 'date'
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

    // Prod: add favicons and icons
    // .use(msIf(prodBuild, sharp({
    //     src: siteLogo,
    //     namingPattern: '{dir}{name}-padded{ext}',
    //     moveFile: false,
    //     methods: [{
    //         name: 'extend',
    //         args: metadata => {
    //             return [{
    //                 top: metadata.height * 0.25,
    //                 bottom: metadata.height * 0.25,
    //                 left: metadata.width * 0.25,
    //                 right: metadata.width * 0.25
    //             }];
    //         }
    //     }]
    // })))
    .use(msIf(prodBuild, favicons({
        src: siteLogo,
        dest: '.',
        appName: siteName,
        appDescription: siteDescription,
        developerName: siteName,
        developerURL: siteURL,
        theme_color: '#343a40', // $dark
        start_url: siteURL,
        // manifestMaskable: siteLogo.replace(/(\.[^.]+)$/, '-padded$1'),
        icons: {
            android: true,
            appleIcon: true,
            appleStartup: true,
            favicons: true,
            windows: true
        }
    })))

    // Use Handlebars templating
    .use(layouts({
        pattern: '**/*.html',
        default: 'page.hbs',
        engine: 'handlebars'
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
                // Un-minified files that will get combined into one file
                './node_modules/@fortawesome/fontawesome-pro/css/fontawesome.css',
                './node_modules/@fortawesome/fontawesome-pro/css/brands.css',
                './node_modules/@fortawesome/fontawesome-pro/css/light.css',
                './node_modules/@fortawesome/fontawesome-pro/css/regular.css'
            ],
            'static/js/vendor': [
                // Un-minified files that can be concatenated
                // TODO(cemmer): rewrite local JS to eliminate jQuery
                './node_modules/jquery/dist/jquery.slim.js',
                // TODO(cemmer): only grab the needed module files (requires a bundler?)
                './node_modules/bootstrap/dist/js/bootstrap.js'
            ],
            'static/webfonts': [
                './node_modules/@fortawesome/fontawesome-pro/webfonts/*'
            ]
        }
    }))

    /*****************************************
     *                                       *
     *     EXPAND AND CONCATENATE OUTPUT     *
     *                                       *
     *****************************************/

    // Concatenate all un-minified JS (non-vendor first so they appear last)
    .use(concat({
        files: '**/!(vendor)*/!(*.min).js',
        output: 'static/js/non-vendor.js'
    }))
    .use(concat({
        files: '**/!(*.min).js',
        output: 'static/js/scripts.js'
    }))

    // Concatenate all un-minified CSS
    .use(concat({
        files: '**/!(*.min).css',
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
                // Bootstrap 4 JavaScript
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
        ignore: siteBackground.replace(/\.[^\.]+$/, '') + '*'
    })))

    /***************************
     *                         *
     *     ADD SOCIAL TAGS     *
     *                         *
     ***************************/

    // Add Facebook OpenGraph meta tags
    .use(msIf(prodBuild, openGraph({
        pattern: '**/*.html',
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
        site: twitterHandle,
        creator: twitterHandle
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
        modifiedProperty: 'date'
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
        ignore: [
            // Anti-bot 403
            'pixabay.com',
            'mysql.com',
            // Anti-bot 404
            'fonts.gstatic.com$',
            'support.google.com',
            'twitter.com',
            // Anti-bot 429 rate limiting
            'github.com',
            'instagram.com',
            'linkedin.com/shareArticle',
            // Anti-bot timeouts
            'usnews.com'
            // Temporary
        ]
    })))

    /***********************
     *                     *
     *     FINAL BUILD     *
     *                     *
     ***********************/

    // Include raw Google ownership verification file
    .use(include({
        '': ['./src/google*.html']
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
