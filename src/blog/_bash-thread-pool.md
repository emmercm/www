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
# Start this shell's command pool.  
# @param {number} $1 Maximum number of jobs to run at once  
pool_start() {  
  # Validate that the pool size is a valid limit for xargs  
  if [[ ! ${1:-} =~ ^[1-9][0-9]*$ ]]; then  
  echo "pool_start: size must be a positive integer, got '${1:-}'" >&2  
  return 1  
  fi  
  
  # Close this shell's copy (not the parent's) of an inherited or earlier pool's file descriptor  
  if [[ -n ${_pool_fd:-} ]]; then  
  eval "exec ${_pool_fd}>&-"  
  unset _pool_fd _pool_pid  
  fi  
  
  # Find the first unused fd from 3 to 9 (zsh's redirect max)  
  local fd=3  
  while { : <&"${fd}"; } 2>/dev/null; do fd=$(( fd + 1 )); done  
 if [[ ${fd} -gt 9 ]]; then  
  echo "pool_start: no free fd from 3 to 9" >&2  
  return 1  
  fi  
  
  # Make a FIFO queue in a private temporary directory  
  local dir  
  dir=$(mktemp -d "${TMPDIR:-/tmp}/pool.XXXXXX")  
 mkfifo "${dir}/queue"  
  
  # Find the shell to execute commands (the current shell)  
  local shell  
  shell=$(ps -o comm= -p "$$")  
  shell=${shell#-}  
  
  # Start xargs in the background, reading NUL-separated commands from the queue.  
 # Job messages are hidden by turning off job control and discarding the block's stderr. # xargs gets the real stderr through a copy on the queue's fd, until the queue is opened.  eval "exec ${fd}>&2"  
  local opts=$-  
  set +m  
  {  
    # shellcheck disable=SC2016  
  xargs -0 -n 1 -P "$1" "${shell}" -c '  
 # Output is captured rather than streamed so that command output stays separate out=$(eval -- "$1" </dev/null 2>&1); rc=$? [ -z "${out}" ] || printf "%s\n" "${out}" # Coerce non-zero exit codes to 1, because a 255 code would stop xargs [ "${rc}" -eq 0 ] || { printf "exit %d: %s\n" "${rc}" "$1" >&2; exit 1; } ' _ <"${dir}/queue" 2>&"${fd}" &  
    _pool_pid=$!  
    disown || :  
  } 2>/dev/null  
  if [[ ${opts} == *m* ]]; then set -m; fi  
  
  # Open the queue for writing, which waits until xargs has opened it for reading  
 # With both ends open, the file can be safely deleted  eval "exec ${fd}>\"\${dir}/queue\""  
  _pool_fd=${fd}  
  rm -rf "${dir}"  
  
  # Register an exit handler to terminate this PID's children, ensuring zsh behaves like bash  
  setopt localoptions posixtraps 2>/dev/null || :  
 trap _pool_stop EXIT  
  if [[ $- != *i* ]]; then  
  trap 'exit 129' HUP  
    trap 'exit 130' INT  
    trap 'exit 143' TERM  
  fi  
}  
  
# Queue a command on this shell's command pool.  
# @param {string} $1 Command to run  
pool_submit() {  
  if [[ -z ${_pool_fd:-} ]]; then  
  echo "pool_submit: no pool started in this shell" >&2  
  return 1  
  fi  
  # Write the command to the queue, blocking if the queue is full  
 # Use a printf process so that if xargs has exited, printf will get killed and not this shell  if [[ $- == *i* ]]; then  
  # Write the command in the foreground, because an interactive shell won't  
 # have any TERM/HUP/INT traps that could be delayed by a full queue  env printf '%s\0' "$1" >&"${_pool_fd}"  
  else  
  # Write the command in the background, so that a full queue doesn't delay any TERM/HUP/INT traps  
  env printf '%s\0' "$1" >&"${_pool_fd}" &  
    wait "$!"  
  fi || {  
    echo "pool_submit: couldn't queue the command; the pool may have stopped" >&2  
  return 1  
  }  
}  
  
# Close the queue so xargs finishes the jobs it has, then wait for it to exit.  
pool_wait() {  
  if [[ -z ${_pool_fd:-} ]]; then  
  echo "pool_wait: no pool started in this shell" >&2  
  return 1  
  fi  
  eval "exec ${_pool_fd}>&-"  
  while kill -0 "${_pool_pid}" 2>/dev/null; do sleep 0.1; done  
  unset _pool_fd _pool_pid  
}  
  
# Stop every process below the given PID.  
# @param {number=} $1 PID whose descendants to stop, defaulting to this shell's PID  
_pool_stop() {  
  # Default to this shell's PID, found from a child's parent PID because $$ is  
 # the parent's PID in a subshell  local parent=${1:-$(exec sh -c 'echo "${PPID}"')}  
  local pid  
  for pid in $(exec pgrep -P "${parent}"); do  
  # Pause the process so it can't start any new children  
  kill -STOP "${pid}" 2>/dev/null || continue  
  # Terminate the process' descendants, then terminate the process  
  _pool_stop "${pid}"  
  kill -TERM "${pid}" 2>/dev/null || :  
  # Resume the process so it can respond to the termination  
  kill -CONT "${pid}" 2>/dev/null || :  
  done  
}  
  
# Stop all background processes on exit, because they ignore Ctrl-C and don't receive TERM  
if [[ $- != *i* ]]; then  
  trap _pool_stop EXIT  
  trap 'exit 129' HUP  
  trap 'exit 130' INT  
  trap 'exit 143' TERM  
fi
```

It works in Bash and Zsh, and it has as much defensive programming as I know how to add, but I'm confident it has failure modes that are difficult to predict or avoid.

## Example usage

Concurrency is respected, only starting command three after command two has completed:

```shell
$ pool_start 2  
$ pool_submit 'sleep 1; echo first'
$ pool_submit 'echo second'
$ pool_submit 'echo third'
$ pool_wait
second  
third  
first
```

Process pools are inherited by subshells:

```shell
$ pool_start 2  
$ ( pool_submit 'echo "submitted from a subshell"' )  
$ pool_submit 'echo "submitted from the main shell"'  
$ pool_wait
submitted from a subshell  
submitted from the main shell
```

Different subshells can have their own process pool:

```shell
$ (  
	 pool_start 2  
	  for n in 1 2 3 4; do pool_submit "sleep 1; echo first pool, job ${n}"; done  
	  pool_wait  
	) &  
$ first=$!  
$ (  
 pool_start 1  
  for n in 1 2; do pool_submit "sleep 1; echo second pool, job ${n}"; done  
  pool_wait  
) &  
second=$!  
  
wait "${first}"  
wait "${second}"
```

TODO: separate subshells

TODO: pipe a command into it, including files

TODO: starting a thread from a thread?

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
eyJoaXN0b3J5IjpbLTE5MjIyNTYxMDQsLTExMTk3NzM4OTMsLT
E2MzIzNjc0NTQsLTcxMzkwMzMsNTEzMTkwMjk1LDExMzIxNDY4
MTcsLTQ1NDgzNjA0NiwtMTYyNDA0NzYyOSwtNzk5NzMyMzg2LD
E4NzM4NDk4MDksNzAzNjcwOTc1LDY0OTMyMTIzNywtMTE1ODk3
MTkyNF19
-->