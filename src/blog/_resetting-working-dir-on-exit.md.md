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

## The one-liner

Here's the trick, put this at the top of every script you write, just below the [shebang](https://en.wikipedia.org/wiki/Shebang_(Unix)).

```bash
trap "cd \"${PWD}\"" EXIT
```

Now you're safe to [`cd(1)`](https://linux.die.net/man/1/cd) to heart's content!

_Note: if you use [ShellCheck](https://github.com/koalaman/shellcheck) to check your scripts for errors (and you should), you will need to put `# shellcheck disable=SC2064` above the one-liner to signal that we know what we're doing with the quotes._

## Example

Here's the one-liner in action, using the same example from above:

```bash
#!/usr/bin/env bash
set -euo pipefail

trap "cd \"${PWD}\"" EXIT
cd "$(dirname "$0")"

echo "Now I'm safe to reference files in '${PWD}' with relative paths!"
```

Updating our example from above:

```bash
#!/usr/bin/env bash
set -euo pipefail

trap "cd \"${PWD}\"" EXIT
cd "$(dirname "$0")"

# Source some local file
. "$(dirname "$0")/aliases.sh"

# Load some local config
config=$(cat "$(dirname "$0")/config.json")

# Enumerate some local files
while read -r file; do
	# Do something with the file...
done <<< "$(find "$(dirname "$0")" -maxdepth 1 -type f)"
```

## Limitations

This one-liner won't work if the script is `SIGKILL`ed rather than `SIGTERM`inated (or other signals). `SIGKILL` must end processes immediately, which means any shutdown hooks like this will be skipped.

Using this script as an example:

```bash
#!/usr/bin/env bash
set -euo pipefail

trap "echo \"I exited gracefully!\"" EXIT

echo "My PID is: $$"
kill -s KILL "$$"
```

running it would give an output similar to:

```shell
$ ./script.sh
My PID is: 17959
zsh: killed     ./script.sh
```
<!--stackedit_data:
eyJoaXN0b3J5IjpbODA3NDgwNDIwXX0=
-->