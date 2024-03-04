---

title: Resetting the Working Directory on Script Exit
draft: true

---

Sometimes you need change the working directory in a shell script, 

```bash
# shellcheck disable=SC2064
trap  "cd \"${PWD}\""  EXIT
cd  "$(dirname "$0")"
```

<!--stackedit_data:
eyJoaXN0b3J5IjpbMjA2NjQ5MjA3N119
-->