---

title: Safer Bash Scripts Through Shell Options
tags:
- shell

---

Unlike typical programming languages, Bash doesn't terminate when it encounters an exception.

Here's an example dangerous scenario:

```bash
# If $ROOT_DIR is unset, this will silently do nothing
cd "${ROOT_DIR}"

find . -type d -mindepth 1 -maxdepth 1 | while read -r dir; do
	echo $dir
done
```

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
eyJoaXN0b3J5IjpbLTI3MzQzODUxOCwtNTE0NTk2NzU3LC0xMz
AxMDM3NjE5LC0xNzc3ODI5OTk1LC03MDYyMzc0NDJdfQ==
-->