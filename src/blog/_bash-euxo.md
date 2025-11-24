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


```

You can use the `${parameter:−word}` [shell parameter expansion](https://www.gnu.org/software/bash/manual/html_node/Shell-Parameter-Expansion.html) if it's safe to provide a [default value](/blog/bash-environment-variable-defaults).

Using `set -u` lets you be sure that the arguments you're providing to commands are exactly what you intended.

## Where you _should_ use it

**At the beginning of every shell script.**

## Where you _can_ use it

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
eyJoaXN0b3J5IjpbMTg1MDY1MTY1OCwtMTg3Mjk3Mjg5NiwxNj
ExMTE3NjM3LC00NDAxMzA0ODksLTE2NTA3MzY1MDMsNjU5Mzk5
NSwtMTg5Njc1NDg5NSwtOTEyNjcyMDY0LDM2NTE4Njk1MSwtOD
MwNzAwMzY5LDE0NDk3NDY1OTcsMTIzNTcxMzY3NSwtMjAxMjM5
OTQzOCwtOTgxOTY2NjE1LC01MTQ1OTY3NTcsLTEzMDEwMzc2MT
ksLTE3Nzc4Mjk5OTUsLTcwNjIzNzQ0Ml19
-->