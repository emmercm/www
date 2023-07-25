---

title: Skippable GitHub Status Checks Aren't Really Required
date: 2023-07-25T22:21:00
tags:
- ci-cd
- github

---

If your GitHub branch protection rule requires a status check, but that status check can be skipped, you aren't actually protected.

I had a frustrating confluence of unexpected behavior this week. The automated dependency updater, Renovate, which I've written about a [few](/blog/keep-npm-packages-updated-with-renovate) [times](/blog/keep-docker-base-images-updated-with-renovate/), started setting pull requests as auto-merge, which [ignores my configured schedule](https://github.com/renovatebot/renovate/issues/21436). This became a problem for me because Renovate was actually protecting me from some unexpected GitHub behavior. Renovate wasn't merging its pull requests unless required status checks were _explicitly_ passing. But this differs from GitHub pull request auto-merge behavior...

**If you have a GitHub branch protection rule, and that rule requires "status checks to pass before merging", GitHub will treat skipped GitHub Actions jobs as "passing".**

_Read that again._ The actual verbiage in the branch protection settings page, as of writing, is:

> ☑ Require status checks to pass before merging
>
> Choose which status checks must pass before branches can be merged into a branch that matches this rule.

I'm fairly confident stating most people would _not_ expect "skipped" to equate to "passed". If my GitHub Actions job (e.g. running `npm test`) never ran, then it cannot pass.

## Example scenario

Let's say I have a Node.js application, and I want to require its tests to pass before pull request merging.

An example GitHub Actions workflow might look like this:

```yaml
name: Project CI

on:
  pull_request:

jobs:
  eslint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx eslint .

  test:
    needs:
      # ESLint must pass before running tests
      - eslint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
```

I can then require the status check `test` before my pull requests are able to merge. But if `eslint` fails, then `test` will be skipped, and I will still be able to merge the failing pull request.

We could solve this by combining the two jobs, but there are scenarios where we wouldn't want to, such as with a [matrix strategy](https://docs.github.com/en/actions/using-jobs/using-a-matrix-for-your-jobs).

Here we make sure our application can run on any OS, and with older versions of Node.js:

```yaml
name: Project CI

on:
  pull_request:

jobs:
  eslint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx eslint .

  test:
    needs:
      # ESLint must pass before running tests
      - eslint
    strategy:
      matrix:
        os: [ ubuntu, macos, windows ]
        node-version: [ lts/*, lts/-1, lts/-2 ]
    runs-on: ${{ matrix.os }}-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      - run: npm ci
      - run: npm test
```

This will run our tests 9 times, but our linter only once. But there are now 9 status checks we would have to require in our branch protection:

- `test (macos, lts/*)`
- `test (macos, lts/-1)`
- `test (macos, lts/-2)`
- `test (ubuntu, lts/*)`
- `test (ubuntu, lts/-1)`
- `test (ubuntu, lts/-2)`
- `test (windows, lts/*)`
- `test (windows, lts/-1)`
- `test (windows, lts/-2)`

So we can add a third, dummy job to be used as our required status check:

```yaml
name: Project CI

on:
  pull_request:

jobs:
  eslint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx eslint .

  test:
    # We no longer need to depend on `eslint`
    strategy:
      matrix:
        os: [ ubuntu, macos, windows ]
        node-version: [ lts/*, lts/-1, lts/-2 ]
    runs-on: ${{ matrix.os }}-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      - run: npm ci
      - run: npm test

  status-check:
    needs:
      # Require every other job in this workflow
      - eslint
      - test
    runs-on: ubuntu-latest
    steps:
      - run: echo ok
```

That even lets us run ESLint and `npm test` at the same time! Except, if either of the jobs fails, `status-check` will be skipped and GitHub will let us merge our pull request.

## The solution

That `status-check` job from above? We can swap it out with a prebuilt GitHub Action and make all of our troubles go away.

[Sviatoslav Sydorenko](https://github.com/webknjaz) has written a GitHub Action, [alls-green](https://github.com/marketplace/actions/alls-green), that intelligently analyzes the statuses of required jobs. The action works by configuring the job to _always_ run, even when dependent jobs have failed. This allows `status-check` to never be skipped and to always _explicitly_ succeed or fail.

Usage looks like this:

```yaml
name: Project CI

on:
  pull_request:

jobs:
  eslint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx eslint .

  test:
    strategy:
      matrix:
        os: [ ubuntu, macos, windows ]
        node-version: [ lts/*, lts/-1, lts/-2 ]
    runs-on: ${{ matrix.os }}-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      - run: npm ci
      - run: npm test

  status-check:
    # Always run this job!
    if: always()
    needs:
      - eslint
      - test
    runs-on: ubuntu-latest
    steps:
      # Use the GitHub Action rather than our dummy Bash
      - uses: re-actors/alls-green@release/v1
        with:
          jobs: ${{ toJSON(needs) }}
```

**Now you're protected from unexpected GitHub behavior.**

As always, there are other ways to achieve this same result, such as Bruno Scheufler's [intermediate status-checking job](https://brunoscheufler.com/blog/2022-04-09-the-required-github-status-check-that-wasnt). But nothing I found was as simple to plug into my existing complex workflows as [alls-green](https://github.com/marketplace/actions/alls-green).
