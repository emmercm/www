---

title: Installing Old Homebrew Package Versions
draft: true
tags:
- macos
- shell

---

[Homebrew](https://brew.sh/) makes it very difficult to install older versions of a formulae.

And no, [versioned formula](https://docs.brew.sh/Versions) are not a real solution. Thankfully, we can cobble together some incantations to get what we want.

The solution comes from [Carlo Cabrera](https://github.com/carlocab) on [GitHub](https://github.com/orgs/Homebrew/discussions/2941#discussioncomment-2155711). It involves:

1. [Making a local tap](https://docs.brew.sh/How-to-Create-and-Maintain-a-Tap) ("local" because we won't be publishing this to a remote Git repository)
2. Copy a specific version of a formulae to our local tap
3. Install the local formulae

## Steps

First, we need

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
brew untap homebrew/core
```

Warnings:

- The app may require an older version of Xcode
<!--stackedit_data:
eyJoaXN0b3J5IjpbLTEzOTU2NTM2OTEsLTE1NzYwMDU3NDMsLT
IxMjQyMTkzNjMsMTkwMDQ5Mjg2LC05MjE2NDYxNDIsLTE2ODA1
MDg0NzcsLTIwNDY4NzgwNjgsMTgwMjU1MDY2LDk5NjU3MDI3NC
wxNjgxNzM3ODAyXX0=
-->