---

title: Resetting the Working Directory on Shell Function Exit
date: 2025-07-25T00:19:00
tags:
- shell

---

Sometimes you need to change the working directory in a shell function. You should take care to reset it back after.

Here's an example scenario: you're writing a complicated shell script that makes use of functions, or you're adding functions to your dotfiles to be invoked from your shell. Within that function, you want to execute a command that needs to be within a specific working directory. However, you don't want this to affect the rest of your script or the current shell you have open.

There's an easy, portable solution for this!

_See "[Resetting the Working Directory on Shell Script Exit](/blog/resetting-the-working-directory-on-shell-script-exit)" for when you only need to reset the working directory at the very end of a script._

## The portable solution

You should use a [subshell](https://tldp.org/LDP/abs/html/subshells.html) with POSIX-compliant shells. Subshells are separate, child processes of the shell that invoked the function, and manipulating the environment (including the working directory) in them does not affect the parent process. Subshells are created using parentheticals:

```bash
#!/usr/bin/env bash
set -euo pipefail

function cd_and_exec() {
  (
  (
        echo "I won't affect my parent"
        cd ~
    )
}

echo "I don't want my working directory to change."
cd_and_exec
echo "My working directory hasn't changed!"
```

You might be familiar with the `$()` syntax of [command substitution](https://www.gnu.org/software/bash/manual/html_node/Command-Substitution.html), these are using subshells!

Subshells isolate the entire environment from the parent process, which may or may not be desirable for your use case, including:

- Variables:

  ```shell
  $ (foo="bar") && echo "${foo:-unset}"
  unset
  ```

  including [`export`ed](https://www.gnu.org/software/bash/manual/html_node/Bourne-Shell-Builtins.html#index-export) variables!

  ```shell
  $ ( export PATH=/my/bin/dir:$PATH; my_bin ) && echo $PATH
  ```

- [`trap`](https://man7.org/linux/man-pages/man1/trap.1p.html)ped signals:

  ```shell
  $ ( trap 'echo "subshell exited"' EXIT )
  subshell exited
  ```

- [`umask`](https://linux.die.net/man/2/umask) file mode creation mask:

  ```shell
  $ ( umask 077; touch private_file )
  ```

- File descriptors:

  ```shell
  $ ( exec > output.log; echo "This will be logged" )
  ```

Other common use cases of subshells include:

- Output can be redirected together:

  ```shell
  $ ( echo "lorem"; echo "ipsum" ) > output.log
  ```

  or captured together:

  ```shell
  $ output=$( echo "hello"; echo "world" )
  ```

- Exit codes are returned:

  ```shell
  $ (true && false) || echo "the subshell failed!"
  the subshell failed!
  ```

However, subshells can be undesirable because there's a performance cost to forking a process.

## Shell-specific solutions

Most shells have some way to trap exit signals, but some also have a way to trap _function return_ signals. These solutions aren't recommended, even if you think you will always be using the same shell.

- Bash can trap `RETURN` signals:

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
eyJoaXN0b3J5IjpbMjUzMjQ3NzAxXX0=
-->