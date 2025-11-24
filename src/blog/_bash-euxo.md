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

The answer? [POSIX shell options](https://pubs.opengroup.org/onlinepubs/9799919799/utilities/V3_chap02.html#tag_19_26). You should set these options at the top of every Bash script, directly after the [shebang](https://en.wikipedia.org/wiki/Shebang_(Unix)):

```shell
set -euo pipefail
```

## Explanation

Bash has many shell options that you can set that last for the length of the script or shell. These options are configured with the [`set` builtin](https://www.gnu.org/software/bash/manual/html_node/The-Set-Builtin.html), and you can see your current options with:

```shell
set -o
```

https://pubs.opengroup.org/onlinepubs/9799919799/utilities/V3_chap02.html#tag_19_08_01

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
eyJoaXN0b3J5IjpbNTIzNDUzNTM5LDE2MTExMTc2MzcsLTQ0MD
EzMDQ4OSwtMTY1MDczNjUwMyw2NTkzOTk1LC0xODk2NzU0ODk1
LC05MTI2NzIwNjQsMzY1MTg2OTUxLC04MzA3MDAzNjksMTQ0OT
c0NjU5NywxMjM1NzEzNjc1LC0yMDEyMzk5NDM4LC05ODE5NjY2
MTUsLTUxNDU5Njc1NywtMTMwMTAzNzYxOSwtMTc3NzgyOTk5NS
wtNzA2MjM3NDQyXX0=
-->