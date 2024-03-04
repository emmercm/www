---

title: Resetting the Working Directory on Script Exit
draft: true

---

```bash
# shellcheck disable=SC2064
trap  "cd \"${PWD}\""  EXIT
cd  "$(dirname "$0")"
```
<!--stackedit_data:
eyJoaXN0b3J5IjpbOTkxMDM5MzQyXX0=
-->