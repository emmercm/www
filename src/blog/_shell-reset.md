---

title: Resetting the Working Directory on Shell Function Exit
date: 2025-07-24T00:00:00
tags:
- shell

---

Sometimes you need to change the working directory in a shell function. You should take care to reset it back after.

Here's an example scenario: you're writing a complicated shell script that makes use of functions, or you're adding functions to your dotfiles. Within that function you need to an execute that needs to be within a specific working directory. However, you don't want this to affect the rest of your script or the current shell you have open.

## The portable answer

You should use a [subshell](https://tldp.org/LDP/abs/html/subshells.html) with POSIX-compliant shells. Subshells are separate, child processes of the shell that invoked the function, and manipulating the environment (including the working directory) in them does not affect the parent process. Subshells are created using parentheticals:

```bash
#!/usr/bin/env bash
set -euo pipefail

echo "I don't want my working directory to change."
(
	  cd ~
	  echo "I can do whatever I need to now!"
)
echo "My working directory hasn't changed!"
```

Subshells are great because:

- Exit codes are returned:

	```shell
	$ (true && false) || echo "the subshell failed!"
	the subshell failed!
	```

However, subshells can be undesirable because:

- Variables

```shell
trap  "cd \"${PWD}\"" $(if [ -n  "${ZSH_VERSION}" ]; then  echo  EXIT; else  echo  RETURN; fi)
```
<!--stackedit_data:
eyJoaXN0b3J5IjpbNTM1ODYzNjYwLC05ODAzMDA1MzNdfQ==
-->