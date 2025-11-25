---

title: Safer Shell Scripts Through Shell Options
tags:
- ci-cd
- shell

---

Unlike typical programming languages, Bash doesn't terminate when it encounters an exception.

Here's an example scenario of re-building an existing project from source:

```bash
# Go to the project directory
# (if $PROJECT_DIR is unset, this will silently do nothing)
cd "${PROJECT_DIR}"

# Remove untracked files and pull the latest version
git clean -fdx
git pull
# (we don't know what we just affected, if anything)

# Build & install the project
make
make install
# (we don't know what we just installed, if anything)

# Test the installed binary, exiting on failure
binary | tee binary-output.log || exit 1
# (any errors executing 'binary' such as it not existing
#   are swallowed by 'tee', because 'tee' itself didn't
#   fail, it successfully wrote the errors to file)

# (we have zero idea if the above succeeded or not)
echo "SUCCESS!"
```

What a mess! We have zero confidence the script did what it was supposed to, and worse, it may have had dangerous side effects.

The answer? Shell options ([POSIX.1-2024](https://pubs.opengroup.org/onlinepubs/9799919799/utilities/V3_chap02.html#tag_19_26)). You should set these options at the top of every shell script, directly after the [shebang](https://en.wikipedia.org/wiki/Shebang_(Unix)):

```shell
set -euo pipefail
```

## Explanation

The POSIX standards define many shell options that, when set, last for the length of the script or shell. These options are configured with the [`set` builtin](https://pubs.opengroup.org/onlinepubs/9799919799/utilities/V3_chap02.html#tag_19_26), and you can see the options for your current shell with:

```shell
set -o
```

Because these options are part of the POSIX standards, any shell that is POSIX-compliant should implement them correctly ([Bash](https://www.gnu.org/software/bash/manual/html_node/The-Set-Builtin.html), [Zsh](https://zsh.sourceforge.io/Doc/Release/Options.html?utm_source=chatgpt.com#sh_002fksh-emulation-set), [Dash/Ash](https://manpages.debian.org/unstable/dash/dash.1.en.html)).

_Note: [`set -o pipefail`](https://pubs.opengroup.org/onlinepubs/9799919799/utilities/V3_chap02.html#tag_19_08_01) was only recently added in POSIX.1-2024. Shells based on the 1003.2/1003.2a specifications from 1992 won't have it._

Here is an explanation of all the recommended `set -euo pipefail` options.

### `set -e` / `set -o errexit`

This will cause a script to fail as soon as any of these return a non-zero exit code:

- A single simple command
- A pipeline (commands chained with `|` pipes)
- A list of commands (commands chained with `;`, `&`, `&&`, or `||`)
- A compound command (loops, conditionals, and groups)

For example:

```bash
#!/usr/bin/env bash
set -e

# 'false' returns an exit code of 1
false

# 'false' returns an exit code of 1, so 'echo' is never invoked
false && echo "this will NOT print"

# 'echo' returns an exit code of 0, but 'grep' returns an exit code of 1 because it won't find "world"
echo "hello" | grep -q "world"
```

Non-zero exit codes in a conditional don't cause an exit, as you would hope:

```bash
#!/usr/bin/env bash
set -e

# Non-zero exit codes in a conditional don't cause an exit
if ! rm -rf "TMP_DIR"; then
	echo "this will print"
fi
```

You will still have some commands for which you'll want to ignore errors for, such that the script doesn't exit. You can do that with `|| true`:

```bash
#!/usr/bin/env bash
set -e

# '|| true' causes the statement to return an exit of 0 always
rm -rf "TMP_DIR" || true
```

Using `set -e` lets you be sure that no matter where you are in your script's execution, you can be sure that all previous commands succeeded or had failures explicitly ignored.

### `set -u` / `set -o nounset`

This will cause a script to fail as soon as it comes across an unset variable. For example:

```bash
#!/usr/bin/env bash
set -u

unset NONEXISTENT_VAR

# Without 'set -u', this will evaluate to the very dangerous 'rm -rf /'
rm -rf "${NONEXISTENT_VAR}/"

# Without 'set -u', this will do nothing, keeping the current working directory
cd "${NONEXISTENT_VAR}"
```

You can safely check for unset or null variables like this:

```bash
if [ -z "${NONEXISTENT_VAR+unset}" ]; then
	echo "NONEXISTENT_VAR is unset"
elif [ -z "${NONEXISTENT_VAR}" ]; then
	echo "NONEXISTENT_VAR is null (set, but empty)"
fi

if [ -z "${NONEXISTENT_VAR:-}" ]; then
	echo "NONEXISTENT_VAR is unset or null (set, but empty)"
fi
```

You can also use the `${parameter:−word}` [shell parameter expansion](https://www.gnu.org/software/bash/manual/html_node/Shell-Parameter-Expansion.html) if it's safe to provide a [default value](/blog/bash-environment-variable-defaults) in your situation.

Using `set -u` lets you be sure that the arguments you're providing to commands are exactly what you intended.

### `set -o pipefail`

This will cause a script to fail if _any_ command in a pipeline (those chained with `|` pipes) fails. If multiple commands fail, the last/rightmost failing command's exit code will be used. `set -o pipefail` does _not_ cause early termination of the pipeline, the full pipeline will still run.

For example:

```bash
#!/usr/bin/env bash
set -o pipefail

# Without 'set -o pipefail', "but this won't" would be printed;
# but even with 'set -o pipefail', "this will print" is still
# printed because 'set -o pipefail' doesn't cause early termination
false | echo "this will print" && echo "but this won't"

# Without 'set -o pipefail', 'gzip' would compress the empty
# output of 'cat', causing a compressed file to be created
cat nonexistent_file | gzip > compressed_file.gz
```

_Cloudflare had [an incident](https://blog.cloudflare.com/pipefail-how-a-missing-shell-option-slowed-cloudflare-down/) in December 2021 that would have been prevented with `set -o pipefail`._

Using `set -o pipefail`, similar to `set -e`, lets you be sure that execution won't continue after an unhandled command failure.

## Safety by default

Here are places you _should_ use `set -euo pipefail`:

**At the beginning of every shell script.** By default, put this at the top of every shell script you write, right below the shebang. The amount of safety gained is grossly more important than the more verbose code you'll have to write.

**In your CI shells.** GitHub Actions sets [`set -eo pipefail` automatically](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#exit-codes-and-error-action-preference) because these options are so important for safey, but crucially, it is missing `set -u`. You can set it like this:

```yaml
name: Dummy Workflow
on:
	push:
defaults:
	run:
		shell: bash -euo pipefail {0}
jobs:
	dummy:
		runs-on: ubuntu-latest
		steps:
			- run: echo "set -euo pipefail is active"
			- run: echo "set -euo pipefail is still active"
```

**In your Dockerfiles.** You can change the shell and its parameters in a Dockerfile like this:

```dockerfile
FROM ubuntu:latest
SHELL ["/bin/bash", "-euo", "pipefail", "-c"]
RUN echo "set -euo pipefail is active" && \
    echo "set -euo pipefail is still active"
```

```dockerfile
FROM alpine:latest
SHELL ["/bin/ash", "-euo", "pipefail", "-c"]
RUN echo "set -euo pipefail is active" && \
    echo "set -euo pipefail is still active"
```

## Option inheritance with subshells

[Subshells](https://tldp.org/LDP/abs/html/subshells.html) generally inherit all of the `set -euo pipefail` options. (A notable exclusion is when Bash is not in POSIX mode, it [will clear the `set -e` option in subshells](https://www.gnu.org/software/bash/manual/html_node/Command-Execution-Environment.html).) You can prove this for yourself like this:

```shell
$ set -o | grep -E 'errexit|nounset|pipefail'
errexit        	off
nounset        	off
pipefail       	off

$ set -euo pipefail
$ set -o | grep -E 'errexit|nounset|pipefail'
errexit        	on
nounset        	on
pipefail       	on

$ (set -o | grep -E 'errexit|nounset|pipefail')
errexit        	on
nounset        	on
pipefail       	on
```

```bash
#!/usr/bin/env bash
set -e

# These subshells will inherit 'set -e' and return an exit code as expected:
(false; echo "this will NOT print")
VAR=$(false; echo "this will NOT print")
```

However, `set -e` behaves differently in some scenarios:

> The shell does not exit if the command that fails is part of the command list immediately following a `while` or `until` reserved word, part of the test in an `if` statement, part of any command executed in a `&&` or `||` list except the command following the final `&&` or `||`, any command in a pipeline but the last (subject to the state of the `pipefail` shell option), or if the command’s return status is being inverted with `!`.

```bash
#!/usr/bin/env bash
set -e

# "command that fails is part of the command list immediately following a `while` or `until` reserved word"
while $(false); do echo "this will NOT print"; done && echo "but this will"
until $(false; true); do echo "this will NOT print"; done && echo "but this will"

# "part of the test in an `if` statement"
if (false; echo "this will print"); then true; fi

# "part of any command executed in a `&&` or `||` list except the command following the final `&&` or `||`"
(cat nonexistent_file; echo "this will print") || true
(cat nonexistent_file; echo "this will print") && true

# "any command in a pipeline but the last"
false | echo "this will print" && echo "and so will this"

# "or if the command’s return status is being inverted with `!`"
! false && echo "this will print"
```

And by default, the `inherit_errexit` option is off, causing command substitutions to not inherit `set -e`:

```bash
#!/usr/bin/env bash
set -e


```

## Counter arguments

Some arguments _against_ relying on `set -euo pipefail` are:

- Against any options at all:
  - Straying from default shell behavior might cause unexpected issues, such as with code that is expecting or relying on default behavior ([1](https://www.mulle-kybernetik.com/modern-bash-scripting/state-euxo-pipefail.html))
- Agaisnt `set -e`:
	- Exit codes aren't granular enough to know the reason for or severity of a non-zero exit code, so it would be inappropriate to always exit ([1](https://mywiki.wooledge.org/BashFAQ/105), [2](https://www.mulle-kybernetik.com/modern-bash-scripting/state-euxo-pipefail.html)).

      You get a choice to use function return values in your scripts and functions, but you don't get a choice with external programs.

	- Commands may return a non-zero exit code when there isn't an error, for control flow ([1](https://mywiki.wooledge.org/BashFAQ/105)).
	- Subshells can have differing behavior (described above) ([1](https://mywiki.wooledge.org/BashFAQ/105), [2](https://fvue.nl/wiki/Bash:_Error_handling), [3](https://blog.janestreet.com/when-bash-scripts-bite/)).

      This is one of the stronger counter arguments.

- Against `set -u`:
	- Positional parameters such as `$1` may not be set, and this is safe in some situations ([1](https://mywiki.wooledge.org/BashFAQ/112)).
	- Different versions of Bash handle empty arrays differently ([1](https://mywiki.wooledge.org/BashFAQ/112), [2](https://gist.github.com/dimo414/2fb052d230654cc0c25e9e41a9651ebe)).
	- You should instead use a linting tool such as [ShellCheck](https://www.shellcheck.net/) ([1](https://www.mulle-kybernetik.com/modern-bash-scripting/state-euxo-pipefail.html), [2](https://bbs.archlinux.org/viewtopic.php?pid=1811150#p1811150)).

      You should definitely use ShellCheck to catch other dangerous mistakes you can make when shell scripting, but this isn't a valid argument of why `set -u` is _dangerous_.

- Against `set -o pipefail`
  - When combined with `set -e`, `SIGPIPE` signals can cause a pipeline to fail unexpectedly ([1](https://news.ycombinator.com/item?id=14322581)).

If we apply some common sense, we should naturally understand that complex situations likely call for a different programming language. `set -euo pipefail` won't completely save you from dangerous shell scripting, but it sure provides a better backstop than nothing at all.
<!--stackedit_data:
eyJoaXN0b3J5IjpbLTgwNzAyMzk5MiwtMTY4OTM1MTU0MCwtNj
U5OTIzNDU0LDc0NjcwMTYyMywtMTExODA0NzQ1NiwxODA5MTQ4
ODUyLC04OTAwNjM5NDEsLTc1Nzg4MzIzOSwxNjAwMDIxMTE1LD
IxMDkxNDAwMDEsLTE4MjY5NjE4ODAsODQwMTQ1MDA4LC04ODgz
MTQ5MzIsLTgxMDQ2ODMzMSwxODUwNjUxNjU4LC0xODcyOTcyOD
k2LDE2MTExMTc2MzcsLTQ0MDEzMDQ4OSwtMTY1MDczNjUwMyw2
NTkzOTk1XX0=
-->