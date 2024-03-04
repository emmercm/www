---

title: Resetting the Working Directory on Script Exit
draft: true
tags:
- shell

---

Sometimes you need change the working directory in a shell script, so you should take care to reset it back.

Here's an example scenario: you've written a fairly complex shell script (e.g. in [Bash](https://www.gnu.org/software/bash/)), and it needs to reference files that are in its same directory. You cannot make assumptions about the working directory that your script was invoked from, so you have to sprinkle `dirname "$0"` everywhere. For example:

```bash
#!/usr/bin/env bash
set -euo pipefail

# Source some local file
. "$(dirname "$0")/aliases.sh"

# Load some local config
config=$(cat "$(dirname "$0")/config.json")
```

```bash
# shellcheck disable=SC2064
trap "cd \"${PWD}\"" EXIT
cd "$(dirname "$0")"
```

<!--stackedit_data:
eyJoaXN0b3J5IjpbNDk1MzA0NDkxXX0=
-->