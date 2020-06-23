---

title: Remove Unused Assets in Metalsmith
imageCredit: Photo by <a href="https://unsplash.com/@rocinante_11">Mick Haupt</a> on <a href="https://unsplash.com/photos/VE9DQ7zm22Y">Unsplash</a>
date: 2020-05-19T18:22:00
tags:
- metalsmith

---

Have assets in your source directory that are never used by your output? Save some space, get rid of them!

Removing static assets (images, CSS, JavaScript, documents/PDFs, etc.) at the end of your build pipeline reduces the amount of content that has to be written to disk and then eventually uploaded to a web server. Not removing these assets probably doesn't hurt your build time as much as running other plugins, but it's an easy optimization to take.

See "[Minify Files in Metalsmith](/blog/minify-files-in-metalsmith)" on reducing the size of assets that are used in your final build output.  

## Project setup

To keep this article short and to the point we're not going to set up a full website, just enough to show sample usage. See "[Starting a Metalsmith Project](/blog/starting-a-metalsmith-project)" for a more complete article on how to set up a Metalsmith project.

### Installing packages

Starting with an empty project, install some Metalsmith packages:

```bash
npm install --save metalsmith metalsmith-html-unused
```

- [`metalsmith`](https://www.npmjs.com/package/metalsmith) for the base project.
- [`metalsmith-html-unused`](https://www.npmjs.com/package/metalsmith-html-unused) to remove unused static assets.

### Source file structure

Create the following directories and files for use in the build pipeline:

```text
.
├── index.js
└── src
    ├── index.html
    └── static
        ├── css
        │   ├── unused.css
        │   └── used.css
        ├── img
        │   ├── unused.png
        │   └── used.png
        └── js
            ├── unused.js
            └── used.js
```

You can fill in those CSS and JavaScript files with anything, or leave them blank entirely - their contents don't matter, just that they exist.

## Writing the source files

Fill in your `src/index.html` file like this, referencing each of the "used" assets:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <link rel="stylesheet" href="static/css/used.css">
</head>
<body>
<img src="static/img/used.png">
<script src="static/js/used.js"></script>
</body>
</html>
```

That way there are no HTML files that reference the "unused" assets.

Then set up your `index.js` file like this:

```javascript
const Metalsmith = require('metalsmith');
const unused     = require('metalsmith-html-unused');

Metalsmith(__dirname)
    .source('./src')         // source directory for the pipeline
    .use(unused({            // remove unused static assets
        pattern: '**/*.@(css|js|png)',
    }))
    .destination('./build')  // destination directory of the pipeline
    .clean(true)             // clean the destination directory before build
    .build(err => {          // execute the build
        if (err) {
            throw err;
        }
    });
```

This will:

- Scan through all HTML files in `src/` (so just `src/index.html`) looking for any `*.css`, `*.js`, and `*.png` files that are unused, and remove them from our output.
- Copy `src/index.html` to `build/index.html`.
- Copy `src/static/*/used.*` to `build/static/*/used.*` (and not `src/static/*/unused.*` as they were removed).

See the [`metalsmith-html-unused` options](https://www.npmjs.com/package/metalsmith-html-unused#options) for other available options.

### Build

Run the build command like normal:

```bash
node index
```

Then look in `build/static` and see that none of the "unused" assets are there.

## Uses

As stated in the intro, there's a number of reasons why you might want to remove unused files:

- It reduces the total size of files that will be uploaded.
- Could remove old versions of files/documents that shouldn't be available anymore.
- Could remove unused files before expensive processing (such as converting/resizing images with [`metalsmith-sharp`](https://www.npmjs.com/package/metalsmith-sharp)).

With such little code needed you might as well take this optimization!
