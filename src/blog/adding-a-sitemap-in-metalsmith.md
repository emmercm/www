---

title: Adding a Sitemap in Metalsmith
image: https://unsplash.com/photos/D2K1UZr4vxk
imageCredit: 'Photo by <a href="https://unsplash.com/@sylwiabartyzel">Sylwia Bartyzel</a> on <a href="https://unsplash.com/photos/D2K1UZr4vxk">Unsplash</a>'
date: 2020-01-12T01:26:00
tags:
- metalsmith

---

Sitemaps are XML files that provide a list of all pages on a site that should be crawled by search engines, and they're very simple to add in Metalsmith.

Most of the pages on a site are probably linked together in one way or another, so search engine crawlers should be able to find them all, but sitemaps help list all pages in one (or more) places for efficiency. Sitemaps are also useful for when there exist pages that are isolated from others.

## Project setup

To keep this article short and to the point we're not going to set up a full website, just enough to show sample usage. See "[Starting a Metalsmith Project](/blog/starting-a-metalsmith-project)" for a more complete article on how to set up a Metalsmith project.

### Installing packages

Starting with an empty project, install some Metalsmith packages:

```bash
npm install --save metalsmith metalsmith-sitemap
```

- [`metalsmith`](https://www.npmjs.com/package/metalsmith) for the base project.
- [`metalsmith-sitemap`](https://www.npmjs.com/package/metalsmith-sitemap) to generate the sitemap file.

### Source file structure

Create the following directories and files for use in the build pipeline:

```text
.
├── index.js
└── src
    ├── about.html
    └── index.html
```

We won't bother filling in those HTML files with content because it isn't necessary to demonstrate how [`metalsmith-sitemap`](https://www.npmjs.com/package/metalsmith-sitemap) works.

## Writing the source files

Set up your `index.js` file like this:

```javascript
const Metalsmith = require('metalsmith');
const sitemap    = require('metalsmith-sitemap');

const siteURL = 'https://your.website.com';

Metalsmith(__dirname)
    .source('./src')         // source directory for the pipeline
    .use(sitemap({           // generate a sitemap file
        hostname: siteURL,
        omitIndex: true
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
- Copy `src/about.html` to `build/about.html`.
- Generate `build/sitemap.xml`.

The options used for [`metalsmith-sitemap`](https://www.npmjs.com/package/metalsmith-sitemap) are:

- `hostname` (required) the hostname of your website. It's useful to define this as a `const` because other plugins such as [`metalsmith-favicons`](https://www.npmjs.com/package/metalsmith-favicons), [`metalsmith-open-graph`](https://www.npmjs.com/package/metalsmith-open-graph), and [`metalsmith-twitter-card`](https://www.npmjs.com/package/metalsmith-twitter-card) need it, too.
- `omitIndex: true` removes `index.html` from paths. This is useful when using [`metalsmith-permalinks`](https://www.npmjs.com/package/metalsmith-permalinks), but it doesn't change anything in this example.

### Build

Run the build command like normal:

```bash
node index
```

And you should see `build/sitemap.xml` exist with both pages listed:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
<url> <loc>https://your.website.com/about.html</loc> </url>
<url> <loc>https://your.website.com/</loc> </url>
</urlset>
```

## Plugin options

There are some other options that exist in [`metalsmith-sitemap`](https://www.npmjs.com/package/metalsmith-sitemap) you could consider.

Here are some options that can be defaulted at the plugin level, as well as defined in each file's frontmatter:

- `changefreq` indicates how a page is likely to change, but this is just a hint, so the value is questionable. The following values are supported: `always`, `hourly`, `daily`, `weekly`, `monthly`, `yearly`, and `never`.

    ```markdown
  ---
  changefreq: daily
  ---
  This page changes daily.
    ```

- `priority` is a value between 0.0 and 1.0 that indicates how important a page is on your site, with a default of 0.5. The priority number isn't meaningful on its own, it's used to figure out relative priority to other pages on the same site. This is intended to affect which of your pages are most likely to show in a search index.

    ```markdown
  ---
  priority: 1.0
  ---
  This is the highest priority page.
    ```

- `lastmod` is the date the page was last modified.

    ```markdown
  ---
  lastmod: 2020-01-01
  ---
  This page was last modified on a specific day.
    ```

An option that can't be defaulted at the plugin level but is useful at the individual file level is `private`. When `true` the file will be excluded from the sitemap.

```markdown
---
private: true
---
This page won't be in the sitemap.
```

## Additional thoughts

The frontmatter properties mentioned above (`changefreq`, `priority`, `lastmod`, and `private`) are completely optional and [`metalsmith-sitemap`](https://www.npmjs.com/package/metalsmith-sitemap) won't throw any exceptions if they don't exist so you may want to consider using [`metalsmith-validate`](https://www.npmjs.com/package/metalsmith-validate) or similar to make them required for certain sets of files.
