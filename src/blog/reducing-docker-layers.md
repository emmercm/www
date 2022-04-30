---

title: Reducing Docker Layers
date: 2020-06-29T21:59:00
tags:
- docker

---

Reducing the size of your Docker images is important for a number of reasons, and while there are newer tools such as [multi-stage builds](https://docs.docker.com/develop/develop-images/multistage-build/), [reducing the number of layers](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/#minimize-the-number-of-layers) in your image may help.

See "[Using Multi-Stage Docker Builds with Go](/blog/using-multi-stage-docker-builds-with-go)" for an example of the size savings that can be achieved with multi-stage builds.

## What causes layers

The [3 Docker instructions](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/#minimize-the-number-of-layers) that create layers are:

- `RUN`: run a command
- `COPY`: include a local file
- `ADD`: include a local or remote file

That's it. Reducing the number of those instructions is how to reduce the number of final layers.

Note that your image will inherit all the layers of its base image, as well any additional ones you cause.

## Reducing layers isn't a golden rule

There are tradeoffs when using strategies to reduce layers in your images, and not all of them are desirable. For example, you may value build time over fewer layers, especially when building repeatedly locally with only minor changes. Here's a list of some pros and cons:

**Pros of reducing layers**:

- Fewer layers to publish or download, likely reducing image size.
- Chaining `RUN` instructions reduces cache-ability for non-deterministic commands such as [`apt-get update`](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/#apt-get):

    ```dockerfile
    # Don't use a cached "update" with an "install"
    RUN apt-get update && \
        apt-get install -y <packages>
    ```

- Chaining `RUN` instructions increases idempotency, which may desirable:

    ```dockerfile
    # Don't cache the "update" and "install" if "make" doesn't succeed
    RUN apt-get update && \
        apt-get install -y <packages> && \
        make
    ```

**Cons of reducing layers**:

- Reduced cache-ability, especially when building repeatedly locally.
- Chaining `RUN` instructions probably means `COPY` and `ADD` instructions come first, reducing the ability to use the [build cache](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/#leverage-build-cache) for `RUN`.
- Chaining `RUN` instructions can reduce readability (paraphrase of `docker-libtorrent` v1.2.11's [Dockerfile](https://github.com/emmercm/docker-libtorrent/blob/d367f9eae4239710f62493d6ed3a5e876470f94c/1.2/Dockerfile)):

    ```dockerfile
    RUN set -euo pipefail && \
        apk --update add --no-cache autoconf automake g++ gcc make && \
        for PYTHON_VERSION in $(seq 2 3); do \
            (./configure PYTHON="$(which python${PYTHON_VERSION})" &&
            make -j$(nproc)) || exit 1; \
        done && \
        rm -rf /tmp/*
    ```

## Strategies to reduce layers

Remember from above - there's only 3 instructions that cause layers - so here are some strategies for reducing those specific instructions.

### Use multi-stage builds

[Multi-stage builds](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/#use-multi-stage-builds) are great because only the layers from the last stage end up in the final image.

Here's a shorthand example:

```dockerfile
FROM alpine AS builder
# COPY some things
# RUN some things
# RUN some more things
# COPY even more things
# RUN one last command that outputs an executable file "/app"

FROM alpine
COPY --from=builder /app /usr/local/bin/app
CMD ["app"]
```

That will produce an image with only 2 layers - 1 from the base image and 1 from `COPY`. The big win here is that you can still leverage the [build cache](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/#leverage-build-cache) in the first stage.

### Use a base image with fewer layers

Because your image will inherit all the layers (and size) of your base image, it's important to pick the smallest base image for your needs.

For example, a lightweight image such as [Alpine Linux](https://hub.docker.com/_/alpine) has very few layers (1):

```shell
$ docker pull alpine:3.12.0
3.12.0: Pulling from library/alpine
df20fa9351a1: Pull complete
Digest: sha256:185518070891758909c9f839cf4ca393ee977ac378609f700f60a771a2dfe321
Status: Downloaded newer image for alpine:3.12.0
docker.io/library/alpine:3.12.0

$ docker inspect --format '{{range .RootFS.Layers}}{{println .}}{{end}}' alpine:3.12.0
sha256:50644c29ef5a27c9a40c393a73ece2479de78325cae7d762ef3cdc19bf42dd0a
```

While a heavy image such as [Ubuntu](https://hub.docker.com/_/ubuntu) has more layers (4):

```shell
$ docker pull ubuntu:20.04
20.04: Pulling from library/ubuntu
a4a2a29f9ba4: Pull complete
127c9761dcba: Pull complete
d13bf203e905: Pull complete
4039240d2e0b: Pull complete
Digest: sha256:52259450119427dab05c0c455121c48d7b04cee2d61b5dbdde1219b2163af572
Status: Downloaded newer image for ubuntu:20.04
docker.io/library/ubuntu:20.04

$ docker inspect --format '{{range .RootFS.Layers}}{{println .}}{{end}}' ubuntu:20.04
sha256:e1c75a5e0bfa094c407e411eb6cc8a159ee8b060cbd0398f1693978b4af9af10
sha256:9e97312b63ff63ad98bb1f3f688fdff0721ce5111e7475b02ab652f10a4ff97d
sha256:ec1817c93e7c08d27bfee063f0f1349185a558b87b2d806768af0a8fbbf5bc11
sha256:05f3b67ed530c5b55f6140dfcdfb9746cdae7b76600de13275197d009086bb3d
```

### Combine multiple `COPY` and `ADD` instructions

Organizing source directories and destination directories so that you can `COPY` more files with fewer instructions is the goal.

Given a [build context](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/#understand-build-context) and Dockerfile such as:

```text
.
├── app
├── css
├── entrypoint.sh
├── img
└── js
```

```dockerfile
COPY app app
COPY entrypoint.sh app/
COPY css static/css
COPY img static/img
COPY js static/js
```

You could reorganize your source files so that you only need one `COPY` instruction:

```text
.
├── app
│   └── entrypoint.sh
└── static
    ├── css
    ├── img
    └── js
```

```dockerfile
COPY . ./
```

**That's a 4 layer reduction right there.**

Be careful when copying everything from the build context with `COPY .`, you probably want a [`.dockerignore` file](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/#exclude-with-dockerignore) to cut down on build time and size.

### Combine multiple `RUN` instructions

The majority of the `RUN` instructions in a Dockerfile can probably be combined into one long instruction of chained commands.

Given a Dockerfile such as:

```dockerfile
# Install build dependencies
RUN apt-get update
RUN apt-get install -y autoconf automake g++ gcc make

# Configure and make
RUN ./configure
RUN make
RUN make install

# Cleanup
RUN rm -rf /var/lib/apt/lists/*
```

You can combine those commands with `&&`s:

```dockerfile
RUN apt-get update && \
    apt-get install -y autoconf automake g++ gcc make && \
    ./configure && \
    make && \
    make install && \
    rm -rf /var/lib/apt/lists/*
```

**That's a 5 layer reduction.**

It's likely that attempting to combine all of your `RUN` instructions into one instruction will cause your source file `COPY` and `ADD` instructions to be before `RUN`, which means any change to your source files will [invalidate the build cache](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/#leverage-build-cache), meaning it will have to execute the entire `RUN` instruction again.

Here's an example where that isn't great:

```dockerfile
# Copying every file you need
COPY . ./

# Some very long command
RUN sleep 300
```

Every time the source files change it invalidates the build cache of the `COPY` instruction and every instruction after it, causing long build times.

## Conclusion

There are definite advantages and disadvantages for targeting the fewest possible number of layers in your images.

Me personally, I like to squeeze the layers and size out of public images I maintain, but when it comes to a workplace environment where productivity is valued higher I tend to optimize for using the build cache for faster local builds.
