---

title: Shell Command Throttling
date: 2026-05-06
tags:
- shell

---

TODO: tagline

Recently, I've been adding [pre-command hooks](/blog/automatically-execute-code-before-after-unix-commands) in [my dotfiles](https://github.com/emmercm/dotfiles) to update various tools before executing them. Some of my commonly-used tools, such as [Claude Code](https://code.claude.com/docs/en/overview), update nearly every day, or sometimes multiple times in a day.

This has been working great, 

I abuse [my dotfiles](https://github.com/emmercm/dotfiles). I put a lot of commands in them that I probably shouldn't, making the time to launch a new terminal quite high. But I know that everything I want is initialized and ready to go every time:

- Additional directories are added to my `$PATH`
- Tool scripts are sourced (Homebrew, Bun, pyenv, etc.)
- Language-specific env vars are set (`GOROOT`, `GOPATH`, `JAVA_HOME`, `NVM_DIR`, `VOLTA_HOME`, `PYENV_ROOT`, etc.)

Not all of that needs to happen
<!--stackedit_data:
eyJoaXN0b3J5IjpbMTU5NjU1OTU5OV19
-->