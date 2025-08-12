---

title: set -euxo pipefail
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
eyJoaXN0b3J5IjpbLTE3Nzc4Mjk5OTUsLTcwNjIzNzQ0Ml19
-->