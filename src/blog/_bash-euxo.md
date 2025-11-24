---

title: Safer Shell Scripts Through Shell Options
tags:
- shell

---

Unlike typical programming languages, Bash doesn't terminate when it encounters an exception.

Here's an example scenario of re-building an existing project from source:

```bash
# Go to the project directory
# (if $PROJECT_DIR is unset, this will silently do nothing)
cd "${PROJECT_DIR}"

# Remove untracked files and pull the latest version
git clean -fdx
git pull
# (we don't know what we just affected, if anything)

# Build & install the project
make
make install
# (we don't know what we just installed, if anything)

# Test the installed binary, exiting on failure
binary | tee binary-output.log || exit 1
# (any errors executing 'binary' such as it not existing
#   are swallowed by 'tee', because 'tee' itself didn't
#   fail, it successfully wrote the errors to file)

# (we have zero idea if the above succeeded or not)
echo "SUCCESS!"
```

What a mess! We have zero confidence the script did what it was supposed to, and worse, it may have had dangerous side effects.

The answer? Shell options ([POSIX.1-2024](https://pubs.opengroup.org/onlinepubs/9799919799/utilities/V3_chap02.html#tag_19_26)). You should set these options at the top of every shell script, directly after the [shebang](https://en.wikipedia.org/wiki/Shebang_(Unix)):

```shell
set -euo pipefail
```

## Explanation

The POSIX standards define many shell options that, when set, last for the length of the script or shell. These options are configured with the [`set` builtin](https://pubs.opengroup.org/onlinepubs/9799919799/utilities/V3_chap02.html#tag_19_26), and you can see the options for your current shell with:

```shell
set -o
```

Because these options are part of the POSIX standards, any shell that is POSIX-compliant should implement them correctly ([Bash](https://www.gnu.org/software/bash/manual/html_node/The-Set-Builtin.html), [Zsh](https://zsh.sourceforge.io/Doc/Release/Options.html?utm_source=chatgpt.com#sh_002fksh-emulation-set), [Dash/Ash](https://manpages.debian.org/unstable/dash/dash.1.en.html)).

_Note: [`set -o pipefail`](https://pubs.opengroup.org/onlinepubs/9799919799/utilities/V3_chap02.html#tag_19_08_01) was only recently added in POSIX.1-2024. Shells based on the 1003.2/1003.2a specifications from 1992 won't have it._

Here is an explanation of all the recommended `set -euo pipefail` options.

### `set -e` / `set -o errexit`

This will cause a script to fail as soon as any chain of commands fails. For example:

```bash
#!/usr/bin/env bash
set -e

# 'false' returns an exit code of 1
false

# 'false' returns an exit code of 1, so 'echo' is never invoked
false && echo "will never print"

# 'echo' returns an exit code of 0, but 'grep' returns an exit code of 1 because it won't find "world"
echo "hello" | grep -q "world"
```

You will still have some commands you'll want to ignore errors such that the script doesn't exit, you can do that with `|| true`:

```bash
#!/usr/bin/env bash
set -e

# '|| true' causes the statement to return an exit of 0 always
rm -rf "TMP_DIR" || true

# if/then can catch failures
if ! rm -rf "TMP_DIR"; then
	echo "TMP_DIR doesn't exist"
fi
```

Using `set -e` lets you be sure that no matter where you are in your script's execution, you can be sure that all previous commands succeeded or had failures explicitly ignored.

### `set -u` / `set -o nounset`

This will cause a script to fail as soon as it comes across an unset variable. For example:

```bash
#!/usr/bin/env bash
set -u

unset NONEXISTENT_VAR

# Without 'set -u', this will evaluate to the very dangerous 'rm -rf /'
rm -rf "${NONEXISTENT_VAR}/"

# Without 'set -u', this will do nothing, keeping the current working directory
cd "${NONEXISTENT_VAR}"

# Safely determine if the variable is unset or null
if [ -z "${NONEXISTENT_VAR+unset}" ]; then
	echo "NONEXISTENT_VAR is unset"
elif [ -z "${NONEXISTENT_VAR}" ]; then
	echo "NONEXISTENT_VAR is null (set, but empty)"
fi

if [ -z "${NONEXISTENT_VAR:-}" ]; then
	echo "NONEXISTENT_VAR is unset or null (set, but empty)"
fi
```

You can use the `${parameter:−word}` [shell parameter expansion](https://www.gnu.org/software/bash/manual/html_node/Shell-Parameter-Expansion.html) if it's safe to provide a [default value](/blog/bash-environment-variable-defaults).

Using `set -u` lets you be sure that the arguments you're providing to commands are exactly what you intended.

### `set -o pipefail`

This will cause a script to fail if any command in a pipeline (those chained with `|` pipes) fails. If multiple commands fail, the last/rightmost failing command's exit code will be used. `set -o pipefail` does _not_ cause early termination of the pipeline, the full pipeline will still run.

For example:

```bash
#!/usr/bin/env bash
set -o pipefail

# Without 'set -o pipefail', "but this won't" would be printed;
# but even with 'set -o pipefail', "this will print" is still
# printed because 'set -o pipefail' doesn't cause early termination
false | echo "this will print" && echo "but this won't"

# Without 'set -o pipefail', 'gzip' would compress the empty
# output of 'cat', causing a compressed file to be created
cat nonexistent_file | gzip > compressed_file.gz
```

Using `set -o pipefail`, similar to `set -e`, lets you be sure that execution won't continue after an unhandled command failure.

## Where you _should_ be safe

**At the beginning of every shell script.** By default, put this at the top of every shell script you write, right below the shebang. The amount of safety gained is grossly more important than the more verbose code you'll have to write.

**In your CI shells.** GitHub Actions sets [`set -eo pipefail` automatically](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#exit-codes-and-error-action-preference) because these options are so important for safey, but crucially, it is missing `set -u`. You can set it like this:

```yaml
name: Dummy Workflow
on:
	push:
jobs:
	dummy:
		runs-on: ubuntu-latest
		defaults:
			run:
				shell: bash -euo pipefail {0}
```

## Where you _can_ be safe

## Option inheritance

?

---

1. At the top of every bash file
2. As the Docker shell
3. In GitHub Actions steps?
4. In subshells within functions?

	```bash
	func() {
		(
			set -euo pipefail
		)
	}
	```
<!--stackedit_data:
eyJoaXN0b3J5IjpbLTEyMTg0NzMwOTQsLTgxMDQ2ODMzMSwxOD
UwNjUxNjU4LC0xODcyOTcyODk2LDE2MTExMTc2MzcsLTQ0MDEz
MDQ4OSwtMTY1MDczNjUwMyw2NTkzOTk1LC0xODk2NzU0ODk1LC
05MTI2NzIwNjQsMzY1MTg2OTUxLC04MzA3MDAzNjksMTQ0OTc0
NjU5NywxMjM1NzEzNjc1LC0yMDEyMzk5NDM4LC05ODE5NjY2MT
UsLTUxNDU5Njc1NywtMTMwMTAzNzYxOSwtMTc3NzgyOTk5NSwt
NzA2MjM3NDQyXX0=
-->