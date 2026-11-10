---

title: Concurrent Shell Command Queues
date: 2026-11-07T05:05:00
updated: 2026-11-07T16:49:00
tags:
- shell

---

How to run shell commands in parallel while limiting their concurrency.

I had a use case recently where I wanted to speed up some Bash processing that I was doing, but still keep concurrency constrained. So I wondered: _is there a straightforward way to create thread pools in Bash?_ The answer is: yes, but it takes some work to be semi-resilient and portable.

You may ask: _why do this in Bash at all? It seems silly to use a language with poor concurrency controls._ You'd be right to ask this question, and my answer is: because [I have a fondness for Bash](/blog/tag/shell), and I wanted the challenge. But you're still probably better off using another language, such as [Python](/blog/tag/python).

Here is code that creates a command queue that accepts shell commands to execute. You do not need to know all the commands that you want executed up-front, you can submit commands to it over time.

```bash
# Start this shell's command queue.
# @param {number} $1 Maximum number of jobs to run at once
queue_start() {
  # Validate that the parallelism is a valid limit for xargs
  if [[ ! ${1:-} =~ ^[1-9][0-9]*$ ]]; then
    echo "queue_start: size must be a positive integer, got '${1:-}'" >&2
    return 1
  fi

  # Close this shell's copy (not the parent's) of an inherited or earlier
  # command queue's file descriptor
  if [[ -n ${_queue_fd:-} ]]; then
    eval "exec ${_queue_fd}>&-"
    unset _queue_fd _queue_pid
  fi

  # Find the first unused fd from 3 to 9 (zsh's redirect max)
  local fd=3
  while { : <&"${fd}"; } 2>/dev/null; do fd=$(( fd + 1 )); done
  if [[ ${fd} -gt 9 ]]; then
    echo "queue_start: no free fd from 3 to 9" >&2
    return 1
  fi

  # Make a FIFO queue file in a private temporary directory
  local dir
  dir=$(mktemp -d "${TMPDIR:-/tmp}/queue.XXXXXX")
  mkfifo "${dir}/queue"

  # Find the shell to execute commands (the current shell)
  local shell
  shell=$(ps -o comm= -p "$$")
  shell=${shell#-}

  # Start xargs in the background, reading NUL-separated commands from the
  # queue file. Job messages are hidden by turning off job control and
  # discarding the block's stderr. xargs gets the real stderr through a copy on
  # the queue files's fd, until the file is opened.
  eval "exec ${fd}>&2"
  local opts=$-
  set +m
  {
    # shellcheck disable=SC2016
    xargs -0 -n 1 -P "$1" "${shell}" -c '
      # Output is captured rather than streamed so that command output stays separate
      out=$(eval -- "$1" </dev/null 2>&1); rc=$?
      [ -z "${out}" ] || printf "%s\n" "${out}"
      # Coerce non-zero exit codes to 1, because a 255 code would stop xargs
      [ "${rc}" -eq 0 ] || { printf "exit %d: %s\n" "${rc}" "$1" >&2; exit 1;
    }' _ <"${dir}/queue" 2>&"${fd}" &
    _queue_pid=$!
    disown || :
  } 2>/dev/null
  if [[ ${opts} == *m* ]]; then set -m; fi

  # Open the queue file for writing, which waits until xargs has opened it for reading
  # With both ends open, the file can be safely deleted
  eval "exec ${fd}>\"\${dir}/queue\""
  _queue_fd=${fd}
  rm -rf "${dir}"

  # Register an exit handler to terminate this PID's children, ensuring zsh behaves like bash
  setopt localoptions posixtraps 2>/dev/null || :
  trap _queue_stop EXIT
  if [[ $- != *i* ]]; then
    trap 'exit 129' HUP
    trap 'exit 130' INT
    trap 'exit 143' TERM
  fi
}

# Queue a command on this shell's command queue.
# @param {string} $1 Command to run
queue_submit() {
  if [[ -z ${_queue_fd:-} ]]; then
    echo "queue_submit: no command queue started in this shell" >&2
    return 1
  fi
  # Write the command to the queue file, blocking if it is full
  # Use a printf process so that if xargs has exited, printf will get killed and not this shell
  if [[ $- == *i* ]]; then
    # Write the command in the foreground, because an interactive shell won't
    # have any TERM/HUP/INT traps that could be delayed by a full queue
    env printf '%s\0' "$1" >&"${_queue_fd}"
  else
    # Write the command in the background, so that a full queue doesn't delay any TERM/HUP/INT traps
    env printf '%s\0' "$1" >&"${_queue_fd}" &
    wait "$!"
  fi || {
    echo "queue_submit: couldn't queue the command; the command queue may have stopped" >&2
    return 1
  }
}

# Close the queue file so xargs finishes the jobs it has, then wait for it to exit
queue_wait() {
  if [[ -z ${_queue_fd:-} ]]; then
    echo "queue_wait: no command queue started in this shell" >&2
    return 1
  fi
  eval "exec ${_queue_fd}>&-"
  while kill -0 "${_queue_pid}" 2>/dev/null; do sleep 0.1; done
  unset _queue_fd _queue_pid
}

# Stop every process below the given PID.
# @param {number=} $1 PID whose descendants to stop, defaulting to this shell's PID
_queue_stop() {
  # Default to this shell's PID, found from a child's parent PID because $$ is
  # the parent's PID in a subshell
  local parent=${1:-$(exec sh -c 'echo "${PPID}"')}
  local pid
  for pid in $(exec pgrep -P "${parent}"); do
    # Pause the process so it can't start any new children
    kill -STOP "${pid}" 2>/dev/null || continue
    # Terminate the process' descendants, then terminate the process
    _queue_stop "${pid}"
    kill -TERM "${pid}" 2>/dev/null || :
    # Resume the process so it can respond to the termination
    kill -CONT "${pid}" 2>/dev/null || :
  done
}

# Stop all background processes on exit, because they ignore Ctrl-C and don't receive TERM
if [[ $- != *i* ]]; then
  trap _queue_stop EXIT
  trap 'exit 129' HUP
  trap 'exit 130' INT
  trap 'exit 143' TERM
fi
```

`queue_start` initializes the queue and starts the executor (with concurrency managed by `xargs -P`), `queue_submit` submits commands to the queue, and `queue_wait` waits for the queue to drain before cleaning up. Calling `queue_wait` is optional, command processing will start as soon as you queue it with `queue_submit`.

You can copy and paste this code into a script, or it's also safe to put in your dotfiles, as it only sets some of the exit traps for interactive shells. It works in Bash and Zsh, and it has as much defensive programming as I know how to add, but I'm confident it has failure modes that are difficult to predict or avoid.

## Example usage

My original use case had to do with making a large number of web requests, so here's an example using [Postman Echo](https://www.postman.com/postman/published-postman-templates/documentation/631643-f695cab7-6878-eb55-7943-ad88e1ccfd65):

```shell
$ queue_start 3
$ for n in 1 2 3 4 5; do
    queue_submit "set -o pipefail; \
      curl -sS --fail-with-body --max-time 10 -X POST -H 'Content-Type: application/json' \
        -d '{\"request\": ${n}}' \
        https://postman-echo.com/post | \
      jq -c .json"
  done
$ queue_wait
{"request":1}
{"request":2}
{"request":3}
{"request":4}
{"request":5}
```

A more deterministic scenario demonstrating that concurrency is respected, only starting command three after command two has completed:

```shell
$ queue_start 2
$ queue_submit 'sleep 1; echo first'
$ queue_submit 'echo second'
$ queue_submit 'echo third'
$ queue_wait
second
third
first
```

Command queues are inherited by subshells:

```shell
$ queue_start 2
$ ( queue_submit 'echo "submitted from a subshell"' )
$ queue_submit 'echo "submitted from the main shell"'
$ queue_wait
submitted from a subshell
submitted from the main shell
```

Different subshells can have their own command queue:

```shell
$ (
    queue_start 2
    for n in 1 2 3 4; do queue_submit "sleep 1; echo first queue, job ${n}"; done
    queue_wait
  ) &
$ first=$!
$ (
    queue_start 1
    for n in 1 2; do queue_submit "sleep 1; echo second queue, job ${n}"; done
    queue_wait
  ) &
$ second=$!
$ wait "${first}"
$ wait "${second}"
second queue, job 1
first queue, job 1
first queue, job 2
second queue, job 2
first queue, job 3
first queue, job 4
```

Queueing each line of a command's output as a command to execute:

```shell
$ queue_start 2
$ while IFS= read -r line; do
    queue_submit "${line}"
  done < <(printf 'echo "from command output, line %d"\n' 1 2 3)
$ queue_wait
from command output, line 1
from command output, line 2
from command output, line 3
```

Queueing each line of a file as a command:

```shell
$ queue_start 2
$ while IFS= read -r line; do
    queue_submit "${line}"
  done < commands.txt
$ queue_wait
```

## Known issues

Here are some reasons why you might just want a different programming language:

- **A shell can only have one queue.**

  The amount of additional code needed to support multiple is complicated and likely isn't needed in most cases. Subshells can still have their own queues.

- **Command output is intentionally not streamed.**

  This prevents interleaving the output of most commands. Output larger than `PIPE_BUF` may still get interleaved.

- `queue_wait` doesn't return a value indicating any job failure.**

  This would require a temporary file or a second file descriptor and some complicated code.

- **`queue_wait` has to wait for running processes started after `queue_start`.**

  Processes started after `queue_start` will inherit the queue write file descriptor (which is what allows subshells to work), and `xargs` won't see the end of the queue until every copy of the write descriptor is closed.

- **`_queue_stop` indiscriminately terminates descendants.**

  Any other backgrounded jobs will be terminated, including ones started before `queue_start`.

## Why not just `xargs -P`?

If you know all commands that you want to execute up-front, then the solution gets _far_ simpler:

```shell
$ printf 'echo "from command output, line %d"\0' 1 2 3 | \
    xargs -0 -n 1 -P 2 bash -c
from command output, line 1
from command output, line 2
from command output, line 3
```

or

```shell
$ tr '\n' '\0' < commands.txt | \
    xargs -0 -n 1 -P 2 bash -c
```

[GNU `parallel`](https://www.gnu.org/software/parallel/) works similarly, though macOS doesn't ship with it:

```shell
$ printf 'echo "from command output, line %d"\n' 1 2 3 | \
    parallel -j 2
from command output, line 1
from command output, line 2
from command output, line 3
```
