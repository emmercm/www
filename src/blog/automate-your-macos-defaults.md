---

title: Automate Your macOS Defaults
date: 2024-02-19T05:09:00
tags:
- macos
- shell

---

You can use built-in CLI tools to apply your preferred macOS settings.

In 2019, I had my work MacBook die on me. I had built up this helpful collection of dotfiles to improve my local development & testing experience, and they were all gone. After I got my replacement, I immediately created my [dotfiles](https://github.com/emmercm/dotfiles) repository so that I wouldn't lose them again.

This year, my employer replaced my 2019 Intel MacBook Pro with an M2 MacBook Pro because I was having thermal problems, and I bought an M2 MacBook Air for personal development. I wanted to put my old MacBook's settings under version control so that I had a consistent experience, now, and in the future. The [`defaults` CLI tool](https://support.apple.com/guide/terminal/edit-property-lists-apda49a1bb2-577e-4721-8f25-ffc0836f6997/mac) and others can help you do just that!

_Note: the strategies in this post are best done with a fresh macOS install, as you are unlikely to remember every setting that was tweaked on an old install._

## Property lists

macOS uses property lists ("p-lists") to store the application properties and user settings. This includes OS-level applications such as Control Center, Finder, and Dock. You can see these files for yourself:

```shell
$ ls ~/Library/Preferences/ | grep '^com.apple.' | head -10
com.apple.AMPLibraryAgent.plist
com.apple.APFSUserAgent.plist
com.apple.Accessibility.Assets.plist
com.apple.Accessibility.plist
com.apple.ActivityMonitor.plist
com.apple.AdLib.plist
com.apple.AdPlatforms.plist
com.apple.AddressBook.plist
com.apple.AppStore.plist
com.apple.AppStoreComponents.plist
```

The format of these files has [evolved over time](https://en.wikipedia.org/wiki/Property_list), with macOS introducing some formats of its own.

The [`defaults` CLI tool](https://support.apple.com/guide/terminal/edit-property-lists-apda49a1bb2-577e-4721-8f25-ffc0836f6997/mac) that comes with macOS can be used to read and write values in these files in a programmatic way.

## `defaults` usage

The `defaults` commands that you will care about are:

- `defaults read [<domain> [<key>]]`, examples:

  ```shell
  defaults read com.apple.finder
  defaults read com.apple.finder ShowStatusBar
  ```

- `defaults write <domain> <key> [-string, -int, -float, -bool, ...] <value>`, examples:

  ```shell
  defaults write com.apple.finder ShowStatusBar -bool true
  defaults write com.apple.finder FXPreferredViewStyle -string "nlsv"
  ```

## Some example defaults

For some examples of OS settings you can change, see my current dotfiles [settings script](https://github.com/emmercm/dotfiles/blob/6c5558037ccd6d6467fb870a388f6a9add0eba18/settings.sh). Here are a few:

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
defaults write com.apple.dock orientation -string "bottom"
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

But I want to teach you how to fish, something that none of the high-SEO blog articles do.

## Finding a setting's domain and key

Let's say that you want to programmatically change macOS to be in dark mode with a specific accent color. By default, macOS starts in light mode with an accent color of "multicolor." My favorite color is orange, I'll use that as an example.

In a new terminal, we can dump all current settings it can read (and change) to a file like this:

```shell
defaults read > before
```

_Note: you may get an OS notification that "Terminal.app" would like to access data from other apps - you should allow it._

After running that command, let's change our two settings. In the same terminal, dump the settings again:

```shell
defaults read > after
```

then, we can generate a "diff" of the two files like this:

```shell
$ diff before after
16a17
>         AppleAccentColor = 1;
18a20
>         AppleHighlightColor = "1.000000 0.874510 0.701961 Orange";
19a22
>         AppleInterfaceStyle = Dark;
92c95
<         "_DKThrottledActivityLast_DKKnowledgeStorageLogging_DKKnowledgeStorageDidInsertEventsNotification:/app/usageActivityDate" = "2024-02-19 04:17:13 +0000";
---
>         "_DKThrottledActivityLast_DKKnowledgeStorageLogging_DKKnowledgeStorageDidInsertEventsNotification:/app/usageActivityDate" = "2024-02-19 04:17:54 +0000";
94c97
<         "_DKThrottledActivityLast_DKKnowledgeStorageLogging_DKKnowledgeStorageDidInsertLocalEventsNotification:/app/usageActivityDate" = "2024-02-19 04:17:13 +0000";
---
>         "_DKThrottledActivityLast_DKKnowledgeStorageLogging_DKKnowledgeStorageDidInsertLocalEventsNotification:/app/usageActivityDate" = "2024-02-19 04:17:54 +0000";
```

Each of the lines in the output indicates a changed setting. Not every change is meaningful, sometimes it's a date change or window position or sizing change. But the changes of `AppleInterfaceStyle = Dark` and `AppleAccentColor = 1` look promising for what we want to change!

But diffs aren't the easiest to read. We don't know from the above what the full path of the `AppleInterfaceStyle` and  `AppleAccentColor` keys are. Starting with one of the keys, let's see if we can find its full path. Using the [`grep` CLI tool](https://linux.die.net/man/1/grep) that also comes with macOS, we can search a file for a string and print a number of lines preceding it:

```shell
$ grep --before-context=25 'AppleInterfaceStyle' after
{
    ".GlobalPreferences_m" =     {
        AppleLanguages =         (
            "en-US"
        );
        AppleLocale = "en_US";
        "Sig_AppleLanguages" = "UserAccountUpdater(953): 2023-10-17 16:23:23 (PDT)";
        "Sig_AppleLocale" = "DirectoryTools(885): 2023-10-17 16:23:12 (PDT)";
    };
    AppStateSyncChatSyncedLids =     {
        lastCheckTime = "2023-12-29 14:17:36 +0000";
    };
    "Apple Global Domain" =     {
        AKLastEmailListRequestDateKey = "2024-02-19 04:00:53 +0000";
        AKLastIDMSEnvironment = 0;
        AKLastLocale = "en_US";
        AppleAccentColor = 1;
        AppleAntiAliasingThreshold = 4;
        AppleAquaColorVariant = 1;
        AppleHighlightColor = "1.000000 0.874510 0.701961 Orange";
        AppleICUForce24HourTime = 1;
        AppleInterfaceStyle = Dark;
```

we know from this output that the `AppleInterfaceStyle` key is within the `"Apple Global Domain"` "domain." This is a special domain that `defaults` can read and write from by instead using the `.GlobalPreferences` domain. Here's an example:

```shell
$ defaults read .GlobalPreferences AppleInterfaceStyle
Dark
```

We can make an educated guess that the value of the light appearance is probably "Light." Let's try it:

```shell
defaults write .GlobalPreferences AppleInterfaceStyle -string "Light"
```

If your computer is like mine, then nothing happened! That's because a lot of OS applications have to be killed and restarted for them to pick up on changes written by `defaults`. In the case of interface settings, you have to restart your computer for the change to take effect.

Let's focus on the accent color next. The numerical value is less helpful than the easy-to-read string value of `AppleInterfaceStyle`. We know from the `grep` above that the `AppleAccentColor` key is also in the `.GlobalPreferences` domain. Let's figure out what the value was before:

```shell
$ grep --before-context=25 'AppleAccentColor' before


```

the output is empty, so the key must not have been set previously. To make sure we have the right key, let's change our accent color to blue and then read the setting again:

```shell
$ defaults read .GlobalPreferences AppleAccentColor
4
```

the number changed, so we likely have the right key. From here it will be up to you to find what number is associated with your favorite accent color. After, we can write the setting like this:

```shell
defaults write .GlobalPreferences AppleAccentColor 1
```

_Note: not every OS setting can be read and written to by `defaults`. Some settings such as power management settings and display settings will require other tools._

## An easier tool

The above steps of running `defaults read`, `diff`, and `grep` to find change settings isn't the easiest or fastest method. Thankfully, Chirag Davé has written a tool called [`plistwatch`](https://github.com/catilac/plistwatch) that can monitor changes to settings in real-time.
