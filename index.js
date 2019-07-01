const Metalsmith = require('metalsmith');
const msIf       = require('metalsmith-if');

const env              = require('metalsmith-env');
const buildinfo        = require('metalsmith-build-info');
const metadata         = require('metalsmith-metadata-directory');
// const validate         = require('metalsmith-validate');
const dataLoader       = require('metalsmith-data-loader');
const defaultValues    = require('metalsmith-default-values');
const sass             = require('metalsmith-sass');
const autoprefixer     = require('metalsmith-autoprefixer');
// const sharp            = require('metalsmith-sharp');
const discoverHelpers  = require('metalsmith-discover-helpers');
const discoverPartials = require('metalsmith-discover-partials');
const collect          = require('metalsmith-auto-collections');
const renamer          = require('metalsmith-renamer');
const permalinks       = require('metalsmith-permalinks');
const paths            = require('metalsmith-paths');
const hbtmd            = require('metalsmith-hbt-md');
const markdown         = require('metalsmith-markdown');
const favicons         = require('metalsmith-favicons');
const layouts          = require('metalsmith-layouts');
const openGraph        = require('metalsmith-open-graph');
const twitterCard      = require('metalsmith-twitter-card');
const include          = require('metalsmith-include-files');
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
const formatcheck      = require('metalsmith-formatcheck');
const eslint           = require('metalsmith-eslint');
const blc              = require('metalsmith-broken-link-checker');

// Register Handlebars helper libraries
const Handlebars = require('handlebars');
require('handlebars-helpers')({
    handlebars: Handlebars
});

const prod = (process.env.NODE_ENV || 'development').toLowerCase() === 'production';

const siteCharset     = 'utf-8';
const siteLanguage    = 'en';
const siteName        = 'Christian Emmer';
const siteURL         = 'https://emmer.dev';
const siteDescription = '';
const siteKeywords    = [];
const twitterHandle   = '@emmercm';

Metalsmith(__dirname)
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
        sitekeywords: siteKeywords
    })

    // Add all env vars to global metadata
    .use(env())

    // Add build info to global metadata
    .use(buildinfo())

    // Load metadata files
    .use(metadata({
        directory: "./src/data/*.yml"
    }))

    // Set source directory
    .source('./src')

    // Ignore junk files
    .ignore([
        '**/.*',
        '**/*.json',
    ])

    // // Validate required metadata
    // .use(validate([
    //     {
    //         pattern: '**/!(index).md',
    //         metadata: {
    //             title: true,
    //             description: true
    //         }
    //     }
    // ]))

    // Load external YAML files into page metadata
    .use(dataLoader({
        removeSource: true
    }))

    // Add default page metadata
    .use(defaultValues([{
        pattern: '**/*.md',
        defaults: {
            pageTitle: file => {
                // Leave non-strings alone
                if (file.hasOwnProperty('pageTitle') && typeof file.pageTitle !== 'string') {
                    return file.pageTitle
                }
                // Assemble string
                let pageTitle = '';
                if (file.hasOwnProperty('collection') && file.collection.length) {
                    pageTitle += file.collection[0]
                        .split(' ')
                        .map(s => s.charAt(0).toUpperCase() + s.substring(1))
                        .join(' ');
                }
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
            header: file => file.hasOwnProperty('title') ? file.title : siteName,
            description: file => file.hasOwnProperty('description') ? file.description : siteDescription
        }
    }]))

    /*********************
     *                   *
     *     BUILD CSS     *
     *                   *
     *********************/

    // Compile Sass files
    .use(sass())

    // Prod: run autoprefixer on CSS files
    .use(msIf(prod, autoprefixer()))

    /**************************
     *                        *
     *     PROCESS IMAGES     *
     *                        *
     **************************/

    // // Convert all images to PNG
    // .use(sharp({
    //     src: '**/*.@(bmp|gif|jpg|jpeg|svg|tif|tiff|webp)',
    //     namingPattern: '{dir}{name}.png',
    //     moveFile: true,
    //     methods: [
    //         {name: 'png', args: {palette: true}}
    //     ]
    // }))
    //
    // // Trim white edges of known bad images
    // .use(sharp({
    //     src: '**/partners/*.png',
    //     methods: [
    //         {
    //             // Extend has to happen in a separate pipeline because it's forced to happen after resizes
    //             name: 'extend',
    //             args: {
    //                 top: 10,
    //                 left: 10,
    //                 bottom: 10,
    //                 right: 10,
    //                 background: '#ffffff'
    //             }
    //         }
    //     ]
    // }))
    // .use(sharp({
    //     src: '**/partners/*.png',
    //     methods: [
    //         {name: 'trim'}
    //     ]
    // }))
    //
    // // Max size 512x512
    // .use(sharp({
    //     src: '**/!(carousel)/*.png',
    //     methods: [
    //         {
    //             name: 'resize',
    //             args: [
    //                 512,
    //                 512,
    //                 {
    //                     kernel: 'cubic',
    //                     fit: 'inside',
    //                     withoutEnlargement: true
    //                 }
    //             ]
    //         }
    //     ]
    // }))
    //
    // // Darken some images
    // .use(sharp({
    //     src: '**/carousel/*.png',
    //     methods: [
    //         {
    //             name: 'overlayWith',
    //             args: metadata => [pngColor(metadata.width, metadata.height, 'rgba(0, 0, 0, 0.5)')]
    //         }
    //     ]
    // }))

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
            sortBy: function (a, b) {
                // https://github.com/segmentio/metalsmith-collections
                if (isNaN(a.index)) {
                    throw "Missing index for '" + a.path + "'";
                } else if (isNaN(b.index)) {
                    throw "Missing index for '" + b.path + "'";
                } else if (a.index === b.index) {
                    throw "Duplicate index for '" + a.path + "' and '" + b.path + "': " + a.index;
                } else if (a.index > b.index) {
                    return 1;
                } else if (a.index < b.index) {
                    return -1;
                }
                return 0;
            },
            refer: false
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
        relative: false,  // don't copy static files everywhere
        slug: {
            replacement: '-'
        }
    }))

    // Add a "path" object to each file's metadata - after permalinks() moves them
    .use(paths({
        directoryIndex: 'index.html'
    }))

    // Rename .html back to .md for templating
    .use(renamer({
        html: {
            pattern: '**/*.html',
            rename: file => file.replace(/\.html$/, '.md')
        }
    }))

    // Process handlebars templating inside markdown
    .use(hbtmd(Handlebars))

    // Convert markdown to HTML
    .use(markdown({
        headerIds: false
    }))

    // // Add favicons and icons
    .use(favicons({
        src: '**/logo3_Gray_Lighter.svg',
        appName: siteName,
        appDescription: siteDescription,
        developerName: siteName,
        developerURL: siteURL,
        background: '#FFFFFF',
        start_url: siteURL,
        pixel_art: true,
        icons: {
            android: true,
            appleIcon: true,
            favicons: true,
        }
    }))

    // Use handlebar templating
    .use(layouts({
        pattern: '**/*.html',
        default: 'page.hbs',
        engine: 'handlebars'
    }))

    // Add Facebook OpenGraph meta tags
    .use(openGraph({
        sitename: siteName,
        siteurl: siteURL,
        pattern: '**/*.html',
    }))

    // Add Twitter meta
    // .use(defaultValues([{
    //     pattern: '**/*.html',
    //     defaults: {
    //         twitter: file => ({
    //             title: file.pageTitle,
    //             description: file.pageDescription
    //         })
    //     }
    // }]))
    .use(twitterCard({
        siteurl: siteURL,
        card: 'summary',
        site: twitterHandle
    }))

    /**********************************
     *                                *
     *     INCLUDE EXTERNAL FILES     *
     *                                *
     **********************************/

    .use(include({
        'static/css': [
            './node_modules/@fortawesome/fontawesome-pro/css/all.css'
        ],
        'static/js': [
            './node_modules/bootstrap/dist/js/bootstrap.bundle.js',
            './node_modules/jquery/dist/jquery.slim.min.js'
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

    // Expand HTML, CSS, and JavaScript first
    .use(beautify())

    // Concatenate all un-minified JS
    .use(concat({
        files: '**/!(*.min).js',
        output: 'static/js/scripts.js'
    }))

    // Concatenate all un-minified CSS
    .use(concat({
        files: '**/!(*.min).css',
        output: 'static/css/styles.css'
    }))

    /***************************************
     *                                     *
     *     PROCESS LINKED SUBRESOURCES     *
     *                                     *
     ***************************************/

    // Process glob wildcards in href= and src=
    .use(glob())

    // Resolve all local links to relative links
    .use(relative())

    // Prod: remove unused files
    .use(msIf(prod, unused({
        pattern: '**/*.@('
            + [
                'css', 'js',
                'ai', 'bmp', 'gif', 'jpg', 'jpeg', 'png', 'svg', 'tif', 'tiff', 'webp',
                'csv', 'json', 'tsv', 'xml', 'yml',
                'doc', 'docx', 'pdf', 'ppt', 'pptx'
            ].join('|')
            + ')',
        ignore: '**/trianglify.svg'
    })))

    /***************************
     *                         *
     *     COMPRESS OUTPUT     *
     *                         *
     ***************************/

    // Prod: minify JavaScript
    .use(msIf(prod, uglify({
        sameName: true,
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
                /\.carousel-item-.+/,
                /\.modal/,
                /\.show/
            ]
        }
    })))

    // Prod: minify CSS
    .use(msIf(prod, cleanCSS({
        cleanCSS: {
            rebase: false
        }
    })))

    // Prod: minify HTML
    .use(msIf(prod, htmlMinifier()))

    /*******************************
     *                             *
     *     ADD SECURITY CHECKS     *
     *                             *
     *******************************/

    // Add subresource integrity attributes (can require internet connection)
    .use(sri())

    /*********************
     *                   *
     *     RUN TESTS     *
     *                   *
     *********************/

    // Prod: lint HTML (requires internet connection)
    .use(msIf(prod, formatcheck({
        failErrors: true,
        failWarnings: true
    })))

    // Lint JavaScript
    .use(eslint())

    // Ensure no broken links
    .use(blc({
        baseURL: '/not/root',
        allowRedirects: true,
        checkImages: true,
        checkLinks: true,
        checkAnchors: true
    }))

    /***********************
     *                     *
     *     FINAL BUILD     *
     *                     *
     ***********************/

    // Set destination directory
    .destination('./build')

    // Clean destination
    .clean(true)

    // Build
    .build(function(err, files) {
        if (err) {
            throw err;
        }
    });
