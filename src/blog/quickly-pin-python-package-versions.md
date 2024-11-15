---

title: Quickly Pin Python Package Versions
date: 2024-03-07T02:57:00
updated: 2024-05-22T01:12:00
tags:
- ci-cd
- python

---

Pinning package versions is important for reproducible builds and saving future you from headaches.

A few times recently I've come across old `requirements.txt` files that don't specify required package versions. Not even version ranges (and it definitely wasn't _me_ who wrote these files...). Or potentially worse, some specific versions for some packages and not for others, and I find out that incompatible transitive dependencies have broken my program.

**If you want your program to work the same way, _every_ time, without issue, then you need to pin your packages to an exact version.**

That means that instead of writing a `requirements.txt` like this:

```python
pandas
numpy
```

you should write it like this:

```python
pandas==2.2.1
numpy==1.26.4
```

## Converting a `requirements.txt`

Let's say that you, like me, have a `requirements.txt` file that doesn't specify version numbers, or at least not for every package. I'll show you a quick way to pin all of those packages to an exact version.

For this method, you're going to need a POSIX shell such as [Bash](https://www.gnu.org/software/bash/) or [Zsh](https://www.zsh.org/). This mostly excludes Windows, so I'll provide an alternative later.

This method works best with a clean environment, so let's create and activate a [virtual environment](https://docs.python.org/3/library/venv.html):

```shell
$ python -m venv venv
$ . venv/bin/activate
```

Then, we need to install the packages we want to pin. `pip` will take care of resolving compatible versions and installing transitive dependencies for us:

```python
# requirements.txt
pandas
numpy
```

```shell
$ pip install --requirement requirements.txt
```

Here's a quick definition of what I mean by "transitive dependencies." Python packages (e.g. ones hosted on [PyPI](https://pypi.org/)) can specify that they themselves rely on other Python packages to function. For example, [pandas v2.2.1](https://pypi.org/project/pandas/2.2.1/) specifies that it requires `numpy<2,>=1.26.0`. Even if we don't specify that we would like to install [NumPy](https://pypi.org/project/numpy/), it still gets installed because pandas needs it. NumPy would be considered a "transitive dependency" here.

Now, we need to talk about Python's lack of a lock file. Some package managers for other languages such as [npm](https://www.npmjs.com/) for Node.js will pin _transitive_ dependency versions in a separate "lock" file. This means that if one package depends on another, the most recent compatible version of that second package gets remembered. Given a `package-lock.json` has been generated, [`npm ci`](https://docs.npmjs.com/cli/v8/commands/npm-ci) will install the _exact_ same versions of _every_ dependency _every_ time. There is no equivalent for `pip` and Python. So if my `requirements.txt` file only specifies `pandas==2.2.1`, I don't actually know what version of `numpy` will be installed.

The [`pip freeze`](https://pip.pypa.io/en/stable/cli/pip_freeze/) command _kind of_ combats this lack of a lock file by outputting the exact version of every installed package in a format that can be written to a `requirements.txt` file. I don't consider this a _real_ solution, because if transitive dependencies are ever added (and they will be), then there won't be a pinned version in your `requirements.txt`.

But the `pip freeze --requirement requirements.txt` command will output some additional information to let you know what the transitive dependencies that were installed are:

```text
$ pip freeze --requirement requirements.txt
pandas==2.2.1
numpy==1.26.4
## The following requirements were added by pip freeze:
python-dateutil==2.9.0.post0
pytz==2024.1
six==1.16.0
tzdata==2024.1
```

We can omit that comment and the transitive dependencies that follow it with some [`sed`](https://linux.die.net/man/1/sed) syntax:

```shell
$ pip freeze --requirement requirements.txt | sed "/^\s*#.*pip freeze/,$ d"
pandas==2.2.1
numpy==1.26.4
```

Those look like pinned dependency versions to me! Let's overwrite our existing `requirements.txt` with it:

```shell
$ echo "$(pip freeze --requirement requirements.txt | sed "/^\s*#.*pip freeze/,$ d")" > requirements.txt
$ cat requirements.txt
pandas==2.2.1
numpy==1.26.4
```

_Note: the `echo "$(...)" > ...` syntax is a workaround for not being able to write a file while it's still being read by one of the commands._

Now you can decide what packages to update and when.

## Another example

I recently used this strategy to pin my [MkDocs](https://www.mkdocs.org/) packages in [igir#842](https://github.com/emmercm/igir/pull/842/files). The result was that every time the documentation site for [Igir](https://igir.io/) got deployed it would look the exact same as it did before, with no surprise changes from packages that changed. This lets me test updates to MkDocs and MkDocs plugins to make sure I'm happy with the results.

That same pull request also shows that `pip freeze --requirement requirements.txt` won't mangle any comments you have in your `requirements.txt`. For example:

```python
# Here are some additional instructions, such as needed OS packages:
#   macOS: brew install python@3.12
#   Ubuntu: sudo apt-get update && sudo apt-get install python3.12
pandas
numpy
```

```text
$ echo "$(pip freeze --requirement requirements.txt | sed "/^\s*#.*pip freeze/,$ d")" > requirements.txt
$ cat requirements.txt
# Here are some additional instructions, such as needed OS packages:
#   macOS: brew install python@3.12
#   Ubuntu: sudo apt-get update && sudo apt-get install python3.12
pandas==2.2.1
numpy==1.26.4
```

## Via Docker

I said I would help those Windows users who can't easily run Bash or Zsh.

All of the above can be accomplished with this [Docker](https://www.docker.com/) command, when run via PowerShell (for the `${PWD}` environment variable):

```powershell
docker run --interactive --tty --rm `
  --volume "${PWD}:/pwd" `
  --workdir "/pwd" `
  python:3-alpine sh -c `
  'pip install --requirement requirements.txt && echo "$(pip freeze --requirement requirements.txt | sed "/^\s*#.*pip freeze/,$ d")" > requirements.txt'
```

or like this when run from a typical Windows `cmd.exe` command prompt:

```batch
docker run --interactive --tty --rm ^
  --volume "%cd%:/pwd" ^
  --workdir "/pwd" ^
  python:3-alpine sh -c ^
  'pip install --requirement requirements.txt && echo "$(pip freeze --requirement requirements.txt | sed "/^\s*#.*pip freeze/,$ d")" > requirements.txt'
```

_Note: I'm using [Alpine](https://alpinelinux.org/) to keep the download and storage size small, but feel free to use other image variants._
