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
brew unlink zstd@1.5.5
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
eyJoaXN0b3J5IjpbLTIxMjQyMTkzNjMsMTkwMDQ5Mjg2LC05Mj
E2NDYxNDIsLTE2ODA1MDg0NzcsLTIwNDY4NzgwNjgsMTgwMjU1
MDY2LDk5NjU3MDI3NCwxNjgxNzM3ODAyXX0=
-->