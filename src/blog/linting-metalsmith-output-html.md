---

title: Linting Metalsmith Output HTML
image: https://unsplash.com/photos/FPmNbH093vE
imageCredit: Photo by <a href="https://unsplash.com/@michealcopley03">Michael C</a> on <a href="https://unsplash.com/photos/FPmNbH093vE">Unsplash</a>
date: 2019-12-08T19:19:00
tags:
- metalsmith
- testing

---

Best I know, there aren't any good ways to test the output of a Metalsmith build to make sure things like updated dependencies didn't break styling or content. But one thing we can do is lint the output HTML to make sure it's at least syntactically correct and doesn't contain broken links.

## Project setup

To keep this article short and to the point we're not going to set up a full website, just enough to show sample usage. See "[Starting a Metalsmith Project](/blog/starting-a-metalsmith-project)" for a more complete article on how to set up a Metalsmith project.

### Installing packages

Starting with an empty project, install some Metalsmith packages:

```bash
npm install --save metalsmith metalsmith-formatcheck metalsmith-linkcheck
```

- [`metalsmith`](https://www.npmjs.com/package/metalsmith) for the base project.
- [`metalsmith-formatcheck`](https://www.npmjs.com/package/metalsmith-formatcheck) to lint our HTML with [`html-validator`](https://www.npmjs.com/package/html-validator) which uses [Nu Html Checker](https://validator.w3.org/nu/).
- [`metalsmith-linkcheck`](https://www.npmjs.com/package/metalsmith-linkcheck) to check for any broken links or images.

### Source file structure

Create the following directories and files for use in the build pipeline:

```text
.
├── index.js
└── src
    └── index.html
```

## Writing the source files

Set up your `index.js` file like this:

```javascript
const Metalsmith  = require('metalsmith');
const formatcheck = require('metalsmith-formatcheck');
const linkcheck   = require('metalsmith-linkcheck');

Metalsmith(__dirname)
    .source('./src')         // source directory for the pipeline
    .use(formatcheck({       // lint HTML (requires internet connection)
        failErrors: true,
        failWarnings: true
    }))
    .use(linkcheck({         // ensure no broken links (requires internet connection)
        failMissing: true
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
- Lint all HTML files using [Nu Html Checker](https://validator.w3.org/nu/) (which requires an active internet connection) and then output any/all failures to `src/format_failed.json` (configurable).
- Check all HTML files for broken `<a href="">`, `<img src="">`, `<link href="">`, and `<script src="">` tags (which requires an active internet connection) and then output any/all failures to `src/links_failed.json` (configurable).

Then fill in your `src/index.html` like this:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Lorem Ipsum</title>
</head>
<body>
Lorem ipsum dolor sit amet, consectetur adipiscing elit.
<script
        src="https://code.jquery.com/jquery-3.4.1.slim.min.js"
        integrity="sha256-pasqAKBDmFT4eHoN2ndd6lN370kFiGUFyTiUHWhU7k8="
        crossorigin="anonymous"></script>
</body>
</html>
```

### Build

Run the build command like normal:

```bash
node index
```

The build should pass as long as you have an active internet connection.

## Testing the checks

To make sure those plugins are doing their job, let's break the HTML.

### `metalsmith-formatcheck`

We can break the HTML linter in a few different ways:

- Delete the `<!DOCTYPE html>` tag.
- Remove the `lang="en"` attribute from the `<html>` tag.
- Delete the `<title>` tag inside `<head>`.

Making any of those changes and then building will fail with a non-zero exit code and leave you with an empty `build` output directory.

### `metalsmith-linkcheck`

We can cause broken links in a couple different ways:

- Change `https://code.jquery.com/jquery-3.4.1.slim.min.js` to something that doesn't exist such as `https://code.jquery.com/jquery-3.4.1-invalid-version.slim.min.js`.
- Reference a local file that doesn't exist such as `<script src="script.js"></script>`.

Making any of those changes and then building will fail with a non-zero exit code and leave you with an empty `build` output directory.
