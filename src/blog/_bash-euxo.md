---

title: Safer Bash Scripts Through
draft: true

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
eyJoaXN0b3J5IjpbLTEzNzA4MDA5NDUsLTE3Nzc4Mjk5OTUsLT
cwNjIzNzQ0Ml19
-->