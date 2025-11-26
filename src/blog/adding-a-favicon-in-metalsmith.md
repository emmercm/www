---

title: Adding a Favicon in Metalsmith
image: https://unsplash.com/photos/mE4Q1WHerkc
date: 2020-02-18T01:51:00
tags:
- metalsmith

---

Favicons are low-resolution website icons that web browsers use to help identify bookmarks, tabs, and desktop icons at a glance - and they're easy to add in Metalsmith.

## Project setup

To keep this article short and to the point we're not going to set up a full website, just enough to show sample usage. See "[Starting a Metalsmith Project](/blog/starting-a-metalsmith-project)" for a more complete article on how to set up a Metalsmith project.

### Installing packages

Starting with an empty project, install some Metalsmith packages:

```shell
$ npm install --save metalsmith metalsmith-favicons metalsmith-layouts jstransformer-handlebars
```

- [`metalsmith`](https://www.npmjs.com/package/metalsmith) for the base project.
- [`metalsmith-favicons`](https://www.npmjs.com/package/metalsmith-favicons) to generate icon files.
- [`metalsmith-layouts`](https://www.npmjs.com/package/metalsmith-layouts) and [`jstransformer-handlebars`](https://www.npmjs.com/package/jstransformer-handlebars) to render Handlebars templates

### Source file structure

Create the following directories and files for use in the build pipeline:

```text
.
├── index.js
├── layouts
│   └── page.hbs
└── src
    ├── favicon.png
    └── index.html
```

Any valid PNG file will do for `src/favicon.png`, so use a logo of yours or another website's.

Then fill in your `src/page.hbs` like this:

```handlebars
<!DOCTYPE html>
<html>
<head>
    {{#each favicons.html}}
        {{{ this }}}
    {{/each}}
</head>
<body>
    {{{ contents }}}
</body>
</html>
```

Which will serve as a base template for us to be able to use the `favicons` metadata.

You can fill `src/index.html` in with any content such as lorem ipsum, it isn't important for the point of this article.

## Writing the source files

Set up your `index.js` file like this:

```javascript
const Metalsmith = require('metalsmith');
const favicons   = require('metalsmith-favicons');
const layouts    = require('metalsmith-layouts');

// Define some site-wide metadata
const siteName = 'Your Webiste Name';
const siteDescription = 'Your website description.';
const siteURL = 'https://your.website.com';

Metalsmith(__dirname)
    .source('./src')         // source directory for the pipeline
    .use(favicons({          // generate icon files
        src: 'favicon.png',
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
    }))
    .use(layouts({           // use Handlebars templating
        pattern: '**/*.html',
        default: 'page.hbs',
        engine: 'handlebars'
    }))
    .destination('./build')  // destination directory of the pipeline
    .clean(true)             // clean the destination directory before build
    .build(function (err) {  // execute the build
        if (err) {
            throw err;
        }
    });
```

This will:

- Generate a `build/manifest.json` [web app manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest).
- Generate `build/android-chrome-*.png` icons to be used in `build/manifest.json`.
- Generate `build/apple-touch*.png` icons to be used in `<link rel="apple-touch-icon">`s.
- Generate `build/favicon.*` icons to be used in `<link rel="icon">`s.
- Generate a `build/browserconfig.xml` [browser configuration schema reference](https://docs.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/platform-apis/dn320426\(v=vs.85\)).
- Generate `build/mstile-*.png` icons to be used in `build/browserconfig.xml`.
- Process `src/index.html` through `layouts/page.hbs`, adding the icon metadata to the page.

Note this does a lot more than just generate a single `favicon.ico` or `favicon.png`, it also generates a number of non-image files used for defining "web apps" or "pinned sites." See the [RealFaviconGenerator FAQ](https://realfavicongenerator.net/faq) for a great explanation of each of the files generated.

### Build

Run the build command like normal:

```shell
$ node index
```

Then open the resulting `build/index.html` in your browser, and you should the favicon displayed.
