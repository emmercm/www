---

title: Pin Your GitHub Actions to Protect Against Mutability
date: 2025-08-23T17:44:00
tags:
- ci-cd
- github
- renovate

---

Pinning third-party GitHub Actions to a commit SHA helps protect you against supply chain attacks.

If you've written a GitHub Actions workflow before, then you've probably used a third-party action (an action that lives in another repository other than your own). Even the GitHub-published [`actions/checkout`](https://github.com/actions/checkout) is considered "third-party":

```yaml
on:
  pull_request:

jobs:
  do-something:
    runs-on: ubuntu-latest
    steps:
      # This is a "third-party" action
      - uses: actions/checkout@v5

      # This is a "private" action
      - uses: ./.github/actions/my-custom-action
```

Most examples you see online (and even most actions' READMEs) recommend specifying a major version number, such as `actions/checkout@v5` in the example above. This version corresponds to a Git tag name, which is typically created by a GitHub Release. For `actions/checkout@v5`, the latest tag for v5.x.x as of writing is [v5.0.0](https://github.com/actions/checkout/releases/tag/v5.0.0).

_Note: you can specify a Git branch name such as `actions/checkout@main`, but nearly no one recommends this, as it doesn't protect you from breaking changes between major versions._

Here's the problem with specifying a Git tag or Git branch: _they can change, they're "mutable."_

If an attacker gains access to a GitHub account that publishes actions, _they can commit malicious code and then update any or all of the existing Git tags to point to that new malicious commit SHA._

This exact scenario happened in [March 2025](https://www.stepsecurity.io/blog/harden-runner-detection-tj-actions-changed-files-action-is-compromised) when the popular [`tj-actions/changed-files`](https://github.com/tj-actions/changed-files) action was compromised. [More than 350 Git tags](https://gist.github.com/stevebeattie/1847841fb3b1bfbf6d8449ae2fb0e8a2) were updated to a commit that attempted to dump the runner's secrets. More than 23,000 repositories were affected by this attack.

## Solution

So what can you do to protect yourself? Follow GitHub's "[secure [actions] use reference](https://docs.github.com/en/actions/reference/security/secure-use#using-third-party-actions)" and "pin" actions to their commit SHA. Updating our example above, that looks like this:

```yaml
on:
  pull_request:

jobs:
  do-something:
    runs-on: ubuntu-latest
    steps:
      # This is a "third-party" action
      - uses: actions/checkout@08c6903cd8c0fde910a37f88322edcfb5dd907a8 # v5.0.0

      # This is a "private" action
      - uses: ./.github/actions/my-custom-action
```

Git tags correspond to a single, specific commit. Because the maintainers of `actions/checkout` publish releases, you can easily see [v5.0.0's](https://github.com/actions/checkout/releases/tag/v5.0.0) associated commit SHA on the web page. We can also find it with GitHub's REST API:

```shell
$ curl --silent https://api.github.com/repos/actions/checkout/tags \
  | jq '.[] | select(.name == "v5.0.0") | .commit'
{
  "sha": "08c6903cd8c0fde910a37f88322edcfb5dd907a8",
  "url": "https://api.github.com/repos/actions/checkout/commits/08c6903cd8c0fde910a37f88322edcfb5dd907a8"
}
```

Updating your third-party actions to use a commit SHA instead of a version tag will protect you from "retargeting" attacks like the one that affected `tj-actions/changed-files`.

## Automating with Renovate

I love [Renovate](https://www.mend.io/renovate/). I use it in [a lot of my projects](https://github.com/search?q=user%3Aemmercm+%28path%3A**%2Frenovate.json+OR+path%3A**%2Frenovate.json5%29&type=code&ref=advsearch). I think it's light years ahead of Dependabot. And I blog about Renovate [often](/blog/tag/renovate/).

Renovate has a "helper" preset named [`helpers:pinGitHubActionDigestsToSemver`](https://docs.renovatebot.com/presets-helpers/#helperspingithubactiondigeststosemver) that will pin every GitHub Action you have to a commit SHA, and it will keep a human-readable version string up to date in a trailing comment. You can see it in action at [emmercm/igir#1823](https://github.com/emmercm/igir/pull/1823).

Here's a minimum viable `renovate.json5` config to automate these updates:

```json5
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": [
    // Pin GitHub Actions to commit SHAs, and keep them up to date
    "helpers:pinGitHubActionDigestsToSemver"
  ],

  // Don't update dependencies immediately
  "minimumReleaseAge": "7 days",

  "packageRules": [
    // Perform dependency pinning immediately
    {
      "matchUpdateTypes": ["pin", "pinDigest"],
      "groupName": "version pinning",
      "schedule": "at any time",
      "automerge": true
    }
  ],

  "github-actions": {
    "packageRules": [
      // Group non-major actions updates together, reduce update frequency
      {
        "matchDepTypes": ["action"],
        "matchUpdateTypes": ["patch", "minor"],
        "groupName": "GitHub Actions",
        "schedule": "before 4am on monday",
        "automerge": true
      }
    ]
  }
}
```

When you merge this config file, Renovate will immediately create a pull request pinning all of your un-pinned GitHub Actions. Then, it will keep the commit SHAs updated with automatic pull requests, reducing the maintenance burden on you.

_Note: this config will protect you against Git tag retargeting attacks, but `"automerge": true` will still leave you vulnerable to an attacker pushing new Git version tags. The `minimumReleaseAge` option intends to give a repository maintainer (or GitHub) time to delete any new malicious versions before you adopt them, but it isn't perfect. To be fully protected from attacks, you can set `"automerge": false` (the default)._

## Drawbacks

There are few scenarios that commit SHA pinning doesn't address, or doesn't address fully:

- **Automatic updates can newly expose you.**

  See the note above about how newly pushed Git version tags that contain malicious code can cause your dependency updater (Dependabot, Renovate) to pick up the malicious change.

- **The repository is already compromised.**

  Pinning only works if you trust the committed code, but if the code is already malicious, then pinning won't save you.

- **It doesn't address compromised transitive dependencies.**

  If a dependency that the third-party action uses is compromised, then pinning the action won't help you. Action maintainers need to adhere to good security practices as well, and it's your responsibility to vet the actions you use.
