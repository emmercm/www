---

title: Installing Old Homebrew Package Versions

---

https://github.com/orgs/Homebrew/discussions/2941#discussioncomment-2155711

```shell
brew tap --force homebrew/core
brew tap-new local/core
brew extract --version=1.5.5 zstd local/core
brew install local/core/zstd@1.5.5
```

if you need to modify build parameters,

```shell
brew edit emmercm/zstd-1.5.5/zstd@1.5.5
```

TODO: how to uninstall, get rid of tap

Warnings:

- The app may require an older version of Xcode
<!--stackedit_data:
eyJoaXN0b3J5IjpbMTc5NzQzMjkyLC0xNjgwNTA4NDc3LC0yMD
Q2ODc4MDY4LDE4MDI1NTA2Niw5OTY1NzAyNzQsMTY4MTczNzgw
Ml19
-->