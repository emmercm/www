---

title: Resetting the Working Directory on Shell Script Exit
date: 2024-03-06T00:06:00
updated: 2024-03-06T16:35:00
tags:
- shell

---

Sometimes you need to change the working directory in a shell script. You should take care to reset it back.

Here's an example scenario: you've written a fairly complex shell script, and it needs to reference files that are in the same directory. You can't make assumptions about the working directory that your script was invoked from, so you have to sprinkle `dirname "$0"` everywhere.

`$0` is a [Bash "special parameter"](https://www.gnu.org/software/bash/manual/html_node/Special-Parameters.html) that "expands to the name of the shell or shell script." If the shell is invoked using a relative path, `$0` will be a relative path - it doesn't automatically resolve to a full path.

[`dirname(1)`](https://linux.die.net/man/1/dirname) prints the parent directory name of a file or subdirectory. `dirname(1)` also does not resolve paths to a full path.

Here's how to use `dirname "$0"` in a script:

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

Now you're safe to [`cd(1)`](https://linux.die.net/man/1/cd) to your heart's content!

_Note: if you use [ShellCheck](https://github.com/koalaman/shellcheck) to check your scripts for errors (and you should), you will need to put `# shellcheck disable=SC2064` above the one-liner to signal that we know what we're doing with the quotes._

## Examples

Here's the one-liner in action:

```bash
#!/usr/bin/env bash
set -euo pipefail

trap "cd \"${PWD}\"" EXIT
cd "$(dirname "$0")"

echo "Now I'm safe to reference files in '${PWD}' with relative paths!"
```

And after adding it to our example from above, we can now safely reference sibling files with relative paths:

```bash
#!/usr/bin/env bash
set -euo pipefail

trap "cd \"${PWD}\"" EXIT
cd "$(dirname "$0")"

# Source some local file
. ./aliases.sh

# Load some local config
config=$(cat ./config.json)

# Enumerate some local files
while read -r file; do
	# Do something with the file...
done <<< "$(find . -maxdepth 1 -type f)"
```

## Limitations

[`trap(1)`](https://man7.org/linux/man-pages/man1/trap.1p.html) doesn't work if the script is `SIGKILL`ed rather than `SIGTERM`inated (or other signals). `SIGKILL` must end processes immediately, which means any shutdown hooks like this will be skipped.

Here's a script to test this limitation:

```bash
#!/usr/bin/env bash
set -euo pipefail

trap "echo \"I exited gracefully!\"" EXIT

echo "My PID is: $$"
kill -s KILL "$$"
```

Running it would give an output similar to:

```shell
$ ./script.sh
My PID is: 17959
zsh: killed     ./script.sh
```

You can see that `I exited gracefully!` never printed.

## Alternatives

`cd -` and `cd "${OLDPWD}"` can both take you back to your previous directory in Bash, but the above [`trap`](https://man7.org/linux/man-pages/man1/trap.1p.html) solution is still better in case you need to change directories multiple times.
<!--stackedit_data:
eyJoaXN0b3J5IjpbOTkyNzE2NjgwXX0=
-->