'use strict';

const Metalsmith = require('metalsmith');
const tracer     = require('metalsmith-tracer');
const msIf       = require('metalsmith-if');

const env              = require('metalsmith-env');
const buildinfo        = require('metalsmith-build-info');
const metaDirectory    = require('metalsmith-metadata-directory');
const gravatar         = require('metalsmith-gravatar');
const drafts           = require('metalsmith-drafts');
const validate         = require('metalsmith-validate');
const dataLoader       = require('metalsmith-data-loader');
const sass             = require('metalsmith-sass');
const autoprefixer     = require('metalsmith-autoprefixer');
const include          = require('metalsmith-include-files');
const renamer          = require('metalsmith-renamer');
const ignore           = require('metalsmith-ignore');
const copy             = require('metalsmith-copy');
const discoverHelpers  = require('metalsmith-discover-helpers');
const discoverPartials = require('metalsmith-discover-partials');
const collect          = require('metalsmith-auto-collections');
const collectionMeta   = require('metalsmith-collection-metadata');
const permalinks       = require('metalsmith-permalinks');
const paths            = require('metalsmith-paths');
const branch           = require('metalsmith-branch');
const readingTime      = require('metalsmith-reading-time');
const pagination       = require('metalsmith-pagination')
const defaultValues    = require('metalsmith-default-values');
const hbtmd            = require('metalsmith-hbt-md');
const markdown         = require('metalsmith-markdown');
const excerpts         = require('metalsmith-excerpts');
const except           = require('metalsmith-except');
const feed             = require('metalsmith-feed');
const related          = require('metalsmith-collections-related');
const favicons         = require('metalsmith-favicons');
const layouts          = require('metalsmith-layouts');
const jquery           = require('metalsmith-jquery');
const openGraph        = require('metalsmith-open-graph');
const twitterCard      = require('metalsmith-twitter-card');
const beautify         = require('metalsmith-beautify');
const concat           = require('metalsmith-concat');
const glob             = require('metalsmith-html-glob');
const relative         = require('metalsmith-html-relative');
const unused           = require('metalsmith-html-unused');
const uglify           = require('metalsmith-uglify');
const uncss            = require('metalsmith-uncss-2');
const cleanCSS         = require('metalsmith-clean-css');
const htmlMinifier     = require('metalsmith-html-minifier');
const sri              = require('metalsmith-html-sri');
const sitemap          = require('metalsmith-sitemap');
const linter           = require('metalsmith-html-linter');
const linkcheck        = require('metalsmith-linkcheck');

// Register Handlebars helper libraries
const Handlebars = require('handlebars');
require('handlebars-helpers')({
    handlebars: Handlebars
});

const moment          = require('moment');
const transliteration = require('transliteration');
const marked          = require('marked');
const highlight       = require('highlight.js');
const he              = require('he');

const path = require('path');

const { blogImage } = require('./lib/sharp');

const prod = (process.env.NODE_ENV || 'development').toLowerCase() === 'production';

const siteCharset     = 'utf-8';
const siteLanguage    = 'en';
const siteName        = 'Christian Emmer';
const siteURL         = process.env.NETLIFY && process.env.CONTEXT !== 'production' ? process.env.DEPLOY_PRIME_URL : (process.env.URL || 'https://emmer.dev');
const siteEmail       = 'emmercm@gmail.com';
const siteDescription = 'Software engineer with ' + moment().diff('2012-01-16', 'years') + '+ years of experience developing full-stack solutions in PHP, Go, Node.js, and Python.';
const siteLogo        = '**/prologo1/logo3_Gray_Lighter.svg';
const siteKeywords    = [];
const twitterHandle   = '@emmercm';

// x2 for retina displays
const blogImageWidth  = 768 * 2;
const blogImageHeight = Math.floor(blogImageWidth / 2);
const blogImageThumbWidth  = 338 * 2;
const blogImageThumbHeight = Math.floor(blogImageThumbWidth / 2);

const markdownRenderer = new marked.Renderer();
markdownRenderer.heading = (text, level, raw, slugger) => {
    const slug = slugger.slug(raw);
    return `<h${level} id="${slug}">
        <a href="#${slug}" class="link" aria-hidden="true">
            <i class="far fa-link"></i>
        </a>
        ${text}
        </h${level}>`;
};

tracer(Metalsmith(__dirname))
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
        sitekeywords: siteKeywords,
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
                    pattern: value => value && value.getTime()
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
    .use(sass())

    // Run autoprefixer on CSS files
    .use(autoprefixer())

    /**************************
     *                        *
     *     PROCESS IMAGES     *
     *                        *
     **************************/

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
    .use(ignore(['static/img/blog/*.@(psd|xcf)']))

    // Process large blog images
    .use(blogImage('static/img/blog/!(*-thumb).*', blogImageWidth, blogImageHeight, prod))

    // Process small blog images
    .use(copy({
        pattern: 'static/img/blog/*',
        transform: filename => filename.replace(/\.([^.]+)$/, '-thumb.$1')
    }))
    .use(blogImage('static/img/blog/*-thumb.*', blogImageThumbWidth, blogImageThumbHeight, prod))

    /***********************
     *                     *
     *     BUILD PAGES     *
     *                     *
     ***********************/

    // Find Handlebars helpers
    .use(discoverHelpers())

    // Find Handlebars partials
    .use(discoverPartials({
        directory: 'layouts/partials'
    }))

    // Generate collections of pages from folders - before any markdown conversion, and before permalinks() moves them
    .use(collect({
        pattern: '*/**/*.md',
        settings: {
            sortBy: (a, b) => {
                if (moment(a.date).isAfter(b.date)) {
                    return 1;
                } else if (moment(a.date).isBefore(b.date)) {
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
        slug: transliteration.slugify,
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

    // Render blog post partials (same as below) first so excerpts can be parsed before being referenced on other pages
    .use(branch('blog/*/*.md')
        // .use(hbtmd(Handlebars))
        .use(markdown({
            renderer: markdownRenderer,
            highlight: (code, lang) => highlight.getLanguage(lang) ? highlight.highlight(lang, code).value : highlight.highlightAuto(code).value
        }))
        // Extract first paragraph as an excerpt and then change the page description
        .use(excerpts())
        .use((files, metalsmith, done) => {
            // Fix terrible Cheerio output from metalsmith-excerpts
            Object.keys(files)
                .forEach(filename => {
                    files[filename].excerpt = he.decode(
                        files[filename].excerpt
                            .replace(/<[^/][^>]*>/g, ' ') // HTML start tags
                            .replace(/<\/[^>]*>/g, '') // HTML end tags
                            .replace(/[ ][ ]+/g, ' ') // multiple spaces in a row
                            .trim() // leading/trailing whitespace
                    )
                });
            done();
        })
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
    )

    // Estimate pages' reading times
    .use(readingTime())

    .use((files, metalsmith, done) => {
        // metalsmith-tag-collections

        const minimatch = require('minimatch');
        const collections = require('metalsmith-collections');

        const options = {
            pattern: 'blog/**',
            key: 'tags',
            collection: 'blog/tag/{tag}',
            settings: {
                sortBy: (a, b) => {
                    if (moment(a.date).isAfter(b.date)) {
                        return 1;
                    } else if (moment(a.date).isBefore(b.date)) {
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
            acc[`collections['${val}']`] = {
                perPage: 12,
                first: path.join(val, 'index.html'),
                noPageOne: true,
                path: path.join(val, ':num', 'index.html'),
                pageMetadata: {
                    collection: [],
                    priority: 0.9,
                    pageWide: true,
                    // pageBackground: false,
                    title: 'Blog' // TODO: something more elegant
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

    // Add default page metadata
    .use(defaultValues([{
        pattern: '**/*.@(html|md)',
        defaults: {
            // Metadata
            description: file => file.hasOwnProperty('description') ? file.description : siteDescription,
            pageTitle: file => {
                // Leave non-strings alone
                if (file.hasOwnProperty('pageTitle') && typeof file.pageTitle !== 'string') {
                    return file.pageTitle
                }
                // Assemble string
                let pageTitle = '';
                // if (file.hasOwnProperty('collection') && file.collection.length) {
                //     pageTitle += file.collection[0]
                //         .split(' ')
                //         .map(s => s.charAt(0).toUpperCase() + s.substring(1))
                //         .join(' ');
                // }
                if (file.hasOwnProperty('title') && file.title) {
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
            pageContainer: true,
            pageWide: false,
            pageBackground: true
        }
    }]))

    // Process handlebars templating inside markdown
    .use(hbtmd(Handlebars))

    // Convert markdown to HTML
    .use(markdown({
        renderer: markdownRenderer,
        highlight: (code, lang) => highlight.getLanguage(lang) ? highlight.highlight(lang, code).value : highlight.highlightAuto(code).value
    }))

    // Find related files
    .use(related())

    // Prod: add favicons and icons
    .use(msIf(prod, favicons({
        src: siteLogo,
        dest: '.',
        appName: siteName,
        appDescription: siteDescription,
        developerName: siteName,
        developerURL: siteURL,
        start_url: siteURL,
        icons: {
            android: true,
            appleIcon: true,
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
        $('a[target="_blank"]').attr('rel', 'noopener');
    }))

    /**********************************
     *                                *
     *     INCLUDE EXTERNAL FILES     *
     *                                *
     **********************************/

    .use(include({
        'static/css': [
            // Un-minified files that will get combined into one file
            './node_modules/@fortawesome/fontawesome-pro/css/all.css'
        ],
        'static/js/vendor': [
            // Un-minified files that can be concatenated
            './node_modules/jquery/dist/jquery.slim.js',
            './node_modules/bootstrap/dist/js/bootstrap.js',
            './node_modules/mobile-detect/mobile-detect.js',
            './node_modules/lozad/dist/lozad.js'
        ],
        'static/webfonts': [
            './node_modules/@fortawesome/fontawesome-pro/webfonts/*'
        ]
    }))

    /*****************************************
     *                                       *
     *     EXPAND AND CONCATENATE OUTPUT     *
     *                                       *
     *****************************************/

    // Prod: expand HTML, CSS, and JavaScript
    .use(msIf(prod, beautify()))

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
    .use(msIf(prod, uglify({
        removeOriginal: true,
        uglify: {
            sourceMap: false
        }
    })))

    // Prod: trim CSS
    .use(msIf(prod, uncss({
        output: 'static/css/styles.css',
        uncss: {
            ignore: [
                // Bootstrap 4 JavaScript
                // /\.carousel-.+/,
                '.collapse', '.collapsing', '.collapsed',
                // /\.modal-.+/,
                /.*\.show/, /.*\.fade/
            ]
        }
    })))

    // Prod: minify CSS
    .use(msIf(prod, cleanCSS({
        cleanCSS: {
            rebase: false
        }
    })))
    .use(msIf(prod, renamer({
        css: {
            pattern: '**/*.css',
            rename: file => file.replace(/\.css$/, '.min.css')
        }
    })))

    // Add subresource integrity attributes (after minification) (can require internet connection)
    .use(sri({
        ignoreResources: [
            'fonts.googleapis.com/css',
            'googletagmanager.com/gtag/js',
            'platform.twitter.com/widgets.js'
        ]
    }))

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
    .use(unused({
        pattern: '**/*.@('
            + [
                'css', 'js',
                'ai', 'bmp', 'gif', 'jpg', 'jpeg', 'png', 'svg', 'tif', 'tiff', 'webp',
                'csv', 'json', 'tsv', 'xml', 'yml',
                'doc', 'docx', 'pdf', 'ppt', 'pptx', 'xls', 'xlsx'
            ].join('|')
            + ')',
        ignore: '**/trianglify.svg'
    }))

    /***************************
     *                         *
     *     ADD SOCIAL TAGS     *
     *                         *
     ***************************/

    // Add Facebook OpenGraph meta tags
    .use(openGraph({
        sitename: siteName,
        siteurl: siteURL,
        pattern: '**/*.html',
        image: '.og-image'
    }))

    // Add Twitter meta
    .use(defaultValues([{
        pattern: '**/*.html',
        defaults: {
            twitter: file => ({
                // https://github.com/vitaliy-bobrov/metalsmith-twitter-card/issues/2
                title: file.pageTitle
                    .replace(/\./g, '&#46;')
                    .replace(/#/g, '&#35;'),
                description: file.pageDescription
                    .replace(/\./g, '&#46;')
                    .replace(/#/g, '&#35;')
            })
        }
    }]))
    .use(twitterCard({
        siteurl: siteURL,
        card: 'summary',
        site: twitterHandle,
        creator: twitterHandle
    }))

    /*********************************
     *                               *
     *     ALTER & COMPRESS HTML     *
     *                               *
     *********************************/

    // Process lazy image loading
    .use(jquery('**/*.html', $ => {
        // TODO: Convert img[src]:not([data-src]) below-the-fold images to be lazy loaded
        $('img[data-src][data-src!=""]').addClass('lozad');
    }))

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
    .use(msIf(prod, htmlMinifier({
        minifierOptions: {
            // Fix metalsmith-html-minifier defaults
            removeAttributeQuotes: false,
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

    // Ignore processed Google ownership verification file (before generating sitemap)
    .use(ignore([
        '**/google*/*.html',
        '**/google*.html'
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
    .use(linter({
        htmllint: {
            'img-req-src': false // because of lazy loading
        }
    }))

    // Ensure no broken links
    .use(msIf(prod, include({
        '': ['./src/links_ignore.json']
    })))
    .use(msIf(prod, linkcheck({
        failMissing: true
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
