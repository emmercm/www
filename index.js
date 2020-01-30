const Metalsmith = require('metalsmith');
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
const sharp            = require('metalsmith-sharp');
const discoverHelpers  = require('metalsmith-discover-helpers');
const discoverPartials = require('metalsmith-discover-partials');
const collect          = require('metalsmith-auto-collections');
const collectionMeta   = require('metalsmith-collection-metadata');
const renamer          = require('metalsmith-renamer');
const permalinks       = require('metalsmith-permalinks');
const paths            = require('metalsmith-paths');
const branch           = require('metalsmith-branch');
const hbtmd            = require('metalsmith-hbt-md');
const markdown         = require('metalsmith-markdown');
const excerpts         = require('metalsmith-excerpts');
const except           = require('metalsmith-except');
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
const formatcheck      = require('metalsmith-formatcheck');
const eslint           = require('metalsmith-eslint');
const linkcheck        = require('metalsmith-linkcheck');
const sitemap          = require('metalsmith-sitemap');
const ignore           = require('metalsmith-ignore');

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
const siteURL         = 'https://emmer.dev';
const siteEmail       = 'emmercm@gmail.com';
const siteDescription = 'Software engineer with ' + moment().diff('2012-01-16', 'years') + '+ years of experience developing full-stack solutions in PHP, Go, Node.js, Python, and Ruby on Rails.';
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
        '**/*.rsls',
        '**/*.rslsc'
    ])

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

    // Prod: run autoprefixer on CSS files
    .use(msIf(prod, autoprefixer()))

    /**************************
     *                        *
     *     PROCESS IMAGES     *
     *                        *
     **************************/

    // Process blog images
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
    //     // Trim image borders (must be a separate step)
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
                1024,
                1024,
                {
                    kernel: 'cubic',
                    fit: 'inside',
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
                1024,
                Math.floor(1024 / 3),
                {
                    fit: 'cover',
                    strategy: 'attention',
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
                const y = Math.max(Math.floor(1024 / 3) - metadata.height, 0);
                const x = Math.max(1024 - metadata.width, 0);
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
    .use(sharp({
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
    }))
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
    )

    // Process handlebars templating inside markdown
    .use(hbtmd(Handlebars))

    // Convert markdown to HTML
    .use(markdown({
        headerIds: false,
        highlight: (code, lang) => highlight.getLanguage(lang) ? highlight.highlight(lang, code).value : highlight.highlightAuto(code).value
    }))

    // Add favicons and icons
    .use(favicons({
        src: '**/prologo1/logo3_Gray_Lighter.svg',
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

    // Change all links with a protocol (external) to be target="_blank"
    .use(jquery('**/*.html', $ => $('a[href*="://"]').attr('target', '_blank')))

    // Add Facebook OpenGraph meta tags
    .use(openGraph({
        sitename: siteName,
        siteurl: siteURL,
        pattern: '**/*.html',
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
        site: twitterHandle
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
        'static/js': [
            // Minified files that need to come first and won't get combined
            './node_modules/jquery/dist/jquery.slim.min.js',
            './node_modules/mobile-detect/mobile-detect.min.js',
            // Un-minified files that will get combined into one file
            './node_modules/bootstrap/dist/js/bootstrap.js'
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

    // Add subresource integrity attributes (after all minification) (can require internet connection)
    .use(sri({
        ignoreResources: [
            'fonts.googleapis.com/css',
            'googletagmanager.com/gtag/js',
            'platform.twitter.com/widgets.js'
        ]
    }))

    // Fix Cheerio-mangled attribute values
    .use(jquery('**/*.html', $ => {
        $('*').each((i, elem) => {
            Object.keys(elem.attribs)
                .forEach(attribute => $(elem).attr(attribute, he.decode(elem.attribs[attribute])));
        });
    }, {decodeEntities: false}))

    // Prod: minify HTML
    .use(msIf(prod, htmlMinifier()))

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

    // Prod: lint HTML (requires internet connection)
    .use(msIf(prod, formatcheck({
        failErrors: true,
        failWarnings: true
    })))

    // Lint JavaScript
    .use(eslint())

    // Ensure no broken links
    .use(include({
        '': ['./src/links_ignore.json']
    }))
    .use(linkcheck({
        failMissing: true
    }))

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
    .build(function(err) {
        if (err) {
            throw err;
        }
    });
