---

title: Pin Your GitHub Actions to Protect Against Mutability
draft: true

---

Pinning third-party GitHub Actions to a commit SHA helps protect you against supply chain attacks.

If you've written a GitHub Actions workflow before then you've probably used a third-party action (an action that lives in another repository other than your own). Even GitHub-published [`actions/checkout`](https://github.com/actions/checkout) is considered "third-party":

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

Most examples you see online (and even most actions themselves) recommend specifying a major version number, such as `actions/checkout@v5` in the example above. This version corresponds to a Git tag name, which is typically created by a GitHub Release. For `actions/checkout@v5`, the latest tag for v5.x.x as of writing is [v5.0.0](https://github.com/actions/checkout/releases/tag/v5.0.0).

_Note: you can specify a Git branch name such as `actions/checkout@main`, but nearly no one recommends this, as it doesn't protect you from breaking changes between major versions._

Here's the problem with specifying a Git tag or Git branch: _they can change, they're "mutable."_

If an attacker gains access to a GitHub account that publishes actions, _they can commit malicious code and then update any or all of the existing Git tags to point to that new commit SHA._

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

Git tags correspond to a specific, single commit. Because the maintainers of `actions/checkout` publish releases, you can easily see [v5.0.0's](https://github.com/actions/checkout/releases/tag/v5.0.0) associated commit SHA. We can also find it with GitHub's REST API:

```shell
curl --silent https://api.github.com/repos/actions/checkout/tags \
	| jq '.[] | select(.name == "v5.0.0") | .commit'
```

- https://docs.github.com/en/actions/reference/security/secure-use#using-third-party-actions
- https://semgrep.dev/blog/2025/popular-github-action-tj-actionschanged-files-is-compromised/
- https://github.com/open-telemetry/sig-security/issues/69#issuecomment-2730078977

Limitations:

- Digest pinning doesn't mean 100% safety if you automate version updates
	- It prevents tag redirection: https://semgrep.dev/blog/2025/popular-github-action-tj-actionschanged-files-is-compromised/
	- Mitigated by holding back updates for a time period?
	- Writing out the full version would do something similar as using the digest hash
<!--stackedit_data:
eyJoaXN0b3J5IjpbLTE4OTc2MTQ4MDAsMTYwMjQzNjczMCw5MD
k5MTQ3NDksMTAyMzYzODgzN119
-->