---

title: Linting Dockerfiles with Hadolint
date: 2020-08-10T21:34:00
image: https://unsplash.com/photos/rdfxX3iCnz0
tags:
- ci-cd
- docker

---

Linters don't just enforce style guidelines, they also catch potential issues. [`hadolint`](https://github.com/hadolint/hadolint) (Haskell Dockerfile Linter) is the most popular linter for Dockerfiles, and it's incredibly easy to use.

`hadolint` parses your Dockerfiles into an [abstract syntax tree](https://en.wikipedia.org/wiki/Abstract_syntax_tree) and then checks rules on that tree. Not only does it have its own rules specific to Dockerfiles, it also uses [ShellCheck](https://github.com/koalaman/shellcheck) to lint `RUN` instructions.

## Usage

Assuming you already have Docker installed because we're talking about Dockerfiles, the easiest way to run `hadolint` is with Docker:

```bash
docker run --rm --interactive hadolint/hadolint < Dockerfile
```

Where `Dockerfile` is a file that exists in your working directory, outside of the container.

There are some other ways to [install](https://github.com/hadolint/hadolint#install) `hadolint`, but running it from Docker is probably the easiest way to go.

## Configuration

There's really only two things you can configure about `hadolint`:

- What `hadolint` and ShellCheck rules to ignore
- What container registries are "trusted"

Both of those can be configured in a `$PWD/.hadolint.yaml` file like so:

```yaml
ignored:
  - DL3003
  - DL3018

trustedRegistries:
  - docker.io
```

Or you can inline-configure ignored rules like so:

```dockerfile
# hadolint ignore=DL3007
FROM alpine:latest

# hadolint ignore=DL3003,DL3018
RUN apk --update add --no-cache git && \
    cd "$(mktemp -d)" && \
    git pull "https://github.com/hadolint/hadolint.git"
```

## Example output

Taking the above example and removing the ignored rules:

```dockerfile
FROM alpine:latest

RUN apk --update add --no-cache git && \
    cd "$(mktemp -d)" && \
    git pull "https://github.com/hadolint/hadolint.git"
```

Here's the example output:

```shell
$ docker run --rm --interactive hadolint/hadolint < Dockerfile
/dev/stdin:1 DL3007 Using latest is prone to errors if the image will ever update. Pin the version explicitly to a release tag
/dev/stdin:3 DL3003 Use WORKDIR to switch to a directory
/dev/stdin:3 DL3018 Pin versions in apk add. Instead of `apk add <package>` use `apk add <package>=<version>`
```

## Adding to CI

Linters become a lot more powerful when you add them to your CI pipeline. A linter without enforcement will surely be ignored over time.

Here's a sample of how you could add `hadolint` to a CircleCI `.circleci/config.yml`:

```yaml
version: 2.1

executors:
  docker:
    docker:
      - image: docker:stable

jobs:
  lint:
    executor: docker
    steps:
      - checkout
      - setup_remote_docker
      - run:
          name: Run hadolint
          command: docker run --rm --interactive hadolint/hadolint < Dockerfile

workflows:
  version: 2.1
  test:
    jobs:
      - lint
```

## Conclusion

Linters are a great tool to prevent team arguments over style, but they're a great tool for preventing potential errors - start using `hadolint` with your Dockerfiles today!
