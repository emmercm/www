---

title: Using Bootstrap 4 with Metalsmith
date: 2019-09-22T20:45:00

---

As a primarily back-end developer I tend to use [Bootstrap](https://getbootstrap.com/) in most of my full-stack applications. It's a great way to save some time getting a small project or prototype up and running. Using Bootstrap in [Metalsmith](https://metalsmith.io/) isn't complicated, it just takes 2 plugins.

## Project setup

This guide assumes some base understanding of Metalsmith, see "[Starting a Metalsmith Project](/blog/starting-a-metalsmith-project)" on how to set up a basic project.

### Installing packages

Starting with an empty project, install some Metalsmith plugins:

```bash
npm install --save metalsmith metalsmith-layouts jstransformer-handlebars metalsmith-markdown metalsmith-sass metalsmith-include-files
```

- `metalsmith`, `metalsmith-layouts`, `jstransformer-handlebars`, `metalsmith-markdown` as a base for our source parsing and templating.
- `metalsmith-sass` to compile the Bootstrap Sass which lets us customize its variables.
- `metalsmith-include-files` to include external JavaScript in our source files.

And then install [jQuery](https://jquery.com/) and [Bootstrap](https://getbootstrap.com/):

```bash
npm install --save jquery bootstrap
```

We'll ignore the [Popper.js](https://popper.js.org/) peer dependency as we'll use the bundled Bootstrap JavaScript which includes it.

### Source file structure

Create the following directories and files for use in the build pipeline:

```text
.
├── index.js
├── layouts
│   └── page.hbs
└── src
    ├── index.md
    └── static
        └── css
            └── bootstrap.scss
```

- `layouts/page.hbs` will be our primary template for `metalsmith-layouts` for common elements like the navigation bar.
- `src/static/css/bootstrap.scss` will be our primary Sass file that will optionally configure some variables before including Bootstrap.
- `src/index.md` will be our home page to processed through `metalsmith-markdown`.
- `index.js` will be the Metalsmith build file.

## Writing the source files

Now that we have all those plugins installed and files created let's start filling them in.

### Metalsmith build file

Set up your `index.js` file like this:

```javascript
const Metalsmith       = require('metalsmith');
const sass             = require('metalsmith-sass');
const include          = require('metalsmith-include-files');
const markdown         = require('metalsmith-markdown');
const layouts          = require('metalsmith-layouts');

Metalsmith(__dirname)
    .source('./src')          // source directory for the pipeline
    .use(sass())              // compile Sass
    .use(include({            // include external JavaScript
        'static/js': [
            './node_modules/jquery/dist/jquery.slim.min.js',
            './node_modules/bootstrap/dist/js/bootstrap.bundle.min.js'
        ]
    }))
    .use(markdown())          // convert Markdown to HTML
    .use(layouts({            // process all HTML files with Handlebars
        pattern: '**/*.html',
        default: 'page.hbs',
        engine: 'handlebars'
    }))
    .destination('./build')   // destination directory of the pipeline
    .clean(true)              // clean the destination directory before build
    .build(function (err) {   // execute the build
        if (err) {
            throw err;
        }
    });
```

This will:

- Compile all `*.scss` files with `metalsmith-sass`.
- Add the pre-built Bootstrap JavaScript and its dependencies as input files.
- Build `src/index.md` into `build/index.html` using `layouts/page.hbs` as the template.

Note the `pattern` configuration for `metalsmith-layouts`, without it our CSS and JavaScript files will also use the `layout/page.hbs` template.

### HTML template

The Bootstrap team does a great job of providing many [layout examples](https://getbootstrap.com/docs/4.0/examples/), so to keep this simple we'll use the "[Starter Template](https://getbootstrap.com/docs/4.0/examples/starter-template/)."

Fill in your `layouts/page.hbs` like this:

```html
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title>{{ title }}</title>
    <link href="static/css/bootstrap.css" rel="stylesheet">
</head>
<body cz-shortcut-listen="true">
<nav class="navbar navbar-expand-md navbar-dark bg-dark fixed-top">
    <a class="navbar-brand" href="#">Navbar</a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarsExampleDefault"
            aria-controls="navbarsExampleDefault" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarsExampleDefault">
        <ul class="navbar-nav mr-auto">
            <li class="nav-item active">
                <a class="nav-link" href="#">Home <span class="sr-only">(current)</span></a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#">Link</a>
            </li>
            <li class="nav-item">
                <a class="nav-link disabled" href="#">Disabled</a>
            </li>
            <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="http://example.com" id="dropdown01" data-toggle="dropdown"
                   aria-haspopup="true" aria-expanded="false">Dropdown</a>
                <div class="dropdown-menu" aria-labelledby="dropdown01">
                    <a class="dropdown-item" href="#">Action</a>
                    <a class="dropdown-item" href="#">Another action</a>
                    <a class="dropdown-item" href="#">Something else here</a>
                </div>
            </li>
        </ul>
        <form class="form-inline my-2 my-lg-0">
            <input class="form-control mr-sm-2" type="text" placeholder="Search" aria-label="Search">
            <button class="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
        </form>
    </div>
</nav>
<main role="main" class="container">
{{{ contents }}}
</main>
<script src="static/js/jquery.slim.min.js"></script>
<script src="static/js/bootstrap.bundle.min.js"></script>
</body>
</html>
```

Things to note are:

- The local `<link>` and `<script>` sources, they will end up in our `build/` directory thanks to `metalsmith-sass` and `metalsmith-include-files`.
- The `{{ title }}` placeholder to be replaced with the frontmatter from any `src/*.md` files.
- The `{{{ contents }}}` placeholder to be replaced with the contents of any `src/*.md` files.

### Index page

Continuing to use the example content from the "[Starter Template](https://getbootstrap.com/docs/4.0/examples/starter-template/)" example, fill `src/index.md` in with:

```markdown
---

title: Starter Template for Bootstrap

---

# Bootstrap starter template

Use this document as a way to quickly start any new project.

All you get is this text and a mostly barebones HTML document.
```

### Primary Sass file

To start, fill out `src/static/css/bootstrap.scss` with only:

```css
@import '../../../node_modules/bootstrap/scss/bootstrap';
```

That will get the stock Bootstrap building.

But the value of using `metalsmith-sass` to compile the Bootstrap Sass instead of using the pre-built CSS is we can customize various variables. If we wanted to change the primary color from blue to something else all we have to do is write:

```css
$primary: darkorange;

@import '../../../node_modules/bootstrap/scss/bootstrap';
```

Refer to the [official documentation](https://getbootstrap.com/docs/4.0/getting-started/theming/#variable-defaults) on available variables and how they work.

From here we can also add some custom CSS after all the Bootstrap rules:

```css
$primary: darkorange;

@import '../../../node_modules/bootstrap/scss/bootstrap';

body {
    background: darkgray;
}
```

## Conclusion

With using just 2 Metalsmith plugins we're able to customize and build the Bootstrap CSS from source and include the pre-built Bootstrap JavaScript in our input files.
