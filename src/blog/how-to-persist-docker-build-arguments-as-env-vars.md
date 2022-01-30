---

title: How to Persist Docker Build Arguments as Env Vars
date: 2021-08-23T03:18:00
tags:
- docker

---

Values from the Docker [`ARG` instruction](https://docs.docker.com/engine/reference/builder/#arg) aren't persisted in built images, so here's a quick tip on how to persist them!

## Use cases

`ARG` instructions are great for setting or pinning values such as version numbers like this:

```dockerfile
ARG NODE_VERSION=lts

FROM node:${NODE_VERSION}-alpine

RUN node --version
```

```dockerfile
FROM node:lts-alpine

ARG NCU_VERSION=11.8.3

RUN npm install --global npm-check-updates@${NCU_VERSION} && \
    ncu --version
```

## The problem

To prove that `ARG` values aren't persisted in built images, let's take the following Dockerfile and then build and run it:

```dockerfile
FROM node:lts-alpine

ARG NODE_ENV=development

RUN echo NODE_ENV=${NODE_ENV}

CMD echo NODE_ENV=${NODE_ENV}
```

When we build it, we'll get output similar to:

```shell
$ docker build --tag arg .
[2/2] RUN echo NODE_ENV=development
sha256:d6cb91e153d8eae5f90b7584d24260c818276a3bc2b7969338851035d5e1f5aa
0.204 NODE_ENV=development
DONE 0.2s
```

Which has the `RUN` output we would expect, but if we run that image:

```shell
$ docker run arg
NODE_ENV=
```

We see the environment variable is unset.

## The solution

The solution is pretty simple - `ARG` values aren't persisted, but `ENV` values [are](https://docs.docker.com/engine/reference/builder/#env), so let's make an `ENV` out of an `ARG`:

```dockerfile
FROM node:lts-alpine

ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

RUN echo NODE_ENV=${NODE_ENV}

CMD echo NODE_ENV=${NODE_ENV}
```

When we build this version, we'll still get the `RUN` output we would expect:

```shell
$ docker build --tag arg .
[2/2] RUN echo NODE_ENV=development
sha256:d6cb91e153d8eae5f90b7584d24260c818276a3bc2b7969338851035d5e1f5aa
0.225 NODE_ENV=development
DONE 0.2s
```

And now when we run the image we'll also get the `CMD` output we're hoping for:

```shell
$ docker run arg
NODE_ENV=development
```

And to prove it actually persists CLI build arguments, let's run:

```shell
$ docker build --build-arg NODE_ENV=production --tag arg .
[2/2] RUN echo NODE_ENV=production
sha256:0191c73e7ca9c7db7e8d83e4c4eecc5dc3c54a040eebb326bac1a7faa1c93a3d
0.213 NODE_ENV=production
DONE 0.2s

$ docker run arg
NODE_ENV=production
```

And we can see it's working!

## Dangers of persistence

There are values you don't want to persist in Docker images, mainly secrets. You might need `$NPM_TOKEN` to install private npm packages, or a GitHub personal access token to clone private GitHub repositories. These are sensitive secrets and you don't want to accidentally publish them in your final image.

## Real world example

I ran across a use case for this trick while I was developing a Flexget [Docker image](https://github.com/emmercm/docker-flexget). Flexget is a Python project that's installed via `pip`, and I wanted the image to automatically update Flexget to the latest patch version on startup. Because I wanted to pin the major and minor version of Flexget, I needed to persist the version in the built image, and for that I needed `ENV`.

The full Dockerfile can be found [here](https://github.com/emmercm/docker-flexget/blob/70e0fdcf5d296767381dd883f131f98af8eb3aa8/3.1/Dockerfile), but here's a slimmed-down, slightly modified version to demonstrate this use case:

```dockerfile
FROM python:3-alpine

ARG FLEXGET_VERSION=3.1.135
ENV FLEXGET_VERSION=${FLEXGET_VERSION}

RUN apk add g++ gcc linux-headers musl-dev && \
    pip install flexget~=${FLEXGET_VERSION} && \
    flexget --version

CMD pip install flexget~=${FLEXGET_VERSION} && \
    flexget --version
```

```shell
$ docker build --tag flexget .
78.18 3.1.135
78.18 You are on the latest release.
DONE 78.5s

$ docker run flexget
Requirement already satisfied: flexget~=3.1.135 in /usr/local/lib/python3.9/site-packages (3.1.135)
3.1.135
You are on the latest release.
```
