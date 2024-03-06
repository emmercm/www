---

title: Automatically Pinning Python Package Versions
draft: true
tags:
- ci-cd
- python

---

Pinning packages is important for reproducible builds and saving future you from headaches.

A few times recently I've come across an old `requirements.txt` that didn't specify required package versions, not even version ranges (and it definitely wasn't _me_ who wrote these files...). Or potentially worse, it specifies versions for some packages and not for others, and I find out that incompatible transitive dependencies have broken my program.

**If you want your program too work the same way, every time, without issue, then you need to pin your packages to an exact version.**

That means that instead of writing a `requirements.txt` like this:

```python
pandas
numpy
```

you should write it, at a minimum, like this:

```python
pandas==2.2.1
numpy==1.26.4
```

## Converting a `requirements.txt`

For this method, you're going to need a POSIX shell such as [Bash](https://www.gnu.org/software/bash/) or [Zsh](https://www.zsh.org/). This mostly excludes Windows, so I'll provide an alternative later.

This method works best with a clean environment, so let's create a [virtual environment](https://docs.python.org/3/library/venv.html):

```shell
python -m venv venv
. venv/bin/activate
```

Then, we need to install the packages we want to pin, which will take care of resolving compatible versions and installing transitive dependencies:

```python
# requirements.txt
pandas
numpy
```

```shell
pip install --requirement requirements.txt
```

Here's a quick definition of what I mean by "transitive dependencies." Python packages (e.g. ones hosted on [PyPI](https://pypi.org/)) can specify that they themselves rely on other Python packages to function. For example, [pandas v2.2.1](https://pypi.org/project/pandas/2.2.1/) specifies that it requires `numpy<2,>=1.26.0`. Even if we don't specify that we would like to install [NumPy](https://pypi.org/project/numpy/), it still gets installed because pandas needs it. NumPy would be considered a "transitive dependency" here.

Now, we need to talk about Python's lack of a lock file. Some package managers for other languages such as [npm](https://www.npmjs.com/) for Node.js will pin _transitive_ dependency versions in a separate "lock" file. This means that if one package depends on another, the most recent compatible version of that second package gets remembered. Given a `package-lock.json` has been generated, `npm ci` will install the same _exact_ versions of _every_ dependency _every_ time. There is no equivalent for `pip` and Python. So if my `requirements.txt` file only specifies `pandas==2.2.1`, I don't actually know what version of `numpy` will be installed.

The `pip freeze` command _kind of_ combats this lack of a lock file by outputting the exact version of every installed package in a format that can be written to a `requirements.txt` file. I don't consider this a _real_ solution, because if transitive dependencies are ever added (and they will be), there won't be a pinned version in your `requirements.txt`.

But the `pip freeze --requirement requirements.txt` command will output some additional information to let you know what the transitive dependencies are:

```shell
$ pip freeze --requirement requirements.txt
pandas==2.2.1
numpy==1.26.4
## The following requirements were added by pip freeze:
python-dateutil==2.9.0.post0
pytz==2024.1
six==1.16.0
tzdata==2024.1
```

We can omit that comment and the transitive dependencies that follow it with some [sed(1)](https://linux.die.net/man/1/sed) syntax:

```shell
$ pip freeze --requirement requirements.txt | sed "/^\s*#.*pip freeze/,$ d"
pandas==2.2.1
numpy==1.26.4
```

Those looked like pinned dependency versions to me! Let's overwrite our existing `requirements.txt` with it:

```shell
$ echo "$(pip freeze --requirement requirements.txt | sed "/^\s*#.*pip freeze/,$ d")" > requirements.txt
$ cat requirements.txt
pandas==2.2.1
numpy==1.26.4
```

_Note: the `echo "$(...)" > ...` syntax is a workaround for not being able to write a file while it's still being read by one of the commands._

Now you have the ability to decide what packages to update and when.

## Another example

I recently used this strategy to pin my [MkDocs](https://www.mkdocs.org/) packages in [igir#842](https://github.com/emmercm/igir/pull/842/files). The result was that every time the documentation site for Igir got deployed it would look the exact same as it did before, with no surprise changes from packages that changed. This lets me separately test updates to MkDocs and MkDocs plugins to make sure I'm happy with the results.

That same change also shows that `pip freeze --requirement requirements.txt` won't mangle any comments you have in the file. For example:

```python
# requirements.txt
# 
pandas
numpy
```

```shell
# docker run --interactive --tty --rm --volume "$PWD:/pwd" --workdir "/pwd" python:3 sh -c 'pip install --requirement requirements.txt && pip freeze --exclude setuptools --exclude wheel'
# docker run --interactive --tty --rm --volume "$PWD:/pwd" --workdir "/pwd" python:3 sh -c 'pip install --requirement requirements.txt && pip freeze | grep -iE "^($(grep -E "^\s*[^#]" requirements.txt | paste -s -d "|" -))=="'
# docker run --interactive --tty --rm --volume "$PWD:/pwd" --workdir "/pwd" python:3 sh -c 'pip install --requirement requirements.txt && echo "$(pip3 freeze --requirement requirements.txt | sed "/^\s*#.*pip freeze/,$ d")" > requirements.txt'
```

<!--stackedit_data:
eyJoaXN0b3J5IjpbMTgxNDc5ODY0LDEyMzg4NjUxOTQsLTU2OT
k4MzIyMywtMTk3NTY2ODI3M119
-->