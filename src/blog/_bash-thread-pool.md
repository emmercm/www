---

title: Shell Thread Pools
tags:
- shell

---

Technically, they're _process_ pools, 

```bash
#!/usr/bin/env bash  
set -euo pipefail  
  
fifo_queue="$(mktemp -u -t fifo)"  
mkfifo "${fifo_queue}"  
trap "rm -f \"${fifo_queue}\"" EXIT  
  
pids=()  
for i in $(seq 1 4); do  
  (  
  while IFS= read -r cmd; do  
 [[ -z "${cmd// }" ]] && continue  
 echo -e "\033[7m[${i}] ${cmd}\033[0m"  
  bash -c "$cmd"  
  done < "${fifo_queue}"  
  ) &  
  pids+=("$!")  
done  
  
for n in {1..20}; do  
  echo "echo job $n" > "${fifo_queue}"  
done  
  
wait "${pids[@]}"
```

TODO: could I pipe commands into this?

## Why not use a `mkfifo` pipe?

<!--stackedit_data:
eyJoaXN0b3J5IjpbLTEwODMwMTIxNjEsMTg3Mzg0OTgwOSw3MD
M2NzA5NzUsNjQ5MzIxMjM3LC0xMTU4OTcxOTI0XX0=
-->