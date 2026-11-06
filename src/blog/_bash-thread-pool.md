---

title: Shell Thread Pools
tags:
- shell

---

Technically, they're _process_ pools, 

I had a use case recently where I wanted to speed up some Bash processing that I was doing, but still keep concurrency constrained. So I wondered: _is there a straightforward-

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

## Why not a `mkfifo` pipe?

## Why not `xargs -P`?
<!--stackedit_data:
eyJoaXN0b3J5IjpbLTEyMzAwOTIxMDUsLTc5OTczMjM4NiwxOD
czODQ5ODA5LDcwMzY3MDk3NSw2NDkzMjEyMzcsLTExNTg5NzE5
MjRdfQ==
-->