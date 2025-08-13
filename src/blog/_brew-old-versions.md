---

title: Installing Old Homebrew Package Versions

---

https://github.com/orgs/Homebrew/discussions/2941#discussioncomment-2155711

```shell
brew tap --force homebrew/core
brew tap-new historical
brew extract --version=1.5.5 zstd historical
brew install historical/zstd@1.5.5
```

if you need to modify build parameters,

```shell
brew edit emmercm/zstd-1.5.5/zstd@1.5.5
```

TODO: how to uninstall, get rid of tap

Warnings:

- The app may require an older version of Xcode
<!--stackedit_data:
eyJoaXN0b3J5IjpbLTE0MzM0MjgyOTksLTE2ODA1MDg0NzcsLT
IwNDY4NzgwNjgsMTgwMjU1MDY2LDk5NjU3MDI3NCwxNjgxNzM3
ODAyXX0=
-->