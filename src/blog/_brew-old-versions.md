---

title: Installing Old Homebrew Package Versions

---

https://github.com/orgs/Homebrew/discussions/2941#discussioncomment-2155711

```shell
brew tap --force homebrew/core
brew tap-new local/historical
brew extract --version=1.5.5 zstd local/historical
brew install local/historical/zstd@1.5.5
```

if you need to modify build parameters,

```shell
brew edit emmercm/zstd-1.5.5/zstd@1.5.5
```

TODO: how to uninstall, get rid of tap

Warnings:

- The app may require an older version of Xcode
<!--stackedit_data:
eyJoaXN0b3J5IjpbMTQxNDg1MTY2NSwtMTY4MDUwODQ3NywtMj
A0Njg3ODA2OCwxODAyNTUwNjYsOTk2NTcwMjc0LDE2ODE3Mzc4
MDJdfQ==
-->