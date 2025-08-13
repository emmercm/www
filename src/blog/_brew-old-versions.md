---

title: Installing Old Homebrew Package Versions
draft: true
tags:
- macos
- shell

---

Homebrew makes it very difficult to install older versions of a formulae.

And no, [versioned formula](https://docs.brew.sh/Versions) are not a real solution.

https://github.com/orgs/Homebrew/discussions/2941#discussioncomment-2155711

```shell
brew tap --force homebrew/core
brew tap-new homebrew/local
brew extract --version=1.5.5 zstd homebrew/local
brew install homebrew/local/zstd@1.5.5
brew link --overwrite zstd@1.5.5
```

To swap back:

```shell
brew unlink zstd@1.5.5
brew link --overwrite zstd
```

```shell
brew list -1 | grep -E '^mas($|@)' | xargs brew unlink
```

if you need to modify build parameters,

```shell
brew edit homebrew/local/zstd@1.5.5
```

TODO: how to uninstall, get rid of tap

```shell
brew uninstall zstd@1.5.5
```

```shell
brew untap homebrew/local
```

Warnings:

- The app may require an older version of Xcode
<!--stackedit_data:
eyJoaXN0b3J5IjpbLTE1NzYwMDU3NDMsLTIxMjQyMTkzNjMsMT
kwMDQ5Mjg2LC05MjE2NDYxNDIsLTE2ODA1MDg0NzcsLTIwNDY4
NzgwNjgsMTgwMjU1MDY2LDk5NjU3MDI3NCwxNjgxNzM3ODAyXX
0=
-->