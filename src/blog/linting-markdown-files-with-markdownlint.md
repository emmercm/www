---

title: Linting Markdown files with markdownlint
date: 2023-04-05T21:27:00
tags:
- ci-cd
- markdown

---

Markdown's syntax is easy to learn, and even though the syntax is forgiving, linting can help you avoid unexpected issues.

[markdownlint](https://github.com/DavidAnson/markdownlint) and its CLI tool [`markdownlint-cli`](https://github.com/igorshubovych/markdownlint-cli) is the most common tool used for linting Markdown files. As of writing, markdownlint validates Markdown files against a list of [53 rules](https://github.com/DavidAnson/markdownlint/blob/main/doc/Rules.md). `markdownlint-cli` can be installed and used locally, but it's also easy to integrate into CI/CD pipelines.

_See "[Common Markdown Mistakes](/blog/common-markdown-mistakes)" for a list of the most common Markdown syntax mistakes I see people make._

## Usage

`markdownlint-cli` has [instructions](https://github.com/igorshubovych/markdownlint-cli#installation) for how to install via [`npm`](https://www.npmjs.com/) and [Homebrew](https://brew.sh/), but I'll focus on running it via Docker for OS portability. You can run `markdownlint-cli` in a container to lint Markdown files in your current directory like this:

```shell
$ docker run --volume "$PWD:/workdir" \
    ghcr.io/igorshubovych/markdownlint-cli:latest \
    "**/*.md"
```

If you want to disable certain markdownlint rules, you can do so like this:

```shell
$ docker run --volume "$PWD:/workdir" \
    ghcr.io/igorshubovych/markdownlint-cli:latest \
    --disable MD013 MD033 MD041 -- \
    "**/*.md"
```

_Note the required `--` which terminates the list of space-separated rule names._

## Example output

Let's define a markdown file `sample.md` with the contents:

```markdown
#Sample
This is a sample Markdown file.


It has a number of formatting issues.

###  Sub-heading
```

Here's the example output from `markdownlint-cli`:

```shell
$ docker run --volume "$PWD:/workdir" ghcr.io/igorshubovych/markdownlint-cli:latest "**/*.md"
sample.md:1:1 MD018/no-missing-space-atx No space after hash on atx style heading [Context: "#Sample"]
sample.md:1 MD041/first-line-heading/first-line-h1 First line in a file should be a top-level heading [Context: "#Sample"]
sample.md:4 MD012/no-multiple-blanks Multiple consecutive blank lines [Expected: 1; Actual: 2]
sample.md:7:1 MD019/no-multiple-space-atx Multiple spaces after hash on atx style heading [Context: "###  Sub-heading"]
```

## Adding to GitHub Actions

Linters become a lot more powerful when you add them to your CI pipelines. A linter without enforcement will surely be ignored over time.

Here's a sample of how you could add `markdownlint-cli` to a GitHub Actions `.github/workflows/test.yml` (feel free to change the filename):

```yaml
name: Project CI

on:
  pull_request:
    types:
      - opened
      - synchronize  # HEAD has changed, e.g. a push happened
      - reopened

jobs:
  markdown-lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: docker run --volume "$PWD:/workdir" ghcr.io/igorshubovych/markdownlint-cli:latest "**/*.md"
```

Then you can add a [branch protection rule](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches) to prevent pull request merges without certain passing jobs.
