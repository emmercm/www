---

title: Use GitHub Actions Timeouts to Protect Your Budget
date: 2023-11-05T15:50:00
tags:
- ci-cd
- github

---

The default job timeout of _6 hours_ is unreasonably long.

I just got an email that I exhausted "100% of included services" for my personal GitHub account. No warning email, just entirely exhausted. My quota doesn't reset for 17 days, so that means I'll either have to pay for minutes or wait out that period.

At first, I thought "this makes sense, I've been doing a lot with [emmercm/metalsmith-plugins](https://github.com/emmercm/metalsmith-plugins) lately, and I haven't been efficient with my pull request count (see my [months of dependency update catch-ups](/blog/keep-lerna-monorepos-updated-with-renovate))." But that wasn't it. In your GitHub account's [billing page](https://github.com/settings/billing/summary) you can request a usage report CSV be emailed to you, so I did that.

First off, [I`igir`](https://igir.io/) was entirely missing from the CSV, which is provably wrong. I have actions running on that repository [all the time](https://github.com/emmercm/igir/actions). But what stood out to me was a private repository I was using to test [Renovate](https://www.mend.io/renovate/) config options. That repository had spent 6h32m on running tests on a macOS runner (lines for other repositories have been redacted):

```csv
Date,Product,SKU,Quantity,Unit Type,Price Per Unit ($),Multiplier,Owner,Repository Slug,Username,Actions Workflow,Notes
2023-11-03,Actions,Compute - UBUNTU,11,minute,0.008,1.0,emmercm,metalsmith-plugins-renovate,emmercm,.github/workflows/codecov.yml,
2023-11-03,Actions,Compute - UBUNTU,2,minute,0.008,1.0,emmercm,metalsmith-plugins-renovate,emmercm,.github/workflows/repo-update.yml,
2023-11-03,Actions,Compute - UBUNTU,3,minute,0.008,1.0,emmercm,metalsmith-plugins-renovate,emmercm,.github/workflows/publish.yml,
2023-11-03,Actions,Compute - UBUNTU,10,minute,0.008,1.0,emmercm,metalsmith-plugins-renovate,renovate[bot],.github/workflows/test.yml,
2023-11-03,Actions,Compute - UBUNTU,1,minute,0.008,1.0,emmercm,metalsmith-plugins-renovate,renovate[bot],.github/workflows/codecov.yml,
2023-11-03,Actions,Compute - MACOS,20,minute,0.08,10.0,emmercm,metalsmith-plugins-renovate,renovate[bot],.github/workflows/test.yml,
2023-11-03,Actions,Compute - WINDOWS,22,minute,0.016,2.0,emmercm,metalsmith-plugins-renovate,renovate[bot],.github/workflows/test.yml,
2023-11-03,Actions,Compute - UBUNTU,41,minute,0.008,1.0,emmercm,metalsmith-plugins-renovate,emmercm,.github/workflows/test.yml,
2023-11-03,Actions,Compute - MACOS,402,minute,0.08,10.0,emmercm,metalsmith-plugins-renovate,emmercm,.github/workflows/test.yml,
2023-11-03,Actions,Compute - WINDOWS,76,minute,0.016,2.0,emmercm,metalsmith-plugins-renovate,emmercm,.github/workflows/test.yml,
```

_You can see a public copy of this workflow's definition for yourself at [emmercm/metalsmith-plugins](https://github.com/emmercm/metalsmith-plugins/blob/0574701c93e70c02382e6aaccc451d7fe0735a7b/.github/workflows/test.yml)._

I only made this repository in the last 24 hours, how on earth did it burn most of my month's budget in that time?

**Because, as it turns out, GitHub Actions jobs have a default timeout of _6 hours_.**

I do not know why, but my `lerna test` command (that spawns many `npm test` [Jest](https://jestjs.io/) processes at once) hung for no explainable reason. The job normally takes less than 1m30s to run. So now I'm out of quota for the month because a single step in a single job used 240x more minutes than it should have.

The solution? Applying [`timeout-minutes`](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idtimeout-minutes) everywhere you can.

## Example

Let's see what explicitly setting a timeout looks like with the workflow that exhausted my budget:

```yaml
name: Project CI

on: pull_request

jobs:
  node-unit:
    runs-on: ${{ matrix.os }}-latest

    # Set a reasonable timeout, 120x shorter than GitHub's default
    timeout-minutes: 5

    strategy:
      matrix:
        os: [ ubuntu, macos, windows ]
        node-version: [ lts, 18 ]
    steps:
      - uses: actions/checkout@v4
      - name: Use Node.js ${{ matrix.node-version }}
        uses: volta-cli/action@v4
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm ci
      - run: npm test
```

_See [`jobs.<job_id>.timeout-minutes`](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idtimeout-minutes) for the official docs._

Sometimes `npm ci` can take a while, so a timeout of 5 minutes provides a reasonable 3m30s if I estimate `npm test` will take 1m30s.

If I want to get more explicit, timeouts can be set on individual steps:

```yaml
name: Project CI

on: pull_request

jobs:
  node-unit:
    runs-on: ${{ matrix.os }}-latest
    strategy:
      matrix:
        os: [ ubuntu, macos, windows ]
        node-version: [ lts, 18 ]
    steps:
      - uses: actions/checkout@v4
      - name: Use Node.js ${{ matrix.node-version }}
        uses: volta-cli/action@v4
        with:
          node-version: ${{ matrix.node-version }}

      - run: npm ci
        # Set a reasonable timeout, 180x shorter than GitHub's default
        timeout-minutes: 2

      - run: npm test
        # Set a reasonable timeout, 180x shorter than GitHub's default
        timeout-minutes: 2
```

_See [`jobs.<job_id>.steps[*].timeout-minutes`](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idstepstimeout-minutes) for the official docs._

## Summary

Six hours is an irresponsible default timeout length, and you should set timeouts on your jobs before you find yourself in the same situation.

See me talk about other unexpected GitHub Actions behavior in "[Skippable GitHub Status Checks Aren't Really Required](/blog/skippable-github-status-checks-aren-t-really-required)."
<!--stackedit_data:
eyJoaXN0b3J5IjpbLTU2MjU5NjY4MF19
-->