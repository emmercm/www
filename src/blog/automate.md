---

title: Automate Your macOS Defaults
date: 2023-11-14
tags:
- macos
- shell

---

You can use built-in CLI tools to apply your preferred macOS settings.

In 2019, I had my work MacBook die on me. I had built up this helpful collection of dotfiles to improve my local development & testing experience, and they were all gone. After I got my replacement, I immediately created my [dotfiles](https://github.com/emmercm/dotfiles) repository so that I wouldn't use them again.

This year, my employer replaced my 2019 Intel MacBook Pro with an M2 MacBook Pro because I was having thermal problems, and I bought an M2 MacBook Air for personal development. I wanted to put my old MacBook's settings under version control so that I had a consistent experience, now, and in the future. The [`defaults` CLI tool](https://support.apple.com/guide/terminal/edit-property-lists-apda49a1bb2-577e-4721-8f25-ffc0836f6997/mac) and others can help you do just that!

TODO: this is easiest done with a fresh macOS install, because you know what settings you want to change

## Property lists

macOS uses property lists (plists) to store the properties of an application or process. This includes OS-level applications such as Control Center, Finder, and Dock. You can see these files for yourself:

```shell
ls ~/Library/Preferences/
```

The format of these files has [evolved over time](https://en.wikipedia.org/wiki/Property_list), with macOS introducing some formats of its own.

The [`defaults` CLI tool](https://support.apple.com/guide/terminal/edit-property-lists-apda49a1bb2-577e-4721-8f25-ffc0836f6997/mac) can be used to read and write values in these files in a programmatic way.

## `defaults` usage

The `defaults` commands that you will care about are:

- `defaults read [<domain> [<key>]]`, example:

  ```shell
  defaults read com.apple.finder
  defaults read com.apple.finder ShowStatusBar
  ```

- `defaults write <domain> <key> [-string, -int, -float, -bool, ...] <value>`, example:

  ```shell
  defaults write com.apple.finder ShowStatusBar -bool true
  defaults write com.apple.finder FXPreferredViewStyle -string "nlsv"
  ```

## Some example defaults

For some examples, see my current dotfiles [settings script](https://github.com/emmercm/dotfiles/blob/6c5558037ccd6d6467fb870a388f6a9add0eba18/settings.sh). Here are a few:

```shell
# ***** Settings > Control Center *****
# Bluetooth: always show in menu bar
defaults -currentHost write com.apple.controlcenter Bluetooth -int 18
# Sound: always show in menu bar
defaults -currentHost write com.apple.controlcenter Sound -int 18
# Battery - show percentage
defaults -currentHost write com.apple.controlcenter BatteryShowPercentage -bool true

# ***** Settings > Desktop & Dock *****
# Size: smaller
defaults write com.apple.dock tilesize -int 45
# Magnification: off
defaults write com.apple.dock magnification -bool false
# Position on screen: bottom
defaults write com.apple.dock orientation -string bottom
# Automatically hide and show the dock: false
defaults write com.apple.dock autohide -bool false

# ***** Finder *****
# Settings > advanced > show all filename extensions
defaults write .GlobalPreferences AppleShowAllExtensions -bool true
# Settings > advanced > show warning before changing an extension: false
defaults write com.apple.finder FXEnableExtensionChangeWarning -bool false
# View > as list
defaults write com.apple.finder FXPreferredViewStyle -string "nlsv"
# View > show path bar
defaults write com.apple.finder ShowPathbar -bool true
# View > show status bar
defaults write com.apple.finder ShowStatusBar -bool true
# Show all hidden files (cmd+shift+.)
defaults write com.apple.finder AppleShowAllFiles true
```

There are a ton of settings you can control via `defaults`, these websites document some common ones:

- [SS64](https://ss64.com/osx/syntax-defaults.html)
- [macos-defaults.com](https://macos-defaults.com/)
- [defaults-write.com](https://www.defaults-write.com/)

and there are a ton of blog articles titled "(adjective: best, sane, friendly, advanced, secret, etc.) macOS defaults" out there to follow.

But I want to teach you how to fish, something that no high SEO blog article does.

## Finding a setting's domain and key

Let's say that you know what
