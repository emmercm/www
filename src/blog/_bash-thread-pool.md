---

title: Shell Thread Pools
tags:
- shell

---

Technically, they're _process_ pools, 

I had a use case recently where I wanted to speed up some Bash processing that I was doing, but still keep concurrency constrained. So I wondered: _is there a straightforward way to create thread pools in Bash?_ The answer is: mostly yes.

You may ask: _why do this in Bash at all? It seems silly to use a language with poor concurrency controls._ You'd be right to ask this question, and my answer is: because [I have a fondness for Bash](/blog/tag/shell), and I wanted the challenge. But you're probably better off using another language such as Python.

First the code, and then I'll show some examples:

```bash
```

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

## Traps

## Why not a `mkfifo` pipe?

## Why not only `xargs -P`?

If you know all commands that you want to execute up-front, then a lot of the code can be simplified with a simple:

```bash
TODO: pipe into xargs
```

or

```bash
TODO: read from file
```
<!--stackedit_data:
eyJoaXN0b3J5IjpbLTQ1NDgzNjA0NiwtMTYyNDA0NzYyOSwtNz
k5NzMyMzg2LDE4NzM4NDk4MDksNzAzNjcwOTc1LDY0OTMyMTIz
NywtMTE1ODk3MTkyNF19
-->