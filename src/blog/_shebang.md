---

title: What is a "Shebang"?
tags:
- shell

---

No, it's not a [Ricky Martin](https://en.wikipedia.org/wiki/Ricky_Martin) song.

_[Wikpedia](https://en.wikipedia.org/wiki/Shebang_(Unix)) says the shebang also known as a sharp-exclamation, sha-bang, hashbang, pound-bang, or hash-pling._

Simply put, a shebang tells your operating system where to find a program to interpret your file, and it's used whenever your file is used like an executable. Shebangs look like this:

```bash
#!/usr/bin/env sh
echo "I will be executed by a strictly POSIX-compliant shell!"
```

```bash
#!/usr/bin/env bash
echo "I will be executed by Bash!"
```

```bash
#!/usr/bin/env python3
print("I will be executed by Python 3!")
```

and then if that file is named `my_executable` (with no extension, to prove nothing can know the right interpreter without reading the file), it can be executed like this:

```bash
# The file has to be made executable first
chmod +x my_executable

# It can be invoked with a relative path
./my_executable

# It can be invoked with an absolute path
"$(pwd)/my_executable"
```

## Syntax

Shebangs look like this:

```bash
#! <executable> [optional-single-arg]
```

_(Though the space(s)/tab(s) after `#!` are optional, and many people choose to omit it.)_

The `<executable>` should be an absolute (non-relative) path to either an interpreter (`sh`, `bash`, `pwsh`, `python3`, `ruby`, `node`, etc.), or an executable that can _find_ an interpreter (`/usr/bin/env`).

Using `#! /usr/bin/env <interpreter>` is typically more "portable" (works more reliably across a wide variety of OSes). This is because `/usr/bin/env` should always exist, but your interpreter could live in a non-standard location, especially if it isn't a shell (`python3`, `ruby`, `node`, `perl`, etc.).
<!--stackedit_data:
eyJoaXN0b3J5IjpbOTk1NTQ5OTMzLC0xODgwMzI3MjYyLDY2Mj
IzMjk0OSwtNTI4ODA5NTIxLDcxMDYyMDExOCwtMTM3MDk4NDQ3
NF19
-->