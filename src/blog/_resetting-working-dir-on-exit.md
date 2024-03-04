---

title: Resetting the Working Directory on Script Exit
draft: true

---

Sometimes you need change the working directory in a shell script, so you should take care to reset it back.

Here's an example scenario: you've written a fairly complex

```bash
# shellcheck disable=SC2064
trap  "cd \"${PWD}\""  EXIT
cd  "$(dirname "$0")"
```

<!--stackedit_data:
eyJoaXN0b3J5IjpbMTMwNDEwOTY4Nl19
-->