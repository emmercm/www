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

# Get the latest
git clean -fdx

# Build the project
make
# (we're not sure what we might have just built)

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
eyJoaXN0b3J5IjpbMTY1NTQ3ODcxMSwtOTEyNjcyMDY0LDM2NT
E4Njk1MSwtODMwNzAwMzY5LDE0NDk3NDY1OTcsMTIzNTcxMzY3
NSwtMjAxMjM5OTQzOCwtOTgxOTY2NjE1LC01MTQ1OTY3NTcsLT
EzMDEwMzc2MTksLTE3Nzc4Mjk5OTUsLTcwNjIzNzQ0Ml19
-->