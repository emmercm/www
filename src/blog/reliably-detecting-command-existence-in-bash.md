---

title: Reliably Detecting Command Existence in Bash
date: 2024-12-07T23:36:00
tags:
- shell

---

You'll find quite a few different methods suggested on the internet, and they all have their own problems.

Before I go into the details, this is the syntax you want:

```bash
if command -v <command_name> &> /dev/null; then
    echo "command exists"
fi
```

or alternatively:

```bash
command -v <command_name> &> /dev/null && echo "command exists"
```

## Explanation

Here's the [man page](https://man7.org/linux/man-pages/man1/command.1p.html) for `command -v command_name`:

<pre>
-v       Write a string to standard output that indicates the
         pathname or command that will be used by the shell, in
         the current shell execution environment (see <i>Section
         2.12</i>, <i>Shell Execution Environment</i>), to invoke
         <i>command_name</i>, but do not invoke <i>command_name</i>.

          *  Utilities, regular built-in utilities,
             <i>command_name</i>s including a &lt;slash&gt; character, and
             any implementation-defined functions that are found
             using the <i>PATH</i> variable (as described in <i>Section
             2.9.1.1</i>, <i>Command Search and Execution</i>), shall be
             written as absolute pathnames.

          *  Shell functions, special built-in utilities,
             regular built-in utilities not associated with a
             <i>PATH</i> search, and shell reserved words shall be
             written as just their names.

          *  An alias shall be written as a command line that
             represents its alias definition.

          *  Otherwise, no output shall be written and the exit
             status shall reflect that the name was not found.
</pre>

The main takeaway here is this method will work for executables in `$PATH`, functions, _and_ aliases. Other methodologies only work for a subset of those commands.

The `command` command is also POSIX-compliant, meaning it should work consistently across different UNIX variants.

## The problem with `which`

One method you'll see suggested in help forums is `which <program>`. This method works for both functions and aliases, but it _doesn't_ define a consistent exit code behavior. `which` will exit with a non-zero status code on _most_ distros, but this isn't a guarantee.

```bash
which foo &> /dev/null && echo "'foo' maybe exists?"
```

## The problem with `if [[ -x file ]]`

One of the more common methods I've seen suggested is:

```bash
if [[ -x "$(command -v <command_name>)" ]]; then
    echo "executable exists"
fi
```

This will test if the output of the `command -v <command_name>` is an executable _file_ or not, which _won't_ work for aliases. If you want to check for the existence of executables, there are better options such as `find <dir> -type f -executable` or the `pinpoint` function from "[Reliably Finding Executables in $PATH](/blog/reliably-finding-files-in-path)".

`if [[ -x file ]]` doesn't work for aliases, which may be used to intentionally shadow executables:

```shell
$ if [[ -x "$(command -v grep)" ]]; then echo "grep exists"; fi
grep exists

$ alias  grep='grep --color=auto'

$ if [[ -x "$(command -v grep)" ]]; then echo "grep exists"; fi
```

but it _does_ work for functions, which may cause confusion:

```shell
$ if [[ -x "$(command -v docker)" ]]; then echo "docker exists"; fi
docker exists

$ docker() { echo "do some prework"; command docker "$@" }

$ if [[ -x "$(command -v docker)" ]]; then echo "docker exists"; fi
docker exists
```

_See "[Automatically Execute Code Before & After Unix Commands](/blog/automatically-execute-code-before-after-unix-commands)" for more tricks on using functions to shadow executables._

## Example usages

To check for the nonexistence of a command you can use `! command -v <command_name>` syntax:

```bash
if ! command -v beep &> /dev/null; then
    alias beep="echo -ne '\007'"
fi
```

For a real world example, I have my [macOS dotfiles](https://github.com/emmercm/dotfiles/blob/99fcc57675bf8831857b71c26d808d2bbdfd6b9d/.10_macos.bash#L26-L41) install any missing tools I use frequently using [Homebrew](https://brew.sh/):

```bash
if command -v brew &> /dev/null; then
    command -v gawk > /dev/null || brew install gawk
    command -v gsed > /dev/null || brew install gnu-sed
    command -v jq   > /dev/null || brew install jq
    command -v tree > /dev/null || brew install tree
    command -v wget > /dev/null || brew install wget
fi
```

I also [alias `pip3` to `pip`](https://github.com/emmercm/dotfiles/blob/master/.20_python.bash#L42-L44) when `pip` doesn't exist because the version suffix on Python commands is wildly inconsistent across distros and package managers:

```bash
if ! command -v pip &> /dev/null && command -v pip3 &> /dev/null; then
    alias pip=pip3
fi
```

You can also mix `command -v <command_name>` conditionals with other Bash conditionals [like this](https://github.com/emmercm/dotfiles/blob/99fcc57675bf8831857b71c26d808d2bbdfd6b9d/.10_macos.bash#L8-L10):

```bash
if ! command -v brew &> /dev/null && [[ -f /opt/homebrew/bin/brew ]]; then
    eval "$(/opt/homebrew/bin/brew shellenv)"
fi
```
