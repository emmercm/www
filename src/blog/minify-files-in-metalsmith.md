---

title: Minify Files in Metalsmith
date: 2020-03-26T21:16:00

---

Minified files maintain all the functionality of their original source but optimize for size, which in turns means faster page loads and improved SEO - and it's a snap to do in Metalsmith.

## Project setup

To keep this article short and to the point we're not going to set up a full website, just enough to show sample usage. See "[Starting a Metalsmith Project](/blog/starting-a-metalsmith-project)" for a more complete article on how to set up a Metalsmith project.

### Installing packages

Starting with an empty project, install some Metalsmith packages:

```bash
npm install --save metalsmith metalsmith-uglify metalsmith-uncss-2 metalsmith-clean-css metalsmith-renamer metalsmith-html-minifier
```

- [`metalsmith`](https://www.npmjs.com/package/metalsmith) for the base project.
- [`metalsmith-uglify`](https://www.npmjs.com/package/metalsmith-uglify) to minify JavaScript files.
- [`metalsmith-uncss-2`](https://www.npmjs.com/package/metalsmith-uncss-2) to remove unused CSS rules.
- [`metalsmith-clean-css`](https://www.npmjs.com/package/metalsmith-clean-css) to minify CSS files.
- [`metalsmith-renamer`](https://www.npmjs.com/package/metalsmith-renamer) to rename minified CSS files.
- [`metalsmith-html-minifier`](https://www.npmjs.com/package/metalsmith-html-minifier) to minify HTML files.

### Source file structure

Create the following directories and files for use in the build pipeline:

```text
.
├── index.js
└── src
    ├── index.html
    └── static
        ├── css
        │   └── styles.css
        └── js
            └── scripts.js
```

The names of the files aren't important as all HTML, CSS, and JavaScript files will be minified.

Fill in those files with some dummy content such as:

```html
<!-- src/index.html -->
<!DOCTYPE html>
<html lang="en">
</html>
```

```css
/* src/static/css/styles.css */
body {
    background: white;
}
```

```javascript
// src/static/js/scripts.js
console.log('foo');
console.log('bar');
```

## Writing the source files

Set up your `index.js` file like this:

```javascript
const Metalsmith   = require('metalsmith');
const uglify       = require('metalsmith-uglify');
const uncss        = require('metalsmith-uncss-2');
const cleanCSS     = require('metalsmith-clean-css');
const renamer      = require('metalsmith-renamer');
const htmlMinifier = require('metalsmith-html-minifier');

Metalsmith(__dirname)
    .source('./src')         // source directory for the pipeline
    .destination('./build')  // destination directory of the pipeline
    .use(uglify({            // minify JavaScript files
        removeOriginal: true,
        uglify: {
            sourceMap: false
        }
    }))
    .use(uncss({             // remove unused CSS rules and combine files
        output: 'static/css/styles.css'
    }))
    .use(cleanCSS({          // minify CSS files
        cleanCSS: {
            rebase: false
        }
    }))
    .use(renamer({           // rename minified CSS files
        css: {
            pattern: '**/*.css',
            rename: file => file.replace(/\.css$/, '.min.css')
        }
    }))
    .use(htmlMinifier({      // minify HTML files
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
    }))
    .clean(true)             // clean the destination directory before build
    .build(function (err) {  // execute the build
        if (err) {
            throw err;
        }
    });
```

This will (in order):

- Minify all `/.js$/` (and not `/.min.js$/`) JavaScript files and change their extension to `.min.js`.
- Concatenate all `**/*.css` files into `static/css/styles.css` and remove unused CSS rules (based on the contents of all `**/*.html` HTML files).
- Minify `static/css/styles.css` in-place without rebasing URLs.
- Change the extension of all `**/*.css` (just `static/css/styles.css`) to `.min.css`.
- Minify all `**/*.html` files in-place, including in-line CSS and JavaScript.
- Copy `src/index.html` to `build/index.html`.

### Build

Run the build command like normal:

```bash
node index
```

Then the resulting files will all be minified and ready for deployment!
