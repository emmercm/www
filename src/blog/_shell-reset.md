---

title: Resetting the Working Directory on Shell Function Exit
date: 2025-07-24T00:00:00
tags:
- shell

---

```shell
trap  "cd \"${PWD}\"" $(if [ -n  "${ZSH_VERSION}" ]; then  echo  EXIT; else  echo  RETURN; fi)
```
<!--stackedit_data:
eyJoaXN0b3J5IjpbLTk4MDMwMDUzM119
-->