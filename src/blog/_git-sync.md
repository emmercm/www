---

title: Syncing Changes Between Git Working Trees
draft: true
tags:
- git
- github

---

How to sync uncommitted changes between two different working trees of the same repository.

I've been experimenting with using [Git sparse checkout](https://git-scm.com/docs/git-sparse-checkout) with a very large monorepo recently. I usually have a number of changed files that aren't ready to commit just yet in my working tree, so I wanted to create a new working tree to experiment with until I was happy first. Once I was happy, I wanted to copy all my in-flight changes over. I couldn't find a very complete solution for this, so I created one!

```bash
# Sync changes from one working tree to another
# @param {string} $1 The original/old git root
# @param {string} $2 The new git root
gsync() {
    git -C "$1" status --porcelain=v1 | while read -r state file; do
        if [[ "${state}" == *D* ]]; then
            # Sync deletions
            echo -e "\033[91mX\033[0m ${file}"
            rm -rf "$2/${file}"
        elif [[ "${state}" == *R* ]]; then
            # Sync renames
            before="${file% -> *}"
            after="${file#* -> }"
            echo -e "\033[95m>\033[0m ${before} -> ${after}"
            git -C "$2" mv --force "${before}" "${after}"
            cp "$1/${after}" "$2/${after}"
        else
            # Sync modifications
            echo -e "\033[92m*\033[0m ${file}"
            mkdir -p "$2/$(dirname "${file}")"
            cp "$1/${file}" "$2/${file}"
        fi
    done
}
```

This Bash function accounts for file deletions and renames, which most [xargs(1)](https://linux.die.net/man/1/xargs)-based solutions don't account for.

Function usage looks like this:

```shell
$ mkdir old
$ rm old/one
$ mv old/two old/three
$ touch old/four

$ git clone https://github.com/dummy/repo.git old/
```
<!--stackedit_data:
eyJoaXN0b3J5IjpbMjExNzk2NzI0OSwtMTIwOTAwOTkyN119
-->