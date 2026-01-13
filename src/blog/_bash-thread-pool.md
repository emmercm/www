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
<!--stackedit_data:
eyJoaXN0b3J5IjpbLTExNTg5NzE5MjRdfQ==
-->