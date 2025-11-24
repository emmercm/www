---

title: Safer Bash Scripts Through Shell Options
tags:
- shell

---

Unlike typical programming languages, Bash doesn't terminate when it encounters an exception.

Here's an example (albeit contrived) dangerous scenario:

```bash
# Install the necessary build tools
apt-get update
# (this
apt-get install --yes git build-essential cmake
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
eyJoaXN0b3J5IjpbLTIwOTk3NzgxODgsLTgzMDcwMDM2OSwxND
Q5NzQ2NTk3LDEyMzU3MTM2NzUsLTIwMTIzOTk0MzgsLTk4MTk2
NjYxNSwtNTE0NTk2NzU3LC0xMzAxMDM3NjE5LC0xNzc3ODI5OT
k1LC03MDYyMzc0NDJdfQ==
-->