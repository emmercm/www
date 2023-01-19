---

title: Creating Before & After Hooks for Unix Commands
date: 2023-01-19T21:18:00
tags:
- shell

---

It can be helpful to run some code automatically before or after calling a command, and it is easy to accomplish with shadowing functions.

## A use case

I have run into a few situations where I would like some setup or cleanup code to execute before a command executes. A concrete example I talked about in "[Reliably Finding Files in $PATH](/blog/reliably-finding-files-in-path)" is wanting to ensure Docker Desktop is actually running before the `docker` CLI command is executed.

I wanted the order of operations to be:

1. Docker Desktop is not running, to extend my MacBook's battery
2. I execute a `docker` command such as `docker run -it debian:latest bash --`
3. The command is intercepted, Docker Desktop is started, and then the command is actually executed

## Bash function shadowing

The term "shadowing" refers to naming a Bash alias or function the same as an existing executable, taking precedent over the executable.

Here is an example of alias shadowing:

```shell
$ type echo
echo is a shell builtin

$ echo hello!
hello!

$ alias echo='echo intercepted!'

$ type echo
echo is an alias for echo intercepted!

$ echo hello!
intercepted! hello!
```

And here is an example of function shadowing:

```shell
$ type echo
echo is a shell builtin

$ echo hello!
hello!

$ echo() { command echo 'blocked!' }

$ type echo
echo is a shell function

$ echo "hello?"
blocked!
```

## The `$@` special parameter

First we need a quick explanation of the `$@` special parameter. When used, `$@` expands to the positional parameters passed to a script file or function. To prevent undesired word splitting, `$@` should usually be wrapped with double quotes.

Here is an example function that echoes its parameters:

```shell
$ reflect() { echo "$@" }

$ reflect foo
foo

$ reflect foo bar "fizz buzz"
foo bar fizz buzz
```

## The solution

The above example where a function shadowed an executable hinted at our solution. Even though we shadowed the `echo` executable, we were still able to reference the executable with `command`, ignoring any alias or function shadows. Without `command` we would have created a circular reference.

We can add more commands inside our custom `echo` function to extend its functionality:

```shell
$ echo() {
  command echo 'before!'
  command echo "$@"
  command echo 'after!'
}

$ echo foo
before!
foo
after!

$ echo foo bar "fizz buzz"
before!
foo bar fizz buzz
after!
```

## Examples

Using a Bash function, we can "lazy load" the Node.js version manager [`nvm`](https://github.com/nvm-sh/nvm), speeding up our shell startup time:

```shell
nvm() {
  # We only need to load `nvm` once, so we can stop this function
  #   from being run again by "unsetting" it, un-shadowing the
  #   `nvm` executable.
  unset -f "nvm"

  # Load nvm
  . "$NVM_DIR/nvm.sh"

  # Execute the original intended command.
  # We can't use `command` because nvm is a function, not an executable.
  # But we also don't need a workaround because we unset this function above.
  nvm "$@"
}
```

Using a Bash function, we can automatically load environment variables when we `cd` to a directory with an `.env` file:

```shell
cd() {
  # Execute the original intended command.
  # We can't use `command` because `cd` is a built-in, not an executable.
  builtin cd "${1:-${HOME}}"

  # Load the environment variables in a .env file, if it exists.
  if [[ -f .env ]]; then
    source .env
  fi
}
```
