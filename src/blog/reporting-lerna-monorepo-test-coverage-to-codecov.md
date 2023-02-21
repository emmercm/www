---

title: Reporting Lerna Monorepo Test Coverage to Codecov
date: 2030-02-21T01:13:00
tags:
- ci-cd
- github
- node.js
- testing

---

It's not straightforward, and you likely can't use preexisting CI tasks.

As part of my [migration of 15 Node.js projects to Lerna monorepo](/blog/migrating-existing-repos-to-a-lerna-monorepo), I wanted to keep Codecov test coverage working for each package. That means I wanted to be able to report on each package separately, in the form of a [shields.io](https://shields.io/) badge.

## Lerna setup

Each of your packages need a uniform way to output a test coverage report, such as:

```json5
// packages/*/package.json
{
  "scripts": {
    "test:coverage": "jest --verbose --coverage"
  }
}
```

Then, we can make ourselves an easy-to-use alias in the root `package.json`:

```json5
// package.json
{
  "private": true,
  "scripts": {
    "test:coverage": "lerna run test:coverage"
  }
}
```

If you have [Lerna caching](https://lerna.js.org/docs/concepts/how-caching-works) turned on, then make sure your script has its `outputs` configured:

```json5
// nx.json
{
  "tasksRunnerOptions": {
    "default": {
      "runner": "nx/tasks-runners/default",
      "options": {
        "cacheableOperations": [
          "test:coverage"
        ]
      }
    }
  },
  "targetDefaults": {
    "test:coverage": {
      "outputs": [
        "{projectRoot}/coverage"
      ]
    }
  }
}
```

## Codecov setup

Repositories in Codecov mirror those in GitHub. That means that you are only going to have one Codecov repository for your monorepo, not one per package.

"[Flags](https://docs.codecov.com/docs/flags)" is Codecov's term for named groups of coverage reports. When uploading our coverage reports, each Lerna package will get its own "flag."

Go ahead and set up your monorepo in Codecov, and copy the unique `CODECOV_TOKEN` UUID.

## GitHub setup

I'm going to use [GitHub Actions](https://docs.github.com/en/actions) workflow syntax to write a CI workflow, but this should work for other CI platforms as well.

Add that `CODECOV_TOKEN` UUID from the Codecov setup to your [repository's secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets).

Then, create a new GitHub Actions workflow at `.github/workflows/codecov.yml` (feel free to change the filename):

```yaml
# Requires repo secret: CODECOV_TOKEN ("repository upload token")

name: Codecov

on:
  pull_request:
    types:
      - opened
      - synchronize  # HEAD has changed, e.g. a push happened
      - reopened
  push:
    branches:
      - 'main'

jobs:
  # First, lint the root codecov.yml if it exists
  codecov-lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: formsort/action-check-codecov-config@v1

  # Then, generate every package's coverage report, and upload them individually
  codecov:
    needs:
      - codecov-lint
    runs-on: ubuntu-latest
    steps:
      # Clone the GitHub repository
      - uses: actions/checkout@v3

      # Set up our test runner to use the LTS version of Node.js
      - uses: actions/setup-node@v3
        with:
          node-version: lts/*
          cache: 'npm'
          # Use the Lerna package's lockfiles to generate a cache key
          cache-dependency-path: 'packages/**/package-lock.json'

      # Install the dependencies of every Lerna package
      - run: npm ci

      # Generate test coverage for every Lerna package, using our alias from above
      - run: npm run test:coverage

      # Individually upload each Lerna package's test coverage
      - run: |
          curl -Os https://uploader.codecov.io/latest/linux/codecov && chmod +x codecov
          for dir in packages/*; do
            ./codecov --dir "${dir}" --flags "$(basename "${dir}")" --token "${CODECOV_TOKEN}" --verbose
          done
        env:
          CODECOV_TOKEN: ${{ secrets.CODECOV_TOKEN }}
```

You can see this workflow in action in my [metalsmith-plugins](https://github.com/emmercm/metalsmith-plugins/blob/main/.github/workflows/codecov.yml) project.

_Note: you want to use the `--dir` flag rather than `--rootDir` in order to retain the `packages/*/` directory prefix on files, otherwise all of your different `index.js` may report as the same file._
