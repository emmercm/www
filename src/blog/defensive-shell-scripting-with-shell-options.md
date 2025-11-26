---

title: Defensive Shell Scripting with Shell Options
date: 2025-11-25T04:46:00
updated: 2025-11-25T19:41:00
tags:
- ci-cd
- docker
- github
- shell

---

Unlike typical programming languages, Bash doesn't terminate when it encounters a variety of exceptions.

Here's an example scenario of re-building an existing project from source:

```bash
# Go to the project directory
# (if $PROJECT_DIR is unset, this will silently do nothing,
#   leaving us in the same directory as before)
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
#   fail, it successfully wrote the errors to a file)

# (we have zero idea if the above succeeded or not)
echo "SUCCESS!"
```

What a mess! We have zero confidence the script did what it was supposed to, and worse, it may have had dangerous side effects.

The answer? Shell options. You should set these options at the top of every shell script, directly after the [shebang](/blog/what-is-a-script-shebang):

```bash
set -euo pipefail
```

It won't protect against _absolutely every_ failure scenario, but it's a sensible default that will likely prevent some issues for you

## Explanation

The POSIX standards ([POSIX.1-2024](https://pubs.opengroup.org/onlinepubs/9799919799/utilities/V3_chap02.html#tag_19_26)) define many shell options that, when set, last for the length of the script or shell. These options are configured with the [`set` builtin](https://pubs.opengroup.org/onlinepubs/9799919799/utilities/V3_chap02.html#tag_19_26), and you can see the options for your current shell with:

```bash
set -o
```

Because these options are part of the POSIX standards, any shell that is POSIX-compliant should implement them correctly ([Bash](https://www.gnu.org/software/bash/manual/html_node/The-Set-Builtin.html), [Zsh](https://zsh.sourceforge.io/Doc/Release/Options.html?utm_source=chatgpt.com#sh_002fksh-emulation-set), [Dash/Ash](https://manpages.debian.org/unstable/dash/dash.1.en.html)).

_Note: [`set -o pipefail`](https://pubs.opengroup.org/onlinepubs/9799919799/utilities/V3_chap02.html#tag_19_08_01) was only recently added in POSIX.1-2024. Shells based on the 1003.2/1003.2a specifications from 1992, or the 1003.1-2001 specification, won't have it._

Here is an explanation of all the options in `set -euo pipefail`.

### `set -e` / `set -o errexit`

This will cause a script to fail as soon as any of these return a non-zero exit code:

- A single simple command
- A pipeline (commands chained with `|` pipes)
- A list of commands (commands chained with `;`, `&`, `&&`, or `||`)
- A compound command (loops, conditionals, and groups)

For example, any of these will cause a script to exit:

```bash
#!/usr/bin/env bash
set -e

# 'false' returns an exit code of 1
false

# 'false' returns an exit code of 1, so 'echo' is never invoked
false && echo "this will NOT print"

# 'echo' returns an exit code of 0, but 'grep' returns an
# exit code of 1 because it won't find "world"
echo "hello" | grep -q "world"
```

Non-zero exit codes in a conditional don't cause an exit, as you would hope (but this can be unexpected with subshells, discussed below):

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
echo "this will print"
```

Using `set -e` increases the confidence that no matter where you are in your script's execution, most of the previous commands _probably_ succeeded, or were ignored.

### `set -u` / `set -o nounset`

This will cause a script to fail as soon as it comes across an unset variable. For example:

```bash
#!/usr/bin/env bash
set -u

unset NONEXISTENT_VAR

# Without 'set -u', this will evaluate to
# the very dangerous 'rm -rf /'
rm -rf "${NONEXISTENT_VAR}/"

# Without 'set -u', this will do nothing,
# keeping the current working directory
cd "${NONEXISTENT_VAR}"
```

You can safely check for unset or null variables like this:

```bash
if [ -z "${VAR+unset}" ]; then
  echo "VAR is unset"
elif [ -z "${VAR}" ]; then
  echo "VAR is null (set, but empty)"
fi

if [ -z "${VAR:-}" ]; then
  echo "VAR is unset or null (set, but empty)"
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
# but even with 'pipefail', "this will print" is still
# printed because 'pipefail' doesn't cause early termination
false | echo "this will print" && echo "but this won't"

# Without 'set -o pipefail', 'gzip' would compress the empty
# output of 'cat', causing a compressed file to be created
cat nonexistent_file | gzip > compressed_file.gz
```

_Cloudflare had [an incident](https://blog.cloudflare.com/pipefail-how-a-missing-shell-option-slowed-cloudflare-down/) in December 2021 that they say would have been prevented with `set -o pipefail`._

Using `set -o pipefail`, similar to `set -e`, lets you be sure that execution _probably_ won't continue after an unhandled command failure.

## Safety by default

Here are places you _should_ use `set -euo pipefail`:

**At the beginning of every shell script.** By default, put this at the top of every shell script you write, right below the shebang. The amount of safety gained is grossly more important than the more verbose code you'll have to write.

**In your CI shells.** GitHub Actions sets [`set -eo pipefail` automatically](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#exit-codes-and-error-action-preference) because these options are so important for safety. But crucially, it is missing `set -u` by default. You can set it like this:

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

[Subshells](https://tldp.org/LDP/abs/html/subshells.html) generally inherit all of the `set -euo pipefail` options, but there are a lot of exceptions.

You can prove inheritance in simple situations like this:

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

However, there is a whole list of scenarios where `set -e` isn't inherited. From the [`set` docs](https://www.gnu.org/software/bash/manual/html_node/The-Set-Builtin.html):

> The shell does not exit if the command that fails is part of the command list immediately following a `while` or `until` reserved word, part of the test in an `if` statement, part of any command executed in a `&&` or `||` list except the command following the final `&&` or `||`, any command in a pipeline but the last (subject to the state of the `pipefail` shell option), or if the command’s return status is being inverted with `!`.

```bash
#!/usr/bin/env bash
set -e

# "command that fails is part of the command list immediately
# following a 'while' or 'until' reserved word"
while $(false); do
  echo "this will NOT print"
done && echo "but this will"

until $(false; true); do
  echo "this will NOT print"
done && echo "but this will"

# "part of the test in an 'if' statement"
if (false; echo "this will print"); then
  echo "and so will this"
fi

# "part of any command executed in a '&&' or '||' list
# except the command following the final '&&' or '||'"
(false; echo "this will print") || true
(false; echo "this will print") && true

# "any command in a pipeline but the last"
false | echo "this will print" && echo "and so will this"

# "or if the command’s return status is being inverted with '!'"
! false && echo "this will print"
```

And by default, the [`inherit_errexit`](https://www.gnu.org/software/bash/manual/html_node/The-Shopt-Builtin.html) option is off, causing command substitutions to [not inherit `set -e`](https://www.gnu.org/software/bash/manual/html_node/Command-Execution-Environment.html):

```bash
#!/usr/bin/env bash
set -e

echo "this will print$(false)" && echo "and so will this"
```

## Counterarguments

Some arguments _against_ relying on `set -euo pipefail` are:

**Against any options at all:**

- Straying from default shell behavior might cause unexpected issues, such as with code that is expecting or relying on default behavior ([1](https://www.mulle-kybernetik.com/modern-bash-scripting/state-euxo-pipefail.html)).

  (_This is a reasonable argument, I agree that straying from language/environment idioms makes code harder to read and modify, increasing risk._)

**Against `set -e`:**

- Exit codes aren't granular enough to know the reason for, or severity of, a non-zero exit code, so it would be inappropriate to always exit ([1](https://mywiki.wooledge.org/BashFAQ/105), [2](https://www.mulle-kybernetik.com/modern-bash-scripting/state-euxo-pipefail.html)).

  (_Except you get a choice to use function return values in your scripts and functions, but you may not get a choice with external programs._)

- Commands may return a non-zero exit code when there isn't an error, for control flow ([1](https://mywiki.wooledge.org/BashFAQ/105)).

  (_The `[ -d /foo ]` example is weak, you would expect that to fail if `/foo` doesn't exist, and it won't cause an exit because it's part of the conditional. It still wouldn't cause an exit if the leading `if` was swapped for a trailing `&&`._)

- Subshells can have differing behavior (described above) ([1](https://mywiki.wooledge.org/BashFAQ/105), [2](https://fvue.nl/wiki/Bash:_Error_handling), [3](https://blog.janestreet.com/when-bash-scripts-bite/)).

  (_This is one of the stronger counterarguments._)

**Against `set -u`:**

- Positional parameters such as `$1` may not be set, but usage of it is still is safe in some situations ([1](https://mywiki.wooledge.org/BashFAQ/112)).

  (_You could use a conditional on `[ $# -gt 0 ]`, or a substitution like `${1:-}`._)

- Different versions of Bash handle empty arrays differently ([1](https://mywiki.wooledge.org/BashFAQ/112), [2](https://gist.github.com/dimo414/2fb052d230654cc0c25e9e41a9651ebe)).

  (_I avoid arrays, including associative arrays, 99% of the time I'm writing Bash. They're one of the least portable features available. For example, macOS Tahoe v26.1 still ships with Bash v3.2.57 from 2014._)

- You should instead use a linting tool such as [ShellCheck](https://www.shellcheck.net/) ([1](https://www.mulle-kybernetik.com/modern-bash-scripting/state-euxo-pipefail.html), [2](https://bbs.archlinux.org/viewtopic.php?pid=1811150#p1811150)).

  (_You should definitely use ShellCheck to catch other dangerous mistakes you can make when shell scripting, but this isn't a valid argument of why `set -u` is dangerous._)

**Against `set -o pipefail`:**

- It was only recently added to the POSIX specification, many shells don't respect it yet.

  (_You definitely need to understand this, though it can be mitigated by using Bash in your shebang._)

- When combined with `set -e`, `SIGPIPE` signals can cause a pipeline to fail unexpectedly ([1](https://news.ycombinator.com/item?id=14322581)).

If we apply some common sense, we should naturally understand that complex situations likely call for a different programming language. `set -euo pipefail` won't completely save you from every pitfall, but it sure provides a better backstop than nothing at all.
