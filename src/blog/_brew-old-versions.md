---

title: Installing Old Homebrew Package Versions

---

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
brew reinstall zstd
brew link --overwrite zstd
```

if you need to modify build parameters,

```shell
brew edit emmercm/zstd-1.5.5/zstd@1.5.5
```

TODO: how to uninstall, get rid of tap

Warnings:

- The app may require an older version of Xcode
<!--stackedit_data:
eyJoaXN0b3J5IjpbMTkyMzkyNjkwNywxOTAwNDkyODYsLTkyMT
Y0NjE0MiwtMTY4MDUwODQ3NywtMjA0Njg3ODA2OCwxODAyNTUw
NjYsOTk2NTcwMjc0LDE2ODE3Mzc4MDJdfQ==
-->