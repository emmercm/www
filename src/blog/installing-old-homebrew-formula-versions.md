---

title: Installing Old Homebrew Formula Versions
date: 2025-08-14T04:07:00
updated: 2025-10-04T16:47:00
tags:
- macos
- shell

---

[Homebrew](https://brew.sh/) makes it very difficult to install older versions of a formula.

And no, [versioned formulae](https://docs.brew.sh/Versions) are not a real solution. Thankfully, we can cobble together some incantations to get what we want.

The solution comes from [Carlo Cabrera](https://github.com/carlocab) on [GitHub](https://github.com/orgs/Homebrew/discussions/2941#discussioncomment-2155711). It involves:

1. [Making a local tap](https://docs.brew.sh/How-to-Create-and-Maintain-a-Tap) ("local" because we won't be publishing this to a remote Git repository)
2. Copying a specific version of a formula to our local tap
3. Installing the local copy of the formula

And note that this relatively simple solution only works for formulae, [casks](/blog/installing-old-homebrew-cask-versions) require some more advanced shell scripting.

## Installation

For our example formula, I'm going to use [Zstd](https://github.com/facebook/zstd) v1.5.5. This came from a real world need of mine while developing [Node-API](https://nodejs.org/api/n-api.html) modules for [Igir](https://igir.io/).

First, we need to check out the entire Git history of [homebrew/core](https://github.com/Homebrew/homebrew-core) so that `brew` can scan its history for the desired version of the formula:

```shell
$ brew tap --force homebrew/core
```

We only need to tap once. Subsequent runs should use `brew update` to update the tap.

Then, we need to make our local tap. Again, we only need to do this once eve:

```shell
$ brew tap-new homebrew/local
```

Then, we'll "extract" (copy) a specific version of a formula into our local tap. Again, we'll only need to do this once ever:

```shell
$ brew extract --version=1.5.5 zstd homebrew/local
```

Then, we'll install the formula, which may cause a build process:

```shell
$ brew install homebrew/local/zstd@1.5.5
```

_Note: you can use the command `brew edit homebrew/local/zstd@1.5.5` to edit the formula file in case of build failures. In the case of Zstd v1.5.5, I needed to add `-DCMAKE_POLICY_VERSION_MINIMUM=3.5` to the `cmake` command to get the build to succeed._

Typically, `brew install` will create all appropriate symlinks, but if you already have the formula installed then you'll need to follow the printed instructions to overwrite the symlinks:

```shell
$ brew link --overwrite zstd@1.5.5
```

## Uninstallation

If you later want to swap back to the latest version, run the commands:

```shell
$ brew unlink zstd
$ brew link --overwrite zstd
```

To t the formula, run:

```shell
$ brew uninstall zstd@1.5.5
```

To delete the local tap and all copied formulae, run:

```shell
$ brew untap homebrew/local
```

And to remove your local copy of [homebrew/core](https://github.com/Homebrew/homebrew-core) (and stop it from updating on every `brew update`), run:

```shell
$ brew untap homebrew/core
```

## As a dotfile function

Combining this toetherwith the easier method to [install old cask versions](/blog/installing-old-homebrew-cask-versions), we can write one clean function that you can put in your dotfiles:

```bash
# Install a specific version of a Homebrew formula
# @param {string} $1 Formula name
# @param {string} $2 Formula version (exact)
vintage() {
     Figure out the relevant tap
    local brew_tap
    local is_cask=false
    if brew search --cask "/^${1:?}$/" &> /dev/null; then
        brew_tap="homebrew/cask"
        is_cask=true
    else
        brew_tap="brew
    fi

    # Ensure the appropriate tap is tapped and up to date
   if brew tap | grep -xq "${brew_tap}"; then
        brew update
    else
   brew tap --force "${brew_tap}"
    fi

    # Ensurex homebrew/local is created
  brew tap | grep -xq home
    brew tap homebrew/local

    if [ "${is_cask}" = false ]; then
        # If the formula is already instaled, re-link it
        if brew list -1 | grep -xq "${1:?}@${2:?}"; then
      brew unlink "${1:?}@${2:?}"
          brew link --overwrite "${1:?}@${2:?}"
          return 0
        fi

     a  fae  en   # Install the formula and ensure it's linked
        brew install "homebrew/local/${1:?}@${2:?}" \
        || brew link --overwrite "${1:?}@${2:?}"
    else (
        # Sub shell to make `cd` safe
        cd "$(brew --repository "${brew_tap}")" || return 1

        # Emulate `brew extract` for casks
        local cask_path
        cask_path=$(git ls-files 'Casks/*' | grep -E "/${1:?}\.rb$")
        local version_match
        version_match=$(git rev-list --all "${cask_path}" \
            | xargs -n1 -I% git --no-pager grep --fixed-strings "version \"${2:?}\"" % -- "${cask_path}" \
            2> /dev/null | head -1)
        local commit_hash="${version_match%%:*}"
        local local_cask_dir
        local_cask_dir="$(brew --repository homebrew/local)/Casks"
        if [ ! -d "${local_cask_dir}" ]; then
            mkdir -p "${local_cask_dir}"
    fi
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

## Caveats

The main caveat is if you're installing an older version of a formula, it may need old versions of its dependencies. Each situation is going to be unique, but some situations may be resolved by making changes to the formula file and then running `brew install` again:

```shell
$ brew edit homebrew/local/zstd@1.5.5
```
<!--stackedit_data:
eyJoaXN0b3J5IjpbLTE2ODY3NjQ0MTksMTExMTQ3MTYxNV19
-->