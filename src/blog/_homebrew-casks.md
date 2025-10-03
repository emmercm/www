
---

title: Installing Old Homebrew Cask Versions
date: 2025-08-14T04:07:00
tags:
- macos
- shell

---

[Homebrew](https://brew.sh/) makes it very difficult to install older versions of a cask.

[Homebrew casks](https://github.com/Homebrew/homebrew-cask) are a way to install macOS GUI applications (i.e. in the `/Applications` directory). Unlike Homebrew formulae, casks aren't typically symlinked.

Installing old versions of casks is more complicated than [installing old versions of formulae](/blog/installing-old-homebrew-formula-versions), as there is no `brew extract --cask` command.

## Installation

For our example cask, I'm going to use [Amazon Corretto](https://aws.amazon.com/corretto/) v24. This came from a real world need of mine to install non-LTS JDK versions at work.

First, we need to check out the entire Git history of [homebrew/cask](https://github.com/Homebrew/homebrew-cask) so that `git` can scan its file history for the desired version of the cask:

```shell
brew tap --force homebrew/cask
```

We only need to tap once. Subsequent runs should use `brew update` to update the tap.

Then, we need to make our local tap. We only need to do this once _ever_:

```shell
brew tap-new homebrew/local
```

Then, we'll need to figure out the path of the cask's Ruby file. As of writing, this would be `Casks/<letter>/<cask>.rb`, but a more resilient approach would be:

```shell
$ cd  "$(brew  --repository homebrew/cask)"
$ git  ls-files  'Casks/*'  |  grep  -E  "/corretto\.rb$"
Casks/c/corretto.rb
```

Then, we'll need to figure out the commit hash that updated the cask file to our desired version. Here we'll print all Corretto v24 versions:

```shell
$ git rev-list --all Casks/c/corretto.rb \
    | xargs -n1 -I% git --no-pager grep --fixed-strings "version \"24." % -- Casks/c/corretto.rb
51d5d6c524854fe11dfa82c5b7439e6a502c47cf:Casks/c/corretto.rb:  version "24.0.2.12.1"
a780d8ca78c3072c8c43ae6ed9108041c722fff0:Casks/c/corretto.rb:  version "24.0.1.9.1"
fe80d7e571d831942cf19f923be20db84bcd8738:Casks/c/corretto.rb:  version "24.0.0.36.2"
```

Then, we'll write the contents of the desired file version to our local tap. I'm choosing to use a naming scheme similar to [versioned casks](https://docs.brew.sh/Versions), which requires some finessing. We'll only need to do this file write once ever:

```shell
cd  "$(brew  --repository homebrew/cask)"
brew extract --version=1.5.5 zstd homebrew/local
```

Then, we'll install the formula, which may cause a build process:

```shell
brew install homebrew/local/zstd@1.5.5
```

_Note: you can use the command `brew edit homebrew/local/zstd@1.5.5` to edit the formula file in case of build failures. In the case of Zstd v1.5.5, I needed to add `-DCMAKE_POLICY_VERSION_MINIMUM=3.5` to the `cmake` command to get the build to succeed._

Typically `brew install` will create all appropriate symlinks, but if you already have the formula installed then you'll need to follow the printed instructions to overwrite the symlinks:

```shell
brew link --overwrite zstd@1.5.5
```

## Uninstallation

If you later want to swap back to the latest version, run the commands:

```shell
brew unlink zstd
brew link --overwrite zstd
```

To delete the formula that you copied to local disk, run:

```shell
brew uninstall zstd@1.5.5
```

To delete the local tap and all copied formulae, run:

```shell
brew untap homebrew/local
```

And to remove your local copy of [homebrew/core](https://github.com/Homebrew/homebrew-core) (and stop it from updating on every `brew update`), run:

```shell
brew untap homebrew/core
```

## As a dotfile function

We can tie everything together into one clean function that you can put in your dotfiles:

```bash
# Install a specific version of a Homebrew formula
# @param {string} $1 Formula name
# @param {string} $2 Formula version
vintage() {
    # Ensure homebrew/core is tapped and up to date
    brew tap | grep --quiet --line-regexp homebrew/core \
        && brew update \
        || brew tap --force homebrew/core

    # Ensure homebrew/local is created
    brew tap | grep --quiet --line-regexp homebrew/local \
        || brew tap homebrew/local

    # Extract the formula
    brew extract --force "--version=${2:?}" "${1:?}" homebrew/local

    # If the formula is already installed, re-link it
    if brew list -1 | grep --quiet --line-regexp "${1:?}@${2:?}"; then
        brew unlink "${1:?}@${2:?}"
        brew link --overwrite "${1:?}@${2:?}"
        return 0
    fi

    # Install the formula and ensure it's linked
    brew install "homebrew/local/${1:?}@${2:?}" \
        || brew link --overwrite "${1:?}@${2:?}"
}
```

## Caveats

The main caveat is if you're installing an older version of a formula, it may need old versions of its dependencies. Each situation is going to be unique, but some situations may be resolved by making changes to the formula file and then running `brew install` again:

```shell
brew edit homebrew/local/zstd@1.5.5
```
<!--stackedit_data:
eyJoaXN0b3J5IjpbMTY0NTQ2MzI1Myw3NzE5NzAxNzgsNDAyOD
EyODddfQ==
-->