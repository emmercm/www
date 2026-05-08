---

title: Shell Command Throttling
date: 2026-05-08T23:08:00
tags:
- shell

---

You can restrict how often a command executes by remembering its last execution time.

Recently, I've been adding [pre-command hooks](/blog/automatically-execute-code-before-after-unix-commands) in [my dotfiles](https://github.com/emmercm/dotfiles) to auto-update various tools before executing them. Many tools can auto-update themselves, but many still can't.

The hooks have been working great, but I launch some of these tools many times in a day, and I don't want to pay the cost of attempting an update on every launch. So I created a Bash function in my dotfiles that can "throttle" commands:

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

The function remembers the last time your user called it with a specific "key" by storing a timestamp in a state file. Each command that you want to throttle should have its own key, decided by you.

Here are some contrived usage examples:

```bash
# Print "hello world" at most every 60sec
if throttle "ECHO_HELLO_WORLD_SECS" 60; then
  echo "Hello world!"
fi
```

```bash
# Update all Homebrew packages every 12hrs
if throttle "BREW_AUTO_UPDATE_SECS" 43200; then
  brew update
fi
```

```bash
# Self-update npm every 48hrs
if throttle "NPM_AUTO_UPDATE_SECS" 172800; then
  npm install --global npm@latest
fi
```

## Real-world example

[Claude Code](https://code.claude.com/docs/en/setup#auto-updates) only auto-updates "native" installations, which were introduced in v2.0 (2025). Before that, you had to update it manually via npm, Homebrew, or whatever package manager you used to install it. You can still use a package manager to install Claude Code, though they don't recommend it anymore.

Here's an example usage of the `throttle` function that will occasionally auto-update Claude Code before it's started:

```bash
if command -v claude &> /dev/null; then
  claude() {
    # Update Claude Code once every 24hrs
    if throttle "CLAUDE_AUTO_UPDATE_SECS" 86400; then
      if npm list --global @anthropic-ai/claude-code > /dev/null; then
        # Update the npm installation
        npm update --global @anthropic-ai/claude-code
      elif command -v brew &> /dev/null && brew list claude-code &> /dev/null; then
        # Update the Homebrew installation
        brew upgrade claude-code
      else
        # Self-update (requires v2.0+)
        command claude update
      fi
    fi

    command claude "$@"
    return $?
  }
fi
```
