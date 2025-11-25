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
#!/usr/bin/env zsh
echo "I will be executed by Z shell!"
```

## Syntax

Shebangs look like this:

```bash
#! executable [optional-single-arg]
```

though the space after `#!` is optional, and many people choose to leave it off.
<!--stackedit_data:
eyJoaXN0b3J5IjpbLTUyODgwOTUyMSw3MTA2MjAxMTgsLTEzNz
A5ODQ0NzRdfQ==
-->