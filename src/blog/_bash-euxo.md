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
eyJoaXN0b3J5IjpbLTE4OTY3NTQ4OTUsLTkxMjY3MjA2NCwzNj
UxODY5NTEsLTgzMDcwMDM2OSwxNDQ5NzQ2NTk3LDEyMzU3MTM2
NzUsLTIwMTIzOTk0MzgsLTk4MTk2NjYxNSwtNTE0NTk2NzU3LC
0xMzAxMDM3NjE5LC0xNzc3ODI5OTk1LC03MDYyMzc0NDJdfQ==

-->