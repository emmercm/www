---

title: Safer Bash Scripts Through Shell Options
tags:
- shell

---

Unlike typical programming languages, Bash doesn't terminate when it encounters an exception.

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
eyJoaXN0b3J5IjpbLTE4NjQ1MDAxMDYsLTE3Nzc4Mjk5OTUsLT
cwNjIzNzQ0Ml19
-->