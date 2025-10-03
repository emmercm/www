
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
$ cd  "$(brew  --repository homebrew/cask)"
$ git rev-list --all Casks/c/corretto.rb \
    | xargs -n1 -I% git --no-pager grep --fixed-strings "version \"24." % -- Casks/c/corretto.rb
51d5d6c524854fe11dfa82c5b7439e6a502c47cf:Casks/c/corretto.rb:  version "24.0.2.12.1"
a780d8ca78c3072c8c43ae6ed9108041c722fff0:Casks/c/corretto.rb:  version "24.0.1.9.1"
fe80d7e571d831942cf19f923be20db84bcd8738:Casks/c/corretto.rb:  version "24.0.0.36.2"
```

Then, we'll write the contents of the desired file version to our local tap. I'm choosing to use a naming scheme similar to [versioned casks](https://docs.brew.sh/Versions), which requires changing the cask name within the file. We'll only need to do this file write once ever:

```shell
cd  "$(brew  --repository homebrew/cask)"
git show "51d5d6c524854fe11dfa82c5b7439e6a502c47cf:Casks/c/corretto.rb" \
		| sed "s/cask \"corretto\"/cask \"corretto@24.0.2.12.1\"/" \
		> "$(brew --repository homebrew/local)/Casks/corretto@24.0.2.12.1.rb"
```

Then, we'll install the cask:

```shell
brew install --cask homebrew/local/corretto@24.0.2.12.1
```

## Uninstallation

To uninstall cask-provided applications, run:

```shell
brew uninstall corretto@24.0.2.12.1
```

To delete the local tap and all copied casks, run:

```shell
brew untap homebrew/local
```

And to remove your local copy of [homebrew/cask](https://github.com/Homebrew/homebrew-cask) (and stop it from updating on every `brew update`), run:

```shell
brew untap homebrew/cask
```

## As a dotfile function

Combining this together with the easier method to [install old formula versions](/blog/installing-old-homebrew-formula-versions), we can write one clean function that you can put in your dotfiles:

```bash
# Install a specific version of a Homebrew formula
# @param {string} $1 Formula name
# @param {string} $2 Formula version (exact)
vintage() {
    # Figure out the relevant tap
    local brew_tap
    local is_cask=false
    if brew search --cask "/^${1:?}$/" &> /dev/null; then
        brew_tap="homebrew/cask"
        is_cask=true
    else
        brew_tap="homebrew/core"
    fi

    # Ensure the appropriate tap is tapped and up to date
    if brew tap | grep -xq "${brew_tap}"; then
        brew update
    else
        brew tap --force "${brew_tap}"
    fi

    # Ensure homebrew/local is created
    brew tap | grep -xq homebrew/local \
        || brew tap homebrew/local

    if [ "${is_cask}" = false ]; then
        # If the formula is already installed, re-link it
        if brew list -1 | grep -xq "${1:?}@${2:?}"; then
            brew unlink "${1:?}@${2:?}"
            brew link --overwrite "${1:?}@${2:?}"
            return 0
        fi

        # Install the formula and ensure it's linked
        brew install "homebrew/local/${1:?}@${2:?}" \
            || brew link --overwrite "${1:?}@${2:?}"
    else (
        # Sub shell to make `cd` safe
        cd "$(brew --repository "${brew_tap}")"

        # Emulate `brew extract` for casks
        local cask_path=$(git ls-files 'Casks/*' | grep -E "/${1:?}\.rb$")
        local version_match=$(git rev-list --all "${cask_path}" \
            | xargs -n1 -I% git --no-pager grep --fixed-strings "version \"${2:?}\"" % -- "${cask_path}" \
            2> /dev/null | head -1)
        local commit_hash="${version_match%%:*}"
        local local_cask_dir="$(brew --repository homebrew/local)/Casks"
        if [ ! -d "${local_cask_dir}" ]; then
            mkdir -p "${local_cask_dir}"
        fi
        local local_cask_file="${local_cask_dir}/${1:?}@${2:?}.rb"
        git show "${commit_hash}:${cask_path}" \
            | sed "s/cask \"${1:?}\"/cask \"${1:?}@${2:?}\"/" \
            > "${local_cask_file}"

        # Install the formula
        brew install --cask "homebrew/local/${1:?}@${2:?}"
    ) fi
}
```

<!--stackedit_data:
eyJoaXN0b3J5IjpbLTg1MDEwNjg2MCw3NzE5NzAxNzgsNDAyOD
EyODddfQ==
-->