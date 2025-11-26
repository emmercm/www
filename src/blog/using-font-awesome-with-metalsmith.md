---

title: Using Font Awesome with Metalsmith
date: 2019-12-01T23:55:00
tags:
- metalsmith
# - fontawesome

---

[Font Awesome](https://fontawesome.com/) is a large set of icon web fonts I've been using in multiple projects for years. They add [new icons](https://blog.fontawesome.com/new-music-tech-western-icons-in-5-11/) and entirely [new styles](https://blog.fontawesome.com/introducing-duotone/) all the time and in general their free tier is good enough for most projects to start. Let's dive into including their static assets into a Metalsmith project.

## Project setup

To keep this article short and to the point we're not going to set up a full website, just enough to show sample usage. See "[Starting a Metalsmith Project](/blog/starting-a-metalsmith-project)" for a more complete article on how to set up a Metalsmith project.

### Installing packages

Starting with an empty project, install some Metalsmith packages:

```shell
$ bash
npm install --save metalsmith metalsmith-include-files
```

- `metalsmith` for the base project.
- `metalsmith-include-files` to include the CSS and web fonts in our source files.

And then install Font Awesome:

```shell
$ bash
npm install --save @fortawesome/fontawesome-free
```

### Why not use a CDN?

This is a pretty obvious question, and a completely valid one. There are a lot of advantages to using a CDN:

- Edge servers closer to the visitor decrease download times.
- Reduced bandwidth costs on your primary server.
- Visitors may already have the assets cached from visiting a different site.

But there are also a number of reasons to not use a CDN:

- Having fixed package versions allows for reproducible builds.
- After a one time package install it allows for entirely offline builds.
- It allows you to control server caching of the static assets.
- Combining the Font Awesome CSS together with the rest of your CSS using a plugin such as `metalsmith-concat` reduces the network calls the browser needs to make.
- Trimming unused CSS rules with a plugin such as `metalsmith-css-unused` reduces the size of CSS files the browser needs to fetch.

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
const Metalsmith = require('metalsmith');
const include    = require('metalsmith-include-files');

Metalsmith(__dirname)
    .source('./src')         // source directory for the pipeline
    .use(include({           // include external CSS and web fonts
        'static/css': [
            './node_modules/@fortawesome/fontawesome-free/css/all.min.css'
        ],
        'static/webfonts': [
            './node_modules/@fortawesome/fontawesome-free/webfonts/*'
        ]
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
- Copy required Font Awesome static assets to `build/static`.

Then fill in your `src/index.html` like this:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <link rel="stylesheet" href="static/css/all.min.css">
</head>
<body>
<div style="font-size: 100px;">
    <i class="fab fa-fort-awesome"></i>
    <i class="fab fa-font-awesome"></i>
</div>
</body>
</html>
```

### Build

Run the build command like normal:

```shell
$ bash
node index
```

Then open the resulting `build/index.html` in your browser and you should see the two icons displayed.

## Using the pro version of Font Awesome

As of writing, the pro tier of Font Awesome has more than 4x the icons of the free tier, and more styles available. It's pricey but may be worth it for your application.

All of the above instructions still apply, but the package name is changed to `@fortawesome/fontawesome-pro`. See the "[Using a Package Manager](https://fontawesome.com/how-to-use/on-the-web/setup/using-package-managers)" page for instructions on installation.
<!--stackedit_data:
eyJoaXN0b3J5IjpbLTExMzkxNjE0MzFdfQ==
-->