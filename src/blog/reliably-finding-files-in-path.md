---

title: Reliably Finding Files in $PATH
date: 2021-08-27T20:10:00
updated: 2023-01-19T19:21:00
tags:
- shell

---

Most built-in commands commonly used to find files in `$PATH` don't always work quite as expected, or are shell-specific.

Jump to the bottom of the article for a function definition that looks for files in `$PATH` and is shell-agnostic, or keep reading for a full explanation of why some built-in commands don't work as desired.

## The use case

I tend to not leave Docker running on my MacBook, it tends to eat battery and slow down every other process including web browsing. Because of that, I'm also tired of seeing:

```shell
$ docker ps
Cannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running?
```

I wanted to create a function in my dotfiles to override the `docker` command, and that function would ensure Docker Desktop is running before executing the `docker` command. But I had an issue with finding the actual location of the `docker` executable once it was shadowed by the function.

This article catalogs my findings while trying to solve that use case.

## The problem with `which`

The problem with `which` is it's affected by aliases and functions, and will prefer those over searching in `$PATH`.

If an executable has been overridden with an alias, `which` will print the alias:

```shell
$ which grep
/usr/bin/grep

$ alias grep='grep --color=auto'

$ which grep
grep: aliased to grep --color=auto
```

If an executable has been overridden with a function, `which` will print the function:

```shell
$ which sed
/usr/bin/sed

$ sed() { echo "sed?" }

$ which sed
sed () {
	echo "sed?"
}
```

`which` has similar behavior for aliases and functions that don't override an executable:

```shell
$ which foo
foo not found

$ foo() { echo "bar" }

$ which foo
foo () {
	echo "bar"
}
```

## The problem with `type` and `whence`

The problem with `type -P` and `whence -p` is they're shell-specific, and I'd prefer a shell-agnostic command or function.

`type -P` doesn't exist in Zsh:

```shell
$ echo $0
/bin/zsh

$ which cat
/bin/cat

$ type -P cat
type: bad option: -P
```

And `whence -p` doesn't exist in Bash:

```shell
$ echo $0
/bin/bash

$ which cat
/bin/cat

$ whence -p cat
bash: whence: command not found
```

## The built-in solution

If all you want to do is execute a command, bypassing any aliases or functions that might be shadowing it, then `command` is probably what you want.

Here's an example of `command` bypassing an alias:

```shell
$ echo goodbye
goodbye

$ alias echo="echo hello"

$ echo goodbye
hello goodbye

$ command echo goodbye
goodbye
```

And an example of `command` bypassing a function:

```shell
$ echo hello
hello

$ echo() { command echo "before" "$@" "after" }

$ echo hello
before hello after

$ command echo hello
hello
```

## The custom solution

If you need functionality similar to `which` to get the _path_ of an executable, we can write a function to search in `$PATH` explicitly. Here's a shell-agnostic function dubbed `pinpoint` that's easy to add to dotfiles:

```bash
pinpoint() {
    while read -r DIR; do
        if [[ -f "${DIR}/$1" ]]; then
            echo "${DIR}/$1"
            return 0
        fi
    done <<< "$(echo "${PATH}" | tr ':' '\n')"
    return 1
}
```

And here's some example usage of the function:

```shell
$ pinpoint grep
/usr/bin/grep

$ alias grep='grep --color=auto'

$ pinpoint grep
/usr/bin/grep
```

```shell
$ pinpoint sed
/usr/bin/sed

$ sed() { echo "sed?" }

$ pinpoint sed
/usr/bin/sed
```

```shell
$ pinpoint foo || echo "not in path"
not in path

$ foo() { echo "bar" }

$ pinpoint foo || echo "not in path"
not in path
```

Again, this custom function is best used for when you need the _path_ of an executable, either for further manipulation or later use. Here is a concrete example to set `$EDITOR` with a full executable path to rid yourself of vi/vim:

```shell
export EDITOR=$(pinpoint nano)
```

Happy searching!
