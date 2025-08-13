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

```shell
brew list -1 | grep -E '^mas($|@)' | xargs brew unlink
```

if you need to modify build parameters,

```shell
brew edit homebrew/local/zstd@1.5.5
```

TODO: how to uninstall, get rid of tap

Warnings:

- The app may require an older version of Xcode
<!--stackedit_data:
eyJoaXN0b3J5IjpbNDcyMTQxOTY4LC0yMTI0MjE5MzYzLDE5MD
A0OTI4NiwtOTIxNjQ2MTQyLC0xNjgwNTA4NDc3LC0yMDQ2ODc4
MDY4LDE4MDI1NTA2Niw5OTY1NzAyNzQsMTY4MTczNzgwMl19
-->