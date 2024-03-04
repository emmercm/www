---

title: Resetting the Working Directory on Script Exit
draft: true
tags:
- shell

---

Sometimes you need change the working directory in a shell script, so you should take care to reset it back.

Here's an example scenario: you've written a fairly complex shell script (e.g. in [Bash](https://www.gnu.org/software/bash/)), and it needs to reference files that are in its same directory. You cannot make assumptions about the working directory that your script was invoked from, so you have to sprinkle `dirname "$0"` everywhere. For example:

```bash
#!/usr/bin/env bash
set -euo pipefail

# Source some local file
. "$(dirname "$0")/aliases.sh"

# Load some local config
config=$(cat "$(dirname "$0")/config.json")

# Enumerate some local files
while read -r file; do
	# Do something with the file...
done <<< "$(find "$(dirname "$0")" -maxdepth 1 -type f)"
```

All of these are difficult to read because of the quotation and `$(...)` nesting.

Wouldn't it be easier to just make an assumption about the working directory? I strongly believe _no_, but we should feel free to change the working directory, _as long as we reset it on exit._ That last part is important, because you may be setting the caller up for confusion or danger.

## The one liner

Here's the trick, put this at the top of every script you write, just below the [shebang](https://en.wikipedia.org/wiki/Shebang_(Unix)).

```bash
# shellcheck disable=SC2064
trap "cd \"${PWD}\"" EXIT
```

Now you're safe to [`cd(1)`](https://linux.die.net/man/1/cd) to heart's content!

## Example

Here's the
<!--stackedit_data:
eyJoaXN0b3J5IjpbMTY1Njc2ODk0MSwyMDkwNDU5MDEzLC0zNT
czNzY4NzFdfQ==
-->