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
const defaultValues    = require('metalsmith-default-values');
const sass             = require('metalsmith-sass');
const autoprefixer     = require('metalsmith-autoprefixer');
const ignore           = require('metalsmith-ignore');
const sharp            = require('metalsmith-sharp');
const discoverHelpers  = require('metalsmith-discover-helpers');
const discoverPartials = require('metalsmith-discover-partials');
const collect          = require('metalsmith-auto-collections');
const collectionMeta   = require('metalsmith-collection-metadata');
const renamer          = require('metalsmith-renamer');
const permalinks       = require('metalsmith-permalinks');
const paths            = require('metalsmith-paths');
const branch           = require('metalsmith-branch');
const readingTime      = require('metalsmith-reading-time');
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
const highlight       = require('highlight.js');
const he              = require('he');

const prod = (process.env.NODE_ENV || 'development').toLowerCase() === 'production';

const siteCharset     = 'utf-8';
const siteLanguage    = 'en';
const siteName        = 'Christian Emmer';
const siteURL         = process.env.NETLIFY && process.env.CONTEXT !== 'production' ? process.env.DEPLOY_PRIME_URL : (process.env.URL || 'https://emmer.dev');
const siteEmail       = 'emmercm@gmail.com';
const siteDescription = 'Software engineer with ' + moment().diff('2012-01-16', 'years') + '+ years of experience developing full-stack solutions in PHP, Go, Node.js, and Python.';
const siteKeywords    = [];
const twitterHandle   = '@emmercm';

const blogImageWidth  = 768;
const blogImageHeight = Math.floor(blogImageWidth / 2);

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
        sitekeywords: siteKeywords
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
            // Style
            pageContainer: true,
            pageWide: false,
            pageBackground: true
        }
    }]))

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

    // Process blog images
    .use(ignore(['static/img/blog/*.@(psd|xcf)']))
    .use(sharp({
        // Rasterize vector images
        src: 'static/img/blog/*.svg',
        namingPattern: '{dir}{name}.png',
        moveFile: true,
        methods: [{
            name: 'png',
            args: {
                palette: true
            }
        }]
    }))
    .use(msIf(prod, sharp({
        // Preserve quality during processing
        src: 'static/img/blog/*.@(bmp|heic|heif|gif|jpg|jpeg|tif|tiff|webp)',
        namingPattern: '{dir}{name}.png',
        moveFile: true,
        methods: [{
            name: 'png',
            args: {
                palette: true
            }
        }]
    })))
    // .use(sharp({
    //     // Trim image borders
    //     src: 'static/img/blog/*',
    //     methods: [{
    //         name: 'trim'
    //     }]
    // }))
    .use(sharp({
        // Downsize large images
        src: 'static/img/blog/*',
        methods: [{
            name: 'resize',
            args: [
                blogImageWidth,
                blogImageWidth,
                {
                    kernel: 'cubic',
                    fit: 'outside',
                    withoutEnlargement: true
                }
            ]
        }]
    }))
    .use(sharp({
        // Crop large images
        src: 'static/img/blog/*',
        methods: [{
            name: 'resize',
            args: [
                blogImageWidth,
                blogImageHeight,
                {
                    fit: 'cover',
                    // position: 17, // sharp.strategy.attention
                    withoutEnlargement: true
                }
            ]
        }]
    }))
    .use(sharp({
        // Pad small images
        src: 'static/img/blog/*',
        methods: [{
            name: 'extend',
            args: metadata => {
                const y = Math.max(blogImageHeight - metadata.height, 0);
                const x = Math.max(blogImageWidth - metadata.width, 0);
                return [{
                    top: Math.floor(y / 2),
                    left: Math.floor(x / 2),
                    bottom: Math.ceil(y / 2),
                    right: Math.ceil(x / 2),
                    background: {r:0, g:0, b:0, alpha:0}
                }]
            }
        }]
    }))
    .use(msIf(prod, sharp({
        // Flatten transparent images
        src: 'static/img/blog/*',
        methods: [{
            name: 'flatten',
            args: [
                {
                    background: '#dee2e6' // $gray-300, halfway to $secondary ($gray-600)
                }
            ]
        }]
    })))
    .use(msIf(prod, sharp({
        // Compress images
        src: 'static/img/blog/*',
        namingPattern: '{dir}{name}.jpg',
        moveFile: true,
        methods: [{
            name: 'jpeg'
        }]
    })))

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
            pageHeader: true
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

    // Render blog templates (same as below) first so excerpts can be parsed before being referenced on other pages
    .use(branch('blog/*/*.md')
        // .use(hbtmd(Handlebars))
        .use(markdown({
            headerIds: false,
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
                            .replace(/<[^/][^>]*>/g, ' ')
                            .replace(/<\/[^>]*>/g, '')
                            .replace(/[ ][ ]+/g, ' ')
                            .trim()
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

    // Process handlebars templating inside markdown
    .use(hbtmd(Handlebars))

    // Convert markdown to HTML
    .use(markdown({
        headerIds: false,
        highlight: (code, lang) => highlight.getLanguage(lang) ? highlight.highlight(lang, code).value : highlight.highlightAuto(code).value
    }))

    // Find related files
    .use(related())

    // Prod: add favicons and icons
    .use(msIf(prod, favicons({
        src: '**/prologo1/logo3_Gray_Lighter.svg',
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
                title: file.pageTitle,
                description: file.pageDescription
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
    .use(jquery('**/*.html', $ => {
        $('*').each((i, elem) => {
            Object.keys(elem.attribs)
                .forEach(attribute => $(elem).attr(attribute, he.decode(elem.attribs[attribute])));
        });
    }, {decodeEntities: false}))

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
