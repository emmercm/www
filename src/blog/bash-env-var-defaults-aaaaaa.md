---

title: Bash Environment Variable Defaults
date: 2023-03-30
tags:
- shell

---

Bash scripts can set defaults for environment variables that are optionally supplied on execution.

I was first tipped off to this by [Temporal's](https://temporal.io/) server container [entrypoint](https://github.com/temporalio/docker-builds/blob/7cf2767979265936592641260be57f1b994dfd25/docker/auto-setup.sh). Rather than use CLI flags that the script would have to be parsed, the script reads environment variables, which is a common pattern for passing configuration with Docker.

## Syntax for env vars

Here is a Bash script with two variables, `$GREETING` and `$NAME`, that each have a default value:

```bash
#!/usr/bin/env bash
set -euo pipefail

: "${GREETING:=Hello,}"
: "${NAME:=user}"

echo "${GREETING} ${NAME}"
```

You can probably guess what the expected output will be when we run the script:

```shell
$ ./greeting.sh
Hello, user
```

### Explanation

Let's break down what those two lines are doing.

[`: [arguments]`](https://www.gnu.org/savannah-checkouts/gnu/bash/manual/bash.html#Bourne-Shell-Builtins) is a "do nothing" Bash builtin command that performs argument expansion and always succeeds. Here are some examples:

```shell
$ : echo hello!
# (no output because the `echo` command wasn't run)

$ : VAR=foobar
# (no output because no command was run)

$ echo $VAR
# (empty output because the variable assignment didn't happen)
```

[`${parameter:=word}`](https://www.gnu.org/savannah-checkouts/gnu/bash/manual/bash.html#index-parameter-expansion) is a "shell parameter expansion" that will assign a variable a value if that variable is unset or null. Here are some examples:

```shell
$ echo $VAR
# (empty output because the variable isn't set)

$ echo ${VAR:=default}
default

$ echo $VAR
default

$ VAR=""
# ($VAR is set to "null")

$ echo ${VAR:=override}
override

$ echo $VAR
override
```

Because the `:` builtin processes parameter expansions, it can be used to default variables and output nothing:

```shell
$ echo $FOO
# (empty output because the variable isn't set)

$ : ${FOO:=default}
# (no output)

$ echo $FOO
default
```

## Syntax for local variables

A large number of environment variables can be cumbersome to pass to scripts (assuming they aren't exported):

```shell
MYSQL_USER=foobar MYSQL_PWD=password MYSQL_DATABASE=main ./script.sh
```

so you may not be passing many of them, but even variables in the script that you don't expect to come from the environment can benefit from a default value.
