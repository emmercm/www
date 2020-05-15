---

title: Adding a Google Site Ownership Verification File in Metalsmith
imageCredit: 'Photo by <a href="https://unsplash.com/@charlesdeluvio">Charles Deluvio</a> on <a href="https://unsplash.com/photos/AT5vuPoi8vc">Unsplash</a>'
date: 2019-12-28T19:53:00

---

In order to manage your website in the [Google Search Console](https://support.google.com/webmasters/answer/9128668) you first need to [verify ownership](https://support.google.com/webmasters/answer/9008080) of your site. One way of doing this is by downloading a special HTML file from Google and uploading it to your site for Google to crawl.

Here's Google's explanation of Search Console:

> Google Search Console is a free service offered by Google that helps you monitor, maintain, and troubleshoot your site's presence in Google Search results. You don't have to sign up for Search Console to be included in Google Search results, but Search Console helps you understand and improve how Google sees your site.

Adding this file in your Metalsmith project is pretty straight forward, but there are a couple of traps.

## Project setup

To keep this article short and to the point we're not going to set up a full website, just enough to show sample usage. See "[Starting a Metalsmith Project](/blog/starting-a-metalsmith-project)" for a more complete article on how to set up a Metalsmith project.

### Installing packages

Starting with an empty project, install some Metalsmith packages:

```bash
npm install --save metalsmith metalsmith-ignore metalsmith-include-files
```

- [`metalsmith`](https://www.npmjs.com/package/metalsmith) for the base project.
- [`metalsmith-ignore`](https://www.npmjs.com/package/metalsmith-ignore) to ignore any processed HTML.
- [`metalsmith-include-files`](https://www.npmjs.com/package/metalsmith-include-files) to include the raw HTML file.

### Source file structure

Create the following directories and files for use in the build pipeline:

```text
.
├── index.js
└── src
    ├── google0123456789abcdef.html
    └── index.html
```

For now we're pretending `google0123456789abcdef.html` is the file you downloaded from Google which is unique for every domain + user combo. Follow the instructions [here](https://support.google.com/webmasters/answer/9008080) on how to find and download your own file.

## Writing the source files

Set up your `index.js` file like this:

```javascript
const Metalsmith = require('metalsmith');
const ignore     = require('metalsmith-ignore');
const include    = require('metalsmith-include-files');

Metalsmith(__dirname)
    .source('./src')         // source directory for the pipeline
    .use(ignore([            // ignore any processed HTML
        '**/google*/*.html',
        '**/google*.html'
    ]))
    .use(include({           // include the raw HTML file
        '': ['./src/google*.html']
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

- Copy `src/index.html` to `build/index.html`.
- Copy `src/google0123456789abcdef.html` to `build/google0123456789abcdef.html`, ignoring any other pipeline processing.

Then fill in your `src/index.html` with some dummy content:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Lorem Ipsum</title>
</head>
<body>
Lorem ipsum dolor sit amet, consectetur adipiscing elit.
</body>
</html>
```

And `src/google0123456789abcdef.html` with the content:

```text
google-site-verification: google0123456789abcdef.html
```

### Build

Run the build command like normal:

```bash
node index
```

And you should see `build/google0123456789abcdef.html` exist with the exact same content as `src/google0123456789abcdef.html`.

## Why the extra plugins?

Google requires the uploaded verification file to be an exact copy of the one downloaded, even extra line endings could make it fail verification. It's likely your Metalsmith build pipeline is a lot more complicated than the example above, and you're probably using at least one plugin that modifies the path or contents of HTML files. Because of that, these steps to include the verification file should be as close to the end of the pipeline as possible.

For example, if you use [`metalsmith-permalinks`](https://www.npmjs.com/package/metalsmith-permalinks) like:

```text
.use(permalinks({
    relative: false
}))
```

you'll end up with the file at `build/google0123456789abcdef/index.html`, but we need the file in the root of the output directory.

Or if you use [`metalsmith-layouts`](https://www.npmjs.com/package/metalsmith-layouts) like:

```text
.use(layouts({
    pattern: '**/*.html',
    default: 'page.hbs',
    engine: 'handlebars'
}))
```

it will process `src/google0123456789abcdef.html` through that default template and the content will no longer match.

## Other dangers

Because the verification file isn't meaningful to site viewers or non-Google crawlers you probably don't want to link to it from any of your other pages.

If you're using [`metalsmith-sitemap`](https://www.npmjs.com/package/metalsmith-sitemap) to generate a sitemap you probably want to do it in between the [`metalsmith-ignore`](https://www.npmjs.com/package/metalsmith-ignore) and [`metalsmith-include-files`](https://www.npmjs.com/package/metalsmith-include-files) steps so the verification file doesn't get referenced in the sitemap.

If you're using [`metalsmith-formatcheck`](https://www.npmjs.com/package/metalsmith-formatcheck) to lint your output HTML (see "[Linting Metalsmith Output HTML](/blog/linting-metalsmith-output-html)") you're going to want to do that before including the verification file as it isn't valid HTML.
