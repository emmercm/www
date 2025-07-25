---

title: Resetting the Working Directory on Shell Function Exit
date: 2025-07-24T00:00:00
tags:
- shell

---

Sometimes you need to change the working directory in a shell function. You should take care to reset it back after.

Here's an example scenario: you're writing a complicated shell script that makes use of functions, or you're adding functions to your dotfiles. Within that function you need to an execute that needs to be within a specific working directory. However, you don't want this to affect the rest of your script or the current shell you have open.

## The portable solution

You should use a [subshell](https://tldp.org/LDP/abs/html/subshells.html) with POSIX-compliant shells. Subshells are separate, child processes of the shell that invoked the function, and manipulating the environment (including the working directory) in them does not affect the parent process. Subshells are created using parentheticals:

```bash
#!/usr/bin/env bash
set -euo pipefail

function cd_and_exec() {
		(
			  echo "I won't affect my parent"
			  cd ~
		)
}

echo "I don't want my working directory to change."
cd_and_exec
echo "My working directory hasn't changed!"
```

You might be familiar with the `$()` syntax with [command substitution](https://www.gnu.org/software/bash/manual/html_node/Command-Substitution.html), these are using subshells!

Subshells are great because:

- Output can be redirected together:

	```shell
	( echo "lorem"; echo "ipsum" ) > output.log
	```

	or captured together:

	```shell
	output=$( echo "hello"; echo "world" )
	```

- Exit codes are returned:

	```shell
	$ (true && false) || echo "the subshell failed!"
	the subshell failed!
	```

- File descriptors can be changed:

	```shell
	( exec > output.log; echo "This will be logged" )
	```

However, subshells can be undesirable because:

- There's a performance cost to forking a process
- Variables are local to the subshell:

	```shell
	$ (foo="bar") && echo "${foo:-unset}"
	unset
	```

	including [exported](https://www.gnu.org/software/bash/manual/html_node/Bourne-Shell-Builtins.html#index-export) variables!

```shell
( export PATH=/my/bin/dir:$PATH; my_bin ) && echo $PATH
```

- [`trap`](https://man7.org/linux/man-pages/man1/trap.1p.html) is local to the subshell
- [`umask(2)`](https://linux.die.net/man/2/umask) is local to the subshell

## Shell-specific solutions

Most shells have some way to trap exit signals, but some also have a way to trap function return signals. These solutions aren't recommended, even if you think you will always be using the same shell.

- Bash has `trap [action] RETURN`:

	```bash
	#!/usr/bin/env bash
	function foo() {
	    trap "cd \"${PWD}\"" RETURN
	    echo "I'm safe to change the working directory"
	    cd ~
	}
	```

- Zsh's [`TRAPEXIT`](https://zsh.sourceforge.io/Doc/Release/Functions.html#Trap-Functions) will fire when the surrounding function exits:

	```bash
	#!/usr/bin/env zsh
	function foo() {
	    trap "cd \"${PWD}\"" EXIT
	    echo "I'm safe to change the working directory"
	    cd ~
	}
	```
<!--stackedit_data:
eyJoaXN0b3J5IjpbLTU0NjU1ODIzOV19
-->