---

title: Migrating Existing Repos to a Lerna Monorepo
date: 2030-02-20T23:02:00
tags:
- node.js
- git

---

As of writing, I maintain 15 [Metalsmith plugins](https://www.npmjs.com/settings/emmercm/packages), and it has become a pain to manage all of them.

[Metalsmith](https://metalsmith.io/) is a plugin-based static site generator that I've been using since early 2019. Hype had already died down for the project, and as a result many plugins were already abandoned, but it fit my needs perfectly and I learned how to write and publish my own plugins that I needed. [My articles](/blog/tag/metalsmith/) on Metalsmith were some of the earliest ones I wrote for this blog, and Metalsmith is still what powers it. [Kevin Van Lierde](https://github.com/webketje) has undertaken the monumental task of reviving the project, which continues to encourage me to maintain my plugins.

But 15 different GitHub repositories, that have 15 different [CircleCI](https://circleci.com/) projects, has been a lot to maintain. Motivated by CircleCI's [holiday 2022-2023 incident](https://circleci.com/blog/jan-4-2023-incident-report), I wanted to consolidate the management of these repositories.

## Available options

Cursory research led to a few different monorepo options:

1. Entirely self-managed
2. [Lerna](https://lerna.js.org/)
3. [Turborepo](https://turbo.build/repo)

My requirements for any monorepo migration was:

1. Git history from the previous repositories needs to be preserved. I have years of history in each repository that I don't want squashed.
2. [Renovate](/blog/keep-npm-packages-updated-with-renovate/) needs to keep working on autopilot (after some tweaking, of course).
3. A CI/CD system needs to be able to keep publishing npm packages individually on autopilot, to dovetail with Renovate.

None of my plugin repositories have any real number of stars on GitHub, so I wasn't worried about losing those.

Even though I don't like relying on tools in the Node.js ecosystem because of their boom and bust nature, I also value my time. [Lerna](https://lerna.js.org/) appeared to fit all of my needs out of the box, so that's what I chose.

## Prepping migration

Because I have [Renovate](https://www.mend.io/free-developer-tools/renovate/) enabled on every project I publish publicly, I needed to revoke its permissions from all the old repositories to stop it from creating new pull requests. You can do this from the [GitHub Applications](https://github.com/settings/installations) page.

Then, because sometimes Renovate doesn't auto-merge pull requests that it's configured to (I haven't figured out why), I needed to make sure all open pull requests were merged on all the repositories. This caused some dependency upgrade patch version bumps.

## Migrating repositories

First step was to make the new GitHub repository, [emmercm/metalsmith-plugins](https://github.com/emmercm/metalsmith-plugins). I granted [Renovate](https://www.mend.io/free-developer-tools/renovate/) permissions at time of creation.

Next, we're going to need a temporary workspace for us to check out clean versions of every repository:

```shell
cd $(mktemp -d)
git clone https://github.com/emmercm/metalsmith-plugins.git
git clone https://github.com/emmercm/metalsmith-collections-related.git
git clone https://github.com/emmercm/metalsmith-css-unused.git
git clone https://github.com/emmercm/metalsmith-github-profile.git
git clone https://github.com/emmercm/metalsmith-htaccess.git
git clone https://github.com/emmercm/metalsmith-html-glob.git
git clone https://github.com/emmercm/metalsmith-html-linter.git
git clone https://github.com/emmercm/metalsmith-html-relative.git
git clone https://github.com/emmercm/metalsmith-html-sri.git
git clone https://github.com/emmercm/metalsmith-html-unused.git
git clone https://github.com/emmercm/metalsmith-include-files.git
git clone https://github.com/emmercm/metalsmith-link-checker.git
git clone https://github.com/emmercm/metalsmith-mermaid.git
git clone https://github.com/emmercm/metalsmith-reading-time.git
git clone https://github.com/emmercm/metalsmith-tracer.git
git clone https://github.com/emmercm/metalsmith-vega.git
```

We'll do a typical Lerna initialize, with independent versions for each package:

```shell
$ cd metalsmith-plugins
$ npx lerna@latest init --independent
$ tree .
.
├── LICENSE
├── README.md
├── lerna.json
├── package.json
└── packages

$ npm install
$ git add .
$ git commit -m "npx lerna@latest init"
```

And then start a multi-minute process of importing all the repositories:

```shell
$ find .. -type d -mindepth 1 -maxdepth 1 ! -name 'metalsmith-plugins' -exec npx lerna@latest import '{}' --preserve-commit --yes \;
$ tree . -L 2 -I node_modules
.
├── LICENSE
├── README.md
├── lerna.json
├── package-lock.json
├── package.json
└── packages
    ├── metalsmith-collections-related
    ├── metalsmith-css-unused
    ├── metalsmith-github-profile
    ├── metalsmith-htaccess
    ├── metalsmith-html-glob
    ├── metalsmith-html-linter
    ├── metalsmith-html-relative
    ├── metalsmith-html-sri
    ├── metalsmith-html-unused
    ├── metalsmith-include-files
    ├── metalsmith-link-checker
    ├── metalsmith-mermaid
    ├── metalsmith-reading-time
    ├── metalsmith-tracer
    └── metalsmith-vega

$ git log --pretty=format:"%h%x09%an%x09%ad%x09%s"
7b635c4 renovate[bot]   Thu Dec 1 13:44:14 2022 +0000   Update Dev Dependencies (#13)
e1b01a9 renovate[bot]   Thu Dec 1 10:50:55 2022 +0000   Update dependency vega-lite to ^5.6.0 (#12)
c561686 renovate[bot]   Tue Nov 1 11:57:25 2022 +0000   Update Dev Dependencies (#11)
52c5cae renovate[bot]   Tue Nov 1 08:13:06 2022 +0000   Update dependency metalsmith to ^2.5.1 (#10)
fecde5d renovate[bot]   Sat Oct 1 10:36:31 2022 +0000   Update Dev Dependencies (#9)
2fb7ec6 renovate[bot]   Thu Sep 1 13:01:36 2022 +0000   Update Dev Dependencies (#8)
59baeb6 renovate[bot]   Thu Sep 1 12:59:56 2022 +0000   Update Dependencies (#7)
fe8e495 Christian Emmer Wed Jul 27 19:08:19 2022 -0700  v0.0.3 (#6)
71417a2 Christian Emmer Tue Jul 26 23:16:50 2022 -0400  README Update (#5)
a69d6f9 Christian Emmer Tue Jul 26 23:13:40 2022 -0400  v0.0.2 (#4)
059b18e Christian Emmer Mon Jul 25 21:28:21 2022 -0400  Fix Default Branch Name (#2)
4f04b9e Christian Emmer Mon Jul 25 21:22:13 2022 -0400  v0.0.1 (#1)
0dfafa8 Christian Emmer Mon Jul 25 18:11:01 2022 -0400  Initial commit
be3bdc7 renovate[bot]   Wed Feb 1 10:03:37 2023 +0000   Update dependency deepmerge to ^4.3.0 (#105)
3e416a1 renovate[bot]   Wed Feb 1 10:01:40 2023 +0000   Update Dev Dependencies (#104)
```

Lerna uses [npm workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces) by default, which was added in npm v7 (Node.js v15). npm v7 uses `lockfileVersion` 2, so let's go ahead and upgrade some old `package-lock.json`s:

```shell
nvm use 16
grep -l '"lockfileVersion": 1' packages/*/package-lock.json | while read line; do npm install --prefix "$(dirname "${line}")"; done
```

And finally, we'll install every package's dependencies:

```shell
npm install
```

## Lerna setup

Lerna uses [npm workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces) by default, so some duplicate packages are going to share the same `node_modules` folder in the root of the repository. In some of my `package.json` `scripts` I was referencing some binaries locally, such as `./node_modules/.bin/jest`, so we need to fix that:

```shell
sed -i 's;./node_modules/.bin/\([^/]*\);../../node_modules/.bin/\1;' packages/*/package.json
git add .
git commit -m "Fix binary locations"
```

We can tell Lerna it can cache some idempotent npm `scripts` commands, commands whose output only changes if the input files change:

```shell
$ ./node_modules/.bin/lerna add-caching
lerna notice cli v6.5.1
lerna info add-caching Please answer the following questions about the scripts found in your workspace in order to generate task runner configuration

? Which scripts need to be run in order? (e.g. before building a project, dependent projects must be built.)

? Which scripts are cacheable? (Produce the same output given the same input, e.g. build, test and lint usually are, serve and
start are not.)
 lint, test, test:junit
? Does the "lint" script create any outputs? If not, leave blank, otherwise provide a path relative to a project root (e.g.
dist, lib, build, coverage)

? Does the "test" script create any outputs? If not, leave blank, otherwise provide a path relative to a project root (e.g.
dist, lib, build, coverage)

? Does the "test:junit" script create any outputs? If not, leave blank, otherwise provide a path relative to a project root
(e.g. dist, lib, build, coverage)
 junit.xml

lerna success add-caching Successfully updated task runner configuration in `nx.json`
lerna info add-caching Learn more about task runner configuration here: https://lerna.js.org/docs/concepts/task-pipeline-configuration
lerna info add-caching Note that the legacy task runner options of --sort, --no-sort and --parallel no longer apply. Learn more here: https://lerna.js.org/docs/lerna6-obsolete-options

$ git add .
$ git commit -m "lerna add-caching"
```

And we can check everything is working right by running all of our existing unit tests:

```shell
$ ./node_modules/.bin/lerna run test --skip-nx-cache
lerna notice cli v6.5.1

    ✔  metalsmith-htaccess:test (11s)
    ✔  metalsmith-include-files:test (11s)
    ✔  metalsmith-css-unused:test (11s)
    ✔  metalsmith-tracer:test (11s)
    ✔  metalsmith-html-glob:test (11s)
    ✔  metalsmith-html-unused:test (11s)
    ✔  metalsmith-html-relative:test (11s)
    ✔  metalsmith-reading-time:test (12s)
    ✔  metalsmith-html-linter:test (12s)
    ✔  metalsmith-collections-related:test (12s)
    ✔  metalsmith-github-profile:test (12s)
    ✔  metalsmith-html-sri:test (12s)
    ✔  metalsmith-vega:test (17s)
    ✔  metalsmith-mermaid:test (18s)
    ✔  metalsmith-link-checker:test (19s)

 ——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 >  Lerna (powered by Nx)   Successfully ran target test for 15 projects (19s)
```

## Migration cleanup

After all of those `lerna import` commands we're going to need some cleanup.

First, let's move some common files to the root directory and symlink them as needed:

```shell
$ cp packages/metalsmith-collections-related/.editorconfig ./
$ cp packages/metalsmith-collections-related/.eslintrc ./.eslintrc.script.json
$ cp packages/metalsmith-collections-vega/.eslintrc ./.eslintrc.module.json
$ rm packages/*/.editorconfig
$ rm packages/*/.eslintrc
$ for dir in packages/*; do cd "${dir}" && ln -s ../../.eslintrc.script.json .eslintrc && cd ../..; done
$ git add .
$ git commit -m "Symlink duplicated files"
```

Then, let's get rid of some files that we're going to recreate in the root directory:

```shell
$ rm -rf packages/*/.circleci
$ rm packages/*/.gitignore
$ rm packages/*/LICENSE
$ rm packages/*/renovate.json
$ git add .
$ git commit -m "Remove duplicated files"
```

Then, let's correct some URLs from `package.json`, `README.md`, and other places:

```shell
$ sed -i 's;https://github.com/emmercm/metalsmith-[a-z-]*/blob/\(main\|master\)/LICENSE;https://github.com/emmercm/metalsmith-plugins/blob/main/LICENSE;' packages/*/*.*
$ sed -i 's;https://github.com/emmercm/metalsmith-[a-z-]*\(.git\|/blob\|/issues\);https://github.com/emmercm/metalsmith-plugins\1;' packages/*/*.*
$ sed -i 's;https://github.com/emmercm/\(metalsmith-[a-z-]*\)#readme;https://github.com/emmercm/metalsmith-plugins/tree/main/packages/\1#readme;' packages/*/*.*
$ git add .
$ git commit -m "Fix repository URLs"
```

We can make our lives a little easier with some aliases in our root `package.json`:

```json
{
  "scripts": {
    "clean": "lerna clean --yes",
    "test": "lerna run test",
    "test:junit": "lerna run test:junit"
  }
}
```

At this point we're ready to delete the temporary directory we've been working in. We're also ready to turn [branch protections](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches) on for `main` and require pull requests for all future changes.

## Next steps

1. Write a proper [README](https://github.com/emmercm/metalsmith-plugins/blob/main/README.md)
2. Create a GitHub Actions [workflow](https://github.com/emmercm/metalsmith-plugins/blob/main/.github/workflows/test.yml) for automated testing
3. Create a GitHub Actions [workflow](https://github.com/emmercm/metalsmith-plugins/blob/main/.github/workflows/codecov.yml) for automated Codecov reporting
4. Create a GitHub Actions [workflow](https://github.com/emmercm/metalsmith-plugins/blob/main/.github/workflows/publish.yml) for automated npm publishing
5. Update the old GitHub repositories' READMEs with a link to the new repository, and mark the repositories as archived
6. Write a new Renovate config
