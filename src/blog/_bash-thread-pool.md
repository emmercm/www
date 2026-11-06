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

## Examples

TODO: a simple usage

TODO: subshell inheritance

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
eyJoaXN0b3J5IjpbLTI4NzQ2MjQxMiwtMTExOTc3Mzg5MywtMT
YzMjM2NzQ1NCwtNzEzOTAzMyw1MTMxOTAyOTUsMTEzMjE0Njgx
NywtNDU0ODM2MDQ2LC0xNjI0MDQ3NjI5LC03OTk3MzIzODYsMT
g3Mzg0OTgwOSw3MDM2NzA5NzUsNjQ5MzIxMjM3LC0xMTU4OTcx
OTI0XX0=
-->