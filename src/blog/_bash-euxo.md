---

title: Safer Bash Scripts Through Shell Options
tags:
- shell

---

Unlike typical programming languages, Bash doesn't terminate when it encounters an exception.

Here's an example dangerous scenario:

```bash
# Go to the project directory
# (if $PROJECT_DIR is unset, this will silently do nothing)
cd "${PROJECT_DIR}"

# Build the project
# (we aren't sure what directory this is being executed in)
make
make install

# Clean up build artifacts
# (this will be run even if 'make' failed)

find . -type d -mindepth 1 -maxdepth 1 | while read -r dir; do
	echo $dir
done
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
eyJoaXN0b3J5IjpbLTg2NjE5NzgxMywxMjM1NzEzNjc1LC0yMD
EyMzk5NDM4LC05ODE5NjY2MTUsLTUxNDU5Njc1NywtMTMwMTAz
NzYxOSwtMTc3NzgyOTk5NSwtNzA2MjM3NDQyXX0=
-->