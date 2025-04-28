---

title: Installing Old Homebrew Package Versions

---

https://github.com/orgs/Homebrew/discussions/2941#discussioncomment-2155711

```shell
brew tap --force homebrew/core
brew tap-new emmercm/zstd-1.5.5
brew extract --version=1.5.5 zstd emmercm/zstd-1.5.5
brew install emmercm/zstd-1.5.5/zstd@1.5.5
```

if you need to modify build parameters,

```shell
brew edit emmercm/zstd-1.5.5/zstd@1.5.5
```

TODO: how to uninstall, get rid of tap
<!--stackedit_data:
eyJoaXN0b3J5IjpbMTgwMjU1MDY2LDk5NjU3MDI3NCwxNjgxNz
M3ODAyXX0=
-->