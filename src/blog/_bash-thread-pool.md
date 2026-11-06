---

title: Multiprocessing Shell Commands
tags:
- shell

---

How to run shell commands in parallel while limiting their concurrency.

I had a use case recently where I wanted to speed up some Bash processing that I was doing, but still keep concurrency constrained. So I wondered: _is there a straightforward way to create thread pools in Bash?_ The answer is: yes, but it takes some work to be portable.

You may ask: _why do this in Bash at all? It seems silly to use a language with poor concurrency controls._ You'd be right to ask this question, and my answer is: because [I have a fondness for Bash](/blog/tag/shell), and I wanted the challenge. But you're still probably better off using another language, such as Python.

Here is code that creates a process pool that accepts Bash commands to execute. You do not need to know all the commands that you want executed up-front, you can submit commands to it over time.

```bash
```

It works in Bash and Zsh, and it has as much defensive programming as I know how to add, but I'm confident it has failure modes that are difficult to predict or avoid.

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

## Why not `mkfifo` without a file descriptor?

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
eyJoaXN0b3J5IjpbMTIxNTA0NTc4NSwtMTYzMjM2NzQ1NCwtNz
EzOTAzMyw1MTMxOTAyOTUsMTEzMjE0NjgxNywtNDU0ODM2MDQ2
LC0xNjI0MDQ3NjI5LC03OTk3MzIzODYsMTg3Mzg0OTgwOSw3MD
M2NzA5NzUsNjQ5MzIxMjM3LC0xMTU4OTcxOTI0XX0=
-->