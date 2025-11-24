---

title: Safer Bash Scripts Through Shell Options
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

The answer? [Bash shell options](https://www.gnu.org/software/bash/manual/html_node/The-Set-Builtin.html).

## Where you _should_ use it

**At the beginning of every shell script.**

## Where you _can_ use it


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
eyJoaXN0b3J5IjpbMTY0NDYwMTU3LC00NDAxMzA0ODksLTE2NT
A3MzY1MDMsNjU5Mzk5NSwtMTg5Njc1NDg5NSwtOTEyNjcyMDY0
LDM2NTE4Njk1MSwtODMwNzAwMzY5LDE0NDk3NDY1OTcsMTIzNT
cxMzY3NSwtMjAxMjM5OTQzOCwtOTgxOTY2NjE1LC01MTQ1OTY3
NTcsLTEzMDEwMzc2MTksLTE3Nzc4Mjk5OTUsLTcwNjIzNzQ0Ml
19
-->