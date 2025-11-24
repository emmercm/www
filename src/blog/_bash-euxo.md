---

title: Safer Bash Scripts Through Shell Options
tags:
- shell

---

Unlike typical programming languages, Bash doesn't terminate when it encounters an exception.

Here's an example (albeit contrived) dangerous scenario:

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
binary | tee binary-output || exit 1
# (any errors executing 'binary' such as it not existing
 



# Move all built executables to /usr/local/bin
find . -maxdepth 1 -type f -perm +111 -print0 \
  | xargs -0 -I{} mv "{}" "/usr/local/bin"
# (we're not sure what we might have just moved)

# Delete the project source
cd ..
rm -rf "project"
# (we're not sure what we might have just deleted)
```

```bash
# Go to the project directory
# (if $PROJECT_DIR is unset, this will silently do nothing)
cd "${PROJECT_DIR}"

# Clean up any previous build artifacts
# (we aren't sure what directory this is being executed in)
find . -name "*.o" -print0 | xargs -0 rm -f

# Build the project
make
make install

# (this will be run even if 'make' failed)
rm -rf build
```

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
eyJoaXN0b3J5IjpbMTAxMTYxOTg3OSwtMTY1MDczNjUwMyw2NT
kzOTk1LC0xODk2NzU0ODk1LC05MTI2NzIwNjQsMzY1MTg2OTUx
LC04MzA3MDAzNjksMTQ0OTc0NjU5NywxMjM1NzEzNjc1LC0yMD
EyMzk5NDM4LC05ODE5NjY2MTUsLTUxNDU5Njc1NywtMTMwMTAz
NzYxOSwtMTc3NzgyOTk5NSwtNzA2MjM3NDQyXX0=
-->