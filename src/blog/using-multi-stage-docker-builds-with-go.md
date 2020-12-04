---

title: Using Multi-Stage Docker Builds with Go
image: https://unsplash.com/photos/AKJ7gq-n4zE
date: 2020-06-04T22:26:00
tags:
- go
- docker

---

[Multi-stage Docker builds](https://docs.docker.com/develop/develop-images/multistage-build/) can greatly reduce the size of final built images, and the savings can be extreme with Go.

[It's important](https://hackernoon.com/why-its-important-to-keep-your-containers-small-and-simple-618ced7343a5) to keep the size of Docker images small as it reduces the size that needs to be published, hosted, and downloaded. Publishing is usually infrequent, and hosting is free through a number of container registries, so those aren't a big deal - but the download size will affect everyone and every cluster that wants to use your image. As a general rule of thumb, reducing the number of layers in a final image helps reduce the size.

Docker has a feature called multi-stage builds where multiple `FROM` instructions can be used in a single Dockerfile, each with an optional alias. Each stage can use a different base (e.g. `golang:1.14`, `node:lts`, `alpine:latest`, etc.), and each stage can copy files from previous stages with the `COPY` instruction.

Go is a great candidate for multi-stage Docker builds because compiled Go binaries are statically-linked. That means you can execute the same, single binary on its own in other similar environments - like containers!

## Getting started with Go

Let's go ahead and create the simplest `main.go` we can, a hello world program:

```go
package main

import "fmt"

func main() {
	fmt.Println("hello world")
}
```

And assuming you have Go installed locally, running the file will produce the expected output:

```shell
$ go run main.go
hello world
```

## Single-stage build

Create a `Dockerfile` that compiles our Go application and sets it up to be run with `docker run`:

```dockerfile
FROM golang:1.14.4-alpine

WORKDIR /go/src/app
COPY main.go .

RUN go build -o /go/bin/app main.go

CMD ["app"]
```

Build the image and tag it as `example`:

```shell
$ docker build -t example .
...
Successfully tagged example:latest
```

And then running the container will produce the expected output:

```shell
$ docker run example
hello world
```

But let's check out the size of the final image we built:

```shell
$ docker image ls example
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
example             latest              9bc90e495f18        9 seconds ago       372MB
```

**372MB!** That's astronomically large for such a small application. That's because the base image is so large due to all the Go binaries and libraries:

```shell
$ docker run golang:1.14.4-alpine sh -c "du -sh /usr/local/go/*"
56.0K   /usr/local/go/AUTHORS
4.0K    /usr/local/go/CONTRIBUTING.md
88.0K   /usr/local/go/CONTRIBUTORS
4.0K    /usr/local/go/LICENSE
4.0K    /usr/local/go/PATENTS
4.0K    /usr/local/go/README.md
4.0K    /usr/local/go/SECURITY.md
4.0K    /usr/local/go/VERSION
6.9M    /usr/local/go/api
18.0M   /usr/local/go/bin
4.2M    /usr/local/go/doc
8.0K    /usr/local/go/favicon.ico
780.0K  /usr/local/go/lib
4.8M    /usr/local/go/misc
238.7M  /usr/local/go/pkg
4.0K    /usr/local/go/robots.txt
88.2M   /usr/local/go/src
13.3M   /usr/local/go/test
```

Let's find out how many layers our image has:

```shell
$ docker inspect example --format '{{range .RootFS.Layers}}{{println .}}{{end}}'
sha256:50644c29ef5a27c9a40c393a73ece2479de78325cae7d762ef3cdc19bf42dd0a
sha256:0f7493e3a35bab1679e587b41b353b041dca1e7043be230670969703f28a1d83
sha256:1ba1431fe2ba3d4eb50dfcc11980e8f6146fa71f67bd3eb30d3b82e77fb3cdc9
sha256:35d1ab51a96b944692fe512bebb6e8a0303534d76257c3750f721bd16919e219
sha256:82a15a1dbd15547643e8602a025316323bd48236a0f972fe7628e1cd002139ea
sha256:3513f690faf76b8a7f6df1e00e6f5d061fa9b9bd5d5a7b4601895f4c95983c43
sha256:024c58834d196a578ca2cc5816e0d07a68694a4d5460c560d855718558f08978
sha256:36e38ccc3746d8a7355cd8a84bf2b95c9b961c38f7044948784bce077c655bc7
```

**8 layers!** Granted, 5 of them are coming from the base image - but that's a lot, especially for such a small application.

## Multi-stage build

Time to figure out just how much space a multi-stage build could save us.

Change the `Dockerfile` to add an extra `FROM` instruction that will create a second stage that will `COPY` the built binary from the first stage:

```dockerfile
FROM golang:1.14.4-alpine AS builder

WORKDIR /go/src/app
COPY main.go .

RUN go build -o /go/bin/app main.go


FROM alpine:latest

COPY --from=builder /go/bin/app /usr/local/bin/app

CMD ["app"]
```

Build the image like before:

```shell
$ docker build -t example .
...
Successfully tagged example:latest
```

Make sure it has the same output:

```shell
$ docker run example
hello world
```

And look at the space-saving magic:

```shell
$ docker image ls example
REPOSITORY          TAG                 IMAGE ID            CREATED              SIZE
example             latest              ecd4076f7d37        About a minute ago   7.64MB
```

**7.64MB!** Roughly _2%_ of the size it was before!

What about how many layers that is:

```shell
$ docker inspect example --format '{{range .RootFS.Layers}}{{println .}}{{end}}'
sha256:50644c29ef5a27c9a40c393a73ece2479de78325cae7d762ef3cdc19bf42dd0a
sha256:0c2a04464c15287d9674ad2bccdcc5b1e15e05eb53e465595da78856468f1c5e
```

**Only 2!** One from the base image and one from our second build stage. That's also a huge savings.

## Summary

Multi-stage builds help cut out a lot of unnecessary files and reduce final image sizes. They work especially well with Go because of its static linking, though it's possible to use them with other compiled languages as well.
