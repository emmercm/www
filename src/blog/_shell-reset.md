---

title: Resetting the Working Directory on Shell Function Exit
date: 2025-07-24T00:00:00
tags:
- shell

---

Sometimes you need to change the working directory in a shell function. You should take care to reset it back after.

Here's an example scenario: you're writing a complicated shell script that makes use of functions, or you're adding functions to your dotfiles. Within that function you need to an execute that needs to be within a specific working directory. However, you don't want this to affect the rest of your script or the current shell you have open.

```shell
trap  "cd \"${PWD}\"" $(if [ -n  "${ZSH_VERSION}" ]; then  echo  EXIT; else  echo  RETURN; fi)
```
<!--stackedit_data:
eyJoaXN0b3J5IjpbLTIxNDYwMzY4MywtOTgwMzAwNTMzXX0=
-->