---

title: Automatically Pinning Python Dependencies
draft: true
tags:
- ci-cd
- python

---

Pinning dependencies is important for reproducible builds and saving future you from headaches.

A few times recently I've come across an old `requirements.txt` that didn't specify required dependency versions, not even version ranges (and it definitely wasn't _me_ who wrote these files...). Or potentially worse, it specifies versions for some dependencies and not for others, and I find out that incompatible transitive dependencies have broken my program.

**If you want your program too work the same way, every time, without issue, then you need to pin your dependencies to an exact version.**

That means that instead of writing a `requirements.txt` like this:

```text
pandas
numpy
```

you should write it, at a minimum, like this:

```text
pandas==2.2.1
numpy==1.26.4
```

## Converting a `requirements.txt`

This method works best with a clean environment, so let's create a [virtual environment](https://docs.python.org/3/library/venv.html). Here's an example:

```shell
python -m venv venv
. venv/bin/activate
```

```shell
# docker run --interactive --tty --rm --volume "$PWD:/pwd" --workdir "/pwd" python:3 sh -c 'pip install --requirement requirements.txt && pip freeze --exclude setuptools --exclude wheel'
# docker run --interactive --tty --rm --volume "$PWD:/pwd" --workdir "/pwd" python:3 sh -c 'pip install --requirement requirements.txt && pip freeze | grep -iE "^($(grep -E "^\s*[^#]" requirements.txt | paste -s -d "|" -))=="'
# docker run --interactive --tty --rm --volume "$PWD:/pwd" --workdir "/pwd" python:3 sh -c 'pip install --requirement requirements.txt && echo "$(pip3 freeze --requirement requirements.txt | sed "/^\s*#.*pip freeze/,$ d")" > requirements.txt'
```

[Renovate](https://developer.mend.io/github/emmercm/igir/-/job/00e0221c-7ce3-48c7-a464-0fffe4a2ac8b)

```json
"pip_requirements": [
  {
    "deps": [
      {
        "depName": "mkdocs-material",
        "datasource": "pypi",
        "updates": [],
        "packageName": "mkdocs-material",
        "versioning": "pep440",
        "warnings": [],
        "skipReason": "invalid-value"
      },
      {
        "depName": "mkdocs-exclude-search",
        "datasource": "pypi",
        "updates": [],
        "packageName": "mkdocs-exclude-search",
        "versioning": "pep440",
        "warnings": [],
        "skipReason": "invalid-value"
      },
      {
        "depName": "mkdocs-git-revision-date-localized-plugin",
        "datasource": "pypi",
        "updates": [],
        "packageName": "mkdocs-git-revision-date-localized-plugin",
        "versioning": "pep440",
        "warnings": [],
        "skipReason": "invalid-value"
      },
      {
        "depName": "mkdocs-htmlproofer-plugin",
        "datasource": "pypi",
        "updates": [],
        "packageName": "mkdocs-htmlproofer-plugin",
        "versioning": "pep440",
        "warnings": [],
        "skipReason": "invalid-value"
      },
      {
        "depName": "mkdocs-redirects",
        "datasource": "pypi",
        "updates": [],
        "packageName": "mkdocs-redirects",
        "versioning": "pep440",
        "warnings": [],
        "skipReason": "invalid-value"
      },
      {
        "depName": "mkdocs-unused-files",
        "datasource": "pypi",
        "updates": [],
        "packageName": "mkdocs-unused-files",
        "versioning": "pep440",
        "warnings": [],
        "skipReason": "invalid-value"
      },
      {
        "depName": "mdx_truly_sane_lists",
        "datasource": "pypi",
        "updates": [],
        "packageName": "mdx_truly_sane_lists",
        "versioning": "pep440",
        "warnings": [],
        "skipReason": "invalid-value"
      },
      {
        "depName": "pillow",
        "datasource": "pypi",
        "updates": [],
        "packageName": "pillow",
        "versioning": "pep440",
        "warnings": [],
        "skipReason": "invalid-value"
      },
      {
        "depName": "cairosvg",
        "datasource": "pypi",
        "updates": [],
        "packageName": "cairosvg",
        "versioning": "pep440",
        "warnings": [],
        "skipReason": "invalid-value"
      }
    ],
    "packageFile": "docs/requirements.txt"
  }
]
```
<!--stackedit_data:
eyJoaXN0b3J5IjpbLTk1NjQ0ODUyNF19
-->