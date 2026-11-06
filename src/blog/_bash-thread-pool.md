---

title: Shell Thread Pools
tags:
- shell

---

Technically, they're _process_ pools, 

I had a use case recently where I wanted to speed up some Bash processing that I was doing, but still keep concurrency constrained. So I wondered: _is there a straightforward way to create thread pools in Bash?_ The answer is: mostly yes.

You may ask: _why do this in Bash at all? It seems silly to use a language with poor concurrency controls._ You'd be right to ask this question, and my answer is: because [I have a fondness for Bash](/blog/tag/shell), and I wanted the challenge. But you're probably better off using another language such as Python.

Here is code that creates a TODO pool that accepts Bash commands to execute. You do not need to know all commands to be executed up-front, you can submit commands to it over time.

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

GNU `parallel` works similarly.
<!--stackedit_data:
eyJoaXN0b3J5IjpbMTY4ODA1MjY3NywtNDU0ODM2MDQ2LC0xNj
I0MDQ3NjI5LC03OTk3MzIzODYsMTg3Mzg0OTgwOSw3MDM2NzA5
NzUsNjQ5MzIxMjM3LC0xMTU4OTcxOTI0XX0=
-->