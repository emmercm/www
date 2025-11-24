---

title: Safer Bash Scripts Through Shell Options
tags:
- shell

---

Unlike typical programming languages, Bash doesn't terminate when it encounters an exception.

Here's an example dangerous scenario:

```bash
# (if $PROJECT_DIR is unset, this will silently do nothing)
cd "${PROJECT_DIR}"

# (we aren't sure what directory this is being executed in)
make
make install

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
eyJoaXN0b3J5IjpbMTIzNTcxMzY3NSwtMjAxMjM5OTQzOCwtOT
gxOTY2NjE1LC01MTQ1OTY3NTcsLTEzMDEwMzc2MTksLTE3Nzc4
Mjk5OTUsLTcwNjIzNzQ0Ml19
-->