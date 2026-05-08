---

title: Shell Command Throttling
date: 2026-05-08
tags:
- shell

---

You can throttle how often a command executes by remembering its last execution time.

Recently, I've been adding [pre-command hooks](/blog/automatically-execute-code-before-after-unix-commands) in [my dotfiles](https://github.com/emmercm/dotfiles) to update various tools before executing them. Many tools can update themselves, but many still can't.

The hooks have been working great, but I launch some of these tools many times in a day, and I don't want to pay the cost of attempting an update on every launch. So I added a Bash function to my dotfiles that can "throttle" commands:

```bash
# @param {string} $1 Name of the throttle key
# @param {number} $2 Cooldown duration in seconds
throttle() {
    local state_dir="${XDG_STATE_HOME:-${HOME}/.local/state}/throttle"
    local state_file="${state_dir}/$1"
    local now
    now=$(date +%s)
    local last_run=0
    if [[ -f "${state_file}" ]]; then
        last_run=$(cat "${state_file}" 2>/dev/null || echo 0)
    fi
    if (( now - last_run > $2 )); then
        mkdir -p "${state_dir}"
        echo "${now}" > "${state_file}"
        return 0
    fi
    return 1
}
```

[Claude Code](https://code.claude.com/docs/en/setup#auto-updates) only auto-updates "native" installations, which were introduced in v2.0 (2025). Before that, you had to update it manually via npm, Homebrew, or whatever package manager you used to install it. You can still use a package manager to install Claude Code, though they don't recommend it anymore.

Here's an example usage of the `throttle` function that will occasionally auto-update Claude Code before it's started:

```bash
if command -v claude &> /dev/null; then
		claude() {
				if npm list --global @anthropic-ai/claude-code > /dev/null; then
						# Update the npm installation
						npm update --global @anthropic-ai/claude-code
				elif command  -v  brew &> /dev/null && brew  list  claude-code &> /dev/null; then
						# Update the Homebrew installation
						brew upgrade claude-code
				else
						# Self-update (requires v2.0+)
						command claude update
				fi
				
				command claude "$@"
        return $?
		}
fi
```


I've happily used the [K9s](https://k9scli.io/) Kubernetes TUI for years, but it doesn't offer any kind of auto-update functionality. Let's pretend that it is

I abuse [my dotfiles](https://github.com/emmercm/dotfiles). I put a lot of commands in them that I probably shouldn't, making the time to launch a new terminal quite high. But I know that everything I want is initialized and ready to go every time:

- Additional directories are added to my `$PATH`
- Tool scripts are sourced (Homebrew, Bun, pyenv, etc.)
- Language-specific env vars are set (`GOROOT`, `GOPATH`, `JAVA_HOME`, `NVM_DIR`, `VOLTA_HOME`, `PYENV_ROOT`, etc.)

Not all of that needs to happen
<!--stackedit_data:
eyJoaXN0b3J5IjpbMzY2MDAwNDgwLC0xNzYzODQ1OTExLDEzMT
k4NDcwMzIsLTE2MTE0MjY4OTMsMTU3Mzc5OTkxOSwtOTA1ODM4
NjE1LC0xMzA5Mzg2MDk3XX0=
-->