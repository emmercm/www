---

title: Copying Changes Between Git Clones
date: 2025-07-24T01:53:00
tags:
- git
- github

---

How to copy uncommitted changes from one clone to another of the same repository.

I've been experimenting with using [Git sparse checkout](https://git-scm.com/docs/git-sparse-checkout) with a very large monorepo recently. I usually have a number of changed files that aren't ready to commit just yet in my working tree, so I wanted to create a new clone to experiment with until I was happy first. Once I was happy, I wanted to copy all my in-flight changes over. I couldn't find a very complete solution for this, so I created one!

Here's a Bash function that you can copy into your dotfiles:

```bash
# Copy changes from one clone to another
# @param {string} $1 The original/old git root
# @param {string} $2 The new git root
gcopy() {
  git -C "$1" status --porcelain=v1 | while read -r state file; do
    if [[ "${state}" == *D* ]]; then
      # Copy deletions
      echo -e "\033[91mX\033[0m ${file}"
      rm -rf "${2:?}/${file}"
    elif [[ "${state}" == *R* ]]; then
      # Copy renames
      before="${file% -> *}"
      after="${file#* -> }"
      echo -e "\033[95m>\033[0m ${before} -> ${after}"
      git -C "$2" mv --force "${before}" "${after}"
      cp "$1/${after}" "$2/${after}"
    else
      # Copy modifications
      echo -e "\033[92m*\033[0m ${file}"
      mkdir -p "$2/$(dirname "${file}")"
      cp "$1/${file}" "$2/${file}"
    fi
  done
}
```

This Bash function accounts for file deletions and renames, which most [xargs](https://linux.die.net/man/1/xargs)-based solutions don't.

_Note: this won't copy anything in your stash._

Usage of the function looks like this:

```shell
$ mkdir old
$ cd old
$ git init
Initialized empty Git repository in ~/old/.git/

$ touch one two
$ git add .
$ git commit -m "Added two files"
[main (root-commit) 2f25b59] Added two files
 2 files changed, 0 insertions(+), 0 deletions(-)
 create mode 100644 one
 create mode 100644 two

$ cp -r . ../new
$ rm one
$ git mv two three
$ touch four
$ git status --porcelain=v1
 D one
R  two -> three
?? four

$ cd ../new
$ git status
On branch main
nothing to commit, working tree clean
$ gcopy ../old .
X one
> two -> three
* four

$ git status --porcelain=v1
 D one
R  two -> three
?? four
```

This function likely isn't safe for complicated scenarios, but it will handle a lot more situations than other solutions you'll find out there.
