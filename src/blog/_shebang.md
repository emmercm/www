---

title: What is a "Shebang"?
tags:
- shell

---

No, it's not a [Ricky Martin](https://en.wikipedia.org/wiki/Ricky_Martin) song.

[Wikpedia](https://en.wikipedia.org/wiki/Shebang_(Unix)) says the shebang also known as a sharp-exclamation, sha-bang, hashbang, pound-bang, or hash-pling. No matter what you call it, it has been around since 80's.

Simply put, a shebang lets a file tell your operating system what executable should interpret your file (an "interpreter directive"), and it's used whenever your file is invoked like an executable.

Shebangs are always the first line of a file, and they look like this:

```bash
#!/usr/bin/env sh
echo "I should be executed by a POSIX-compliant shell!"
```

```bash
#!/usr/bin/env bash
echo "I should be executed by Bash!"
```

```python
#!/usr/bin/env python3
print("I should be executed by Python 3!")
```

```javascript
#!/usr/bin/env node
console.log("I should be executed by Node.js!")
```

and then if that file is named `my_executable` (with no extension, to prove that the OS won't know the right interpreter without reading the file), it can be executed like this:

```bash
# (the file has to be made executable first)
chmod +x my_executable

# It can be invoked with a relative path
./my_executable

# It can be invoked with an absolute path
"$(pwd)/my_executable"
```

## Syntax

Shebangs look like this, and they must be the first line in a file:

```bash
#! <executable> [optional-single-arg]
```

_(Though the space(s)/tab(s) after `#!` are optional, and many people choose to omit them.)_

The `<executable>` should be an absolute (non-relative) path to either an interpreter (`/bin/sh`, `/bin/bash`, `/usr/bin/pwsh`, `/usr/bin/python3`, `/usr/bin/ruby`, etc.), or an executable that can _find_ an interpreter (`/usr/bin/env`).

Shebangs let files assert what interpreter should run them (and IDEs frequently pick up on them for syntax highlighting), but they are just shortcuts to more verbose commands. The executable specified will be invoked with the optional argument, and then the name of the script, and then any CLI arguments after.

Here are some examples that execute the same way:

- `my_script.sh`:

  ```bash
  #!/usr/bin/env bash
  echo "I should be executed by Bash!"
  ```

  ```bash
  # Use the shebang
  ./my_script.sh
  
  # Don't use the shebang
  /usr/bin/env bash ./my_script.sh
  ```

- `my_script.py`:

  ```python
  #!/usr/bin/env python3
  import sys
  print("I should be executed by Python 3, with the args:", sys.argv)
  ```

  ```bash
  # Use the shebang
  ./my_script.py --arg-one --arg-two
  
  # Don't use the shebang
  /usr/bin/env python3 ./my_script.py --arg-one --arg-two
  ```

## Portability

Using `#! /usr/bin/env <interpreter>` for shebangs is typically more "portable" (works more reliably across a wide variety of OSes). This is because `/usr/bin/env` should almost always exist (or your OS knows how to handle it), but your interpreter could live in a non-standard location, especially if it isn't a shell (`python3`, `ruby`, `node`, `perl`, etc.).

For example, on macOS, Python v3.9.6 could be in any one of these locations:

- `/usr/bin/python3` is provided by the OS (and is typically quite old)
- `/Library/Frameworks/Python.framework/Versions/3.9/bin/python3` is where the official installer puts it
- `/opt/homebrew/Cellar/python@3.9/3.9.6/bin/python3` is where [Homebrew](https://brew.sh/) puts it on an Apple Silicon Mac

So it is more reliable to use `/usr/bin/env` to find where `python3` is, plus it respects your `$PATH` ordering:

```python
#!/usr/bin/env python3
import sys
print("I was executed by '" + sys.executable + "'!")
```

_(This is less important for executables such as `/bin/bash` that should always exist in the same location, but it also isn't dangerous to default to using `/usr/bin/env`.)_

## Windows

Both Command Prompt (`cmd.exe`) and PowerShell do not natively interpret shebangs. Further, shebangs will cause problems for Command Prompt, as comments are started with `REM` or `::` and not `#`.

Instead, Windows will use file extensions
<!--stackedit_data:
eyJoaXN0b3J5IjpbMTc0MzcyOTQwOSwyMDMwODUwNDkzLDE2NT
YwMDA4NzEsMTkxMjcwMDQ5NCwtMTE4NzQ4MDAyNiwtMTEwMDI4
MzkyMiwtMTY3MzE0MDU4LDk5MzAwODEwOCw5MTAwOTgzLC0xOD
gwMzI3MjYyLDY2MjIzMjk0OSwtNTI4ODA5NTIxLDcxMDYyMDEx
OCwtMTM3MDk4NDQ3NF19
-->