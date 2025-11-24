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

The script will fail as soon as any chain of commands fails. For example:

```bash
# 'false' returns an exit code of 1
false

# 'false' returns an exit code of 1, so 'echo' is never invoked
false && echo "will never print"

# 'grep' returns an exit code of 1 because it won't find "world",
# so this will cause a script to exit
echo "hello" | grep -q "world"
```

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
eyJoaXN0b3J5IjpbLTEyNTY0OTAxOTksLTE4NzI5NzI4OTYsMT
YxMTExNzYzNywtNDQwMTMwNDg5LC0xNjUwNzM2NTAzLDY1OTM5
OTUsLTE4OTY3NTQ4OTUsLTkxMjY3MjA2NCwzNjUxODY5NTEsLT
gzMDcwMDM2OSwxNDQ5NzQ2NTk3LDEyMzU3MTM2NzUsLTIwMTIz
OTk0MzgsLTk4MTk2NjYxNSwtNTE0NTk2NzU3LC0xMzAxMDM3Nj
E5LC0xNzc3ODI5OTk1LC03MDYyMzc0NDJdfQ==
-->