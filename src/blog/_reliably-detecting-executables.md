---

title: Reliably Detecting Executables in Bash
date: 2024-12-02
tags:
- shell

---

There are quite a few different methods you'll find on the internet that all have their own problems.

Before I go into the details, this is the syntax you want:

```bash
if command -v (command) &> /dev/null; then
	echo "do something"
fi
```

or alternatively:

```bash
command -v (command) &> /dev/nu
```
<!--stackedit_data:
eyJoaXN0b3J5IjpbLTExMjg3NDQzMjddfQ==
-->