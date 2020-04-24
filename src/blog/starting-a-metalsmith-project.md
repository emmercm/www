---

title: Starting a Metalsmith Project
date: 2019-09-20T01:31:00

---

[Metalsmith](https://metalsmith.io/) is a plugin-based static site generator originally from [Segment](https://segment.com/). It's a current favorite of mine because of how sites are built as a pipeline of plugins where the output of each plugin is the input of the next. This allows for strong control over what happens and when it happens.

An simple pipeline could look like:

1. Set the input directory.
2. Convert all Markdown files to HTML.
3. Process all HTML files through a Handlebars template.
4. Set the output directory.
5. Clean the output directory.
6. Output all files.

While a more complex pipeline could look like:

1. Set the input directory.
2. Validate the frontmatter in all Markdown files.
3. Compile all Sass files to CSS.
4. Reduce the size of large images.
5. Convert all Markdown files to HTML.
6. Process all HTML files through a Handlebars template.
7. Add a favicon.
8. Minify HTML, CSS, and JavaScript.
9. Build a sitemap.
10. Set the output directory.
11. Clean the output directory.
12. Output all files.

As of writing, this website is built using Metalsmith and 44 plugins.

In this tutorial we'll first set up a blank project and then we'll continue to iterate on it by adding additional plugins and source files.

## Setting up Metalsmith

Setting up a Metalsmith project is a lot like setting up any other Node.js project, in the end you'll have a `package.json` and `package-lock.json`, `index.js`, and other source files throughout.

This guide assumes you already have Node.js installed.

### 1. Directory structure

The official Metalsmith [examples](https://metalsmith.io/#welcome) recommend a certain directory structure, so we'll stick to that. Throughout this guide I will continue to list the directory tree to keep things clear.

Go ahead and make a new directory for your project and a `src/` directory under that:

```text
.
└── src
```

### 2. Set up `nvm`

`nvm` or "Node Version Manager" is a way to install and run different versions of Node.js at the same time on one machine. But more importantly, it lets the project indicate what version should be used.

The full instructions for installation are on [GitHub](https://github.com/nvm-sh/nvm#installation-and-update), but in general it is as simple as:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
```

Metalsmith requires a Node.js version above 0.12.x so we'll instruct `nvm` to use the latest LTS version (currently 10.16.3) by creating a `.nvmrc` file at the root of our project with the contents:

```text
lts/*
```

And then running the command:

```bash
nvm install
```

Now our directory tree will look like:

```text
.
├── .nvmrc
└── src
```

### 3. Set up `npm`

`npm` or "Node Package Manager" is a tool to install Node.js packages and is the recommended way to install Metalsmith. To set up our project run the command:

```bash
npm init
```

And follow the prompts. Hitting the enter key for all prompts is fine for now if you don't want to fill it all out. This will create an initialized `package.json` for us:

```text
.
├── .nvmrc
├── package.json
└── src
```

### 4. Set up Metalsmith

From the root of our project run the command:

```bash
npm install --save metalsmith
```

Which will install Metalsmith and all required dependencies. This will create the `node_modules/` directory (with _many_ subdirectories in it) and the `package-lock.json` file. To save some space I'll skip writing out all the extra `node_modules/` subdirectories:

```text
.
├── .nvmrc
├── node_modules
│   └── metalsmith
├── package-lock.json
├── package.json
└── src
```

Now we're going to set up a dummy pipeline to make sure Metalsmith is installed and working right. Create an `index.js` file with the contents:

```javascript
const Metalsmith = require('metalsmith');

Metalsmith(__dirname)
    .source('./src')         // source directory for the pipeline
    .destination('./build')  // destination directory of the pipeline
    .clean(true)             // clean the destination directory before build
    .build(function (err) {  // execute the build
        if (err) {
            throw err;
        }
    });
```

And then run the command:

```bash
node index
```

If there is no output from the command we know Metalsmith is working right.

### 5. Adding an index page

You might have noticed after the `node index` command above it didn't actually create the `build/` directory like we configured in `index.js`, that's because there's nothing for it to output yet. Let's fix that by creating a file `src/index.html` with the contents:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title></title>
</head>
<body>
</body>
</html>
```

And then try the command again:

```bash
node index
```

We'll know this worked if it copied `src/index.html` to `build/index.html`:

```text
.
├── .nvmrc
├── build
│   └── index.html
├── index.js
├── node_modules
│   └── metalsmith
├── package-lock.json
├── package.json
└── src
    └── index.html
```

### 6. Creating a layout

We're not living in 1999 anymore and we have the power of HTML templating systems these days, thankfully. [Handlebars](https://handlebarsjs.com/) (`.hbs`) is a popular choice for Metalsmith and is what we're going to use, but there are plugins for other systems such as [Nunjucks](https://github.com/jstransformers/jstransformer-nunjucks) (`.njk`) as well.

Let's install both the layouts plugin as well as Handlebars like we did with Metalsmith:

```bash
npm install --save metalsmith-layouts jstransformer-handlebars
```

Now we need to add `metalsmith-layouts` as a step in our build process in `index.js`:

```javascript
const Metalsmith = require('metalsmith');
const layouts    = require('metalsmith-layouts');

Metalsmith(__dirname)
    .source('./src')         // source directory for the pipeline
    .use(layouts({           // <-- process all HTML files with Handlebars
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

By default `metalsmith-layouts` will look for templates in the `layouts/` directory, so let's create that and a file `layouts/page.hbs` that looks very similar to `src/index.html` but with a special Handlebars expression:

```handlebars
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title></title>
</head>
<body>
{{{ contents }}}
</body>
</html>
```

`{{{ contents }}}` here will be replaced with the body of any source file that uses this template. We use `{{{ }}}` instead of `{{ }}` to preserve any HTML in the source files.

Now that we've moved the structural HTML from `src/index.html` to `layouts/page.hbs` we can write a page body in `src/index.html`:

```html
<h1>This is a title!</h1>
<p>This is a paragraph.</p>
```

Then build:

```bash
node index
```

We'll end up with `build/index.html` looking like:

```html
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title></title>
</head>
<body>
<h1>This is a title!</h1>
<p>This is a paragraph.</p>
</body>
</html>
```

And a directory tree looking like:

```text
.
├── .nvmrc
├── build
│   └── index.html
├── index.js
├── layouts
│   └── page.hbs
├── node_modules
│   ├── jstransformer-handlebars
│   ├── metalsmith
│   └── metalsmith-layouts
├── package-lock.json
├── package.json
└── src
    └── index.html
```

### 7. Using Markdown

It's more common to use Markdown instead of HTML as an input source in Metalsmith because of its ease-of-use and familiarity among developers. Plus it's more portable so you'll be able to use it with a different static site generator in the future.

Markdown conversion requires another plugin:

```bash
npm install --save metalsmith-markdown
```

And an addition to our `index.js`:

```javascript
const Metalsmith = require('metalsmith');
const markdown   = require('metalsmith-markdown');
const layouts    = require('metalsmith-layouts');

Metalsmith(__dirname)
    .source('./src')         // source directory for the pipeline
    .use(markdown())         // <-- convert Markdown to HTML
    .use(layouts({           // process all HTML files with Handlebars
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

Then rename `src/index.html` to `src/index.md` and change it to Markdown syntax:

```markdown
# This is a title!

This is a paragraph.
```

And build:

```bash
node index
```

Which will give us a `build/index.html` very similar to before (heading IDs can be turned off with a `metalsmith-markdown` option):

```html
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title></title>
</head>
<body>
<h1 id="this-is-a-header">This is a title!</h1>
<p>This is a paragraph.</p>
</body>
</html>
```

And a directory tree:

```text
.
├── .nvmrc
├── build
│   └── index.html
├── index.js
├── layouts
│   └── page.hbs
├── node_modules
│   ├── jstransformer-handlebars
│   ├── metalsmith
│   ├── metalsmith-layouts
│   └── metalsmith-markdown
├── package-lock.json
├── package.json
└── src
    └── index.html
```

### 8. Frontmatter in Markdown

Wouldn't it be neat if we had a real page title instead of `<title></title>`? That's where frontmatter and page metadata comes in.

According to [Middleman](https://middlemanapp.com/basics/frontmatter/):

> Frontmatter allows page-specific variables to be included at the top of a template using the YAML or JSON format.

Adding frontmatter to our `src/index.md` looks like this:

```markdown
---

title: This is the Index

---

# This is a title!

This is a paragraph.
```

Where anything between the `---`'s is parsed as YAML and is made available to the templating system. Now we can use that information in `layouts/page.hbs` like so:

```handlebars
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{{ title }}</title>
</head>
<body>
{{{ contents }}}
</body>
</html>
```

And after building:

```bash
node index
```

We get `build/index.html`:

```html
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>This is the Index</title>
</head>
<body>
<h1 id="this-is-a-header">This is a title!</h1>
<p>This is a paragraph.</p>
</body>
</html>
```

### 9. Adding another page

All of the work so far has set us up nicely to be able to add new, consistent pages very quickly. Let's add an about page at `src/about.md`:

```markdown
---

title: About

---

This is a sample website built with Metalsmith.
```

Which after build:

```bash
node index
```

Produces `build/help.html`:

```html
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>About</title>
</head>
<body>
<p>This is a sample website built with Metalsmith.</p>
</body>
</html>
```

And a directory tree looking like:

```text
.
├── .nvmrc
├── build
│   ├── help.html
│   └── index.html
├── index.js
├── layouts
│   └── page.hbs
├── node_modules
│   ├── jstransformer-handlebars
│   ├── metalsmith
│   ├── metalsmith-layouts
│   └── metalsmith-markdown
├── package-lock.json
├── package.json
└── src
    ├── help.md
    └── index.html
```

### 10. Using template partials

Good development practices encourage splitting up code into smaller pieces that can be composed together. Template partials allow us to define HTML snippets, such as headers or footers, that can be used and re-used in our templates.

To make our lives easier let's install another plugin:

```bash
npm install --save metalsmith-discover-partials
```

And add it to our `index.js`:

```javascript
const Metalsmith       = require('metalsmith');
const discoverPartials = require('metalsmith-discover-partials');
const markdown         = require('metalsmith-markdown');
const layouts          = require('metalsmith-layouts');

Metalsmith(__dirname)
    .source('./src')          // source directory for the pipeline
    .use(discoverPartials())  // <-- find and register template partials
    .use(markdown())          // convert Markdown to HTML
    .use(layouts({            // process all HTML files with Handlebars
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

`metalsmith-discover-partials` looks for Handlebars files in the `partials/` directory by default, so go ahead and create that and the file `partials/header.hbs`:

```handlebars
<b>This is the header.</b>
<hr>
```

And we can reference it by its filename base in `layouts/page.hbs` like this:

```handlebars
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{{ title }}</title>
</head>
<body>
{{> header}}
{{{ contents }}}
</body>
</html>
```

And after one last build:

```bash
node index
```

We end up with a `build/index.html` of:

```html
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>This is the Index</title>
</head>
<body>
<b>This is the header</b>
<hr>
<h1 id="this-is-a-title">This is a title!</h1>
<p>This is a paragraph.</p>
</body>
</html>
```

And a directory tree of:

```text
.
├── .nvmrc
├── build
│   ├── help.html
│   └── index.html
├── index.js
├── layouts
│   └── page.hbs
├── node_modules
│   ├── jstransformer-handlebars
│   ├── metalsmith
│   ├── metalsmith-discover-partials
│   ├── metalsmith-layouts
│   └── metalsmith-markdown
├── package-lock.json
├── package.json
├── partials
│   └── header.hbs
└── src
    ├── help.md
    └── index.html
```

## Conclusion

Metalsmith is a great option for someone looking for a lot of control in a static site generator. There are many [different plugins](https://metalsmith.io/#the-community-plugins) that exist for processing different kinds of inputs and there is no strict order they need to be used in. With a minimal amount of setup that should be familiar to existing Node.js developers it's very quick to get started with Metalsmith.
