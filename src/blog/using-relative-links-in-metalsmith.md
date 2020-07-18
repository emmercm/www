---

title: Using Relative Links in Metalsmith
image: https://unsplash.com/photos/0La7MwJhSyo
imageCredit: 'Photo by <a href="https://unsplash.com/@franckinjapan">Franck V.</a> on <a href="https://unsplash.com/photos/0La7MwJhSyo">Unsplash</a>'
date: 2020-05-21T17:26:00
tags:
- metalsmith

---

Relative links in HTML increases a site's portability to be hosted from anywhere, and it's easy to automatically convert links in Metalsmith projects.

The main reason you would want to use relative links rather than semi-absolute links (those that start with `/`) is to make your output more portable, so it can be hosted from any directory. For example, JetBrains IDEs serve HTML files at `localhost:<port>/www/<path>`, though that's a very specific example.

## Project setup

To keep this article short and to the point we're not going to set up a full website, just enough to show sample usage. See "[Starting a Metalsmith Project](/blog/starting-a-metalsmith-project)" for a more complete article on how to set up a Metalsmith project.

### Installing packages

Starting with an empty project, install some Metalsmith packages:

```bash
npm install --save metalsmith metalsmith-html-relative
```

- [`metalsmith`](https://www.npmjs.com/package/metalsmith) for the base project.
- [`metalsmith metalsmith-html-relative`](https://www.npmjs.com/package/metalsmith-html-relative) to convert all local links to be relative links.

### Source file structure

Create the following directories and files for use in the build pipeline:

```text
.
├── index.js
└── src
    ├── contact
    │   └── index.html
    ├── index.html
    └── static
        └── css
            └── styles.css
```

No need to fill in `src/static/css/styles.css`, it just needs to exist.

## Writing the source files

Let's fill in the HTML files such that they reference each other and our CSS:

```html
<!-- src/index.html -->

<!DOCTYPE html>
<html lang="en">
<head>
    <title>Home</title>
    <link rel="stylesheet" href="/static/css/styles.css">
</head>
<body>
<h1>Home</h1>
<a href="/index.html">Home</a>
<a href="/contact/index.html">Contact</a>
</body>
</html>
```

```html
<!-- src/contact/index.html -->

<!DOCTYPE html>
<html lang="en">
<head>
    <title>Contact</title>
    <link rel="stylesheet" href="/static/css/styles.css">
</head>
<body>
<h1>Contact</h1>
<a href="/index.html">Home</a>
<a href="/contact/index.html">Contact</a>
</body>
</html>
```

Then set up your `index.js` file like this:

```javascript
const Metalsmith = require('metalsmith');
const relative   = require('metalsmith-html-relative');

Metalsmith(__dirname)
    .source('./src')         // source directory for the pipeline
    .use(relative())         // convert all local links to be relative links
    .destination('./build')  // destination directory of the pipeline
    .clean(true)             // clean the destination directory before build
    .build(err => {          // execute the build
        if (err) {
            throw err;
        }
    });
```

This will:

- Convert all local resource links (hyperlinks, CSS, JavaScript, images, etc.) in all HTML files to be relative.
- Copy everything in `src/` to `build/`.

See the [`metalsmith-html-relative` options](https://www.npmjs.com/package/metalsmith-html-relative#options) for other available options.

### Build and output

Run the build command like normal:

```bash
node index
```

And you'll get output similar to (minus comments):

```html
<!-- build/index.html -->

<!DOCTYPE html>
<html lang="en">
<head>
    <title>Home</title>
    <link rel="stylesheet" href="static/css/styles.css">  <!-- previously: /static/css/styles.css -->
</head>
<body>
<h1>Home</h1>
<a href="index.html">Home</a>  <!-- previously: /index.html -->
<a href="contact/index.html">Contact</a>  <!-- previously: /contact/index.html -->
</body>
</html>
```

```html
<!-- build/contact/index.html -->

<!DOCTYPE html>
<html lang="en">
<head>
    <title>Contact</title>
    <link rel="stylesheet" href="../static/css/styles.css">  <!-- previously: /static/css/styles.css -->
</head>
<body>
<h1>Contact</h1>
<a href="../index.html">Home</a>  <!-- previously: /index.html -->
<a href="index.html">Contact</a>  <!-- previously: /contact/index.html -->
</body>
</html>
```

Note that no local resource link begins with a forward slash (`/`), and there are a number of links that start with a parent directory reference (`../`).

## Conclusion

Admittedly the use cases for all of this are limited, but you can definitely save some time if you need it!
