---

title: What is a Docker Digest?
date: 2030-01-01
image: https://unsplash.com/photos/3tAUxQfglbE
imageCredit: Photo by <a href="https://unsplash.com/@daniel_von_appen">Daniel von Appen</a> on <a href="https://unsplash.com/photos/3tAUxQfglbE">Unsplash</a>
tags:
- docker

---

Docker tags are mutable - they can be re-published over and over - so the most specific way an image can be referenced is by its digest.

## Identifying a Docker image

As a quick primer, Docker image identifiers are in the form `NAME[:TAG][@DIGEST]`:

- `NAME` being the project or repository name, containing: lowercase letters, digits, periods, underscores, and hyphens
- `TAG` being the specific version of the image, containing: lowercase and uppercase letters, digits, underscores, periods, and hyphens
- `DIGEST` being a hash of a specific manifest, regardless of tag

Examples of valid image identifiers:

- `node`
- `node@sha256:94a00394bc5a8ef503fb59db0a7d0ae9e1119866e8aee8ba40cd864cea69ea1a`
- `node:latest`
- `node:stretch`
- `node:14`
- `node:14.7`
- `node:14.7.0`
- `node:14.7.0@sha256:94a00394bc5a8ef503fb59db0a7d0ae9e1119866e8aee8ba40cd864cea69ea1a`

## Mutable image tags

Docker image tags are mutable by design, that's how tags such as `node:latest` or `golang:alpine` are able to stay updated. This could be confusing where someone might expect `node:14` to change over time, but might expect something tagged very specifically such as `14.7.0-alpine3.11` to not change.

The Renovate blog has a [good article](https://renovate.whitesourcesoftware.com/blog/overcoming-dockers-mutable-image-tags/) about how [yarn](https://yarnpkg.com/) was broken in the official Node.js Docker images when existing tags were re-published.

## Immutable digests

Docker digests are simply just a hash of a manifest file. Because the [`docker manifest`](https://docs.docker.com/engine/reference/commandline/manifest/) command is still experimental as of writing, we'll use the tool [`skopeo`](https://github.com/containers/skopeo) to look at the contents of the repository manifest:

```bash
$ skopeo inspect --raw docker://node:14.7.0 | jq .
{
  "manifests": [
    {
      "digest": "sha256:6876330f75897c735067f88e28c778ccd9ad87eb7d7f6d1c8e431887b443c932",
      "mediaType": "application/vnd.docker.distribution.manifest.v2+json",
      "platform": {
        "architecture": "amd64",
        "os": "linux"
      },
      "size": 2215
    },
    {
      "digest": "sha256:48e797bc326caa8c6d0cccd029322eaf89e77e7e95abc6bfea11c50f46920843",
      "mediaType": "application/vnd.docker.distribution.manifest.v2+json",
      "platform": {
        "architecture": "arm",
        "os": "linux",
        "variant": "v7"
      },
      "size": 2214
    },
    {
      "digest": "sha256:a27ff08c466b4cd56ba99decc5183fbee7a5bdb8f6d16a44067f27f4fcd41074",
      "mediaType": "application/vnd.docker.distribution.manifest.v2+json",
      "platform": {
        "architecture": "arm64",
        "os": "linux",
        "variant": "v8"
      },
      "size": 2214
    }
  ],
  "mediaType": "application/vnd.docker.distribution.manifest.list.v2+json",
  "schemaVersion": 2
}
```

That's the manifest returned by Docker Hub, and thankfully we didn't need to pull the full image to get that. Note how it has an array of `manifets`, this is a "manifest list" produced by a multi-architecture build, we'll talk more about those later.

Finding the repository digest is as simple as computing the hash of that output:

```bash
$ skopeo inspect --raw docker://node:14.7.0 | shasum --algorithm 256 | awk '{print $1}'
94a00394bc5a8ef503fb59db0a7d0ae9e1119866e8aee8ba40cd864cea69ea1a
```

That means in order to refer to this exact image, we would put this in a Dockerfile:

```dockerfile
FROM node:14.7.0@sha256:94a00394bc5a8ef503fb59db0a7d0ae9e1119866e8aee8ba40cd864cea69ea1a

RUN node --version
```

This same hash can be seen in a few other places:

```bash
$ docker pull node:14.7.0
14.7.0: Pulling from library/node
419e7ae5bb1e: Pull complete
848839e0cd3b: Pull complete
de30e8b35015: Pull complete
258fdea6ea48: Pull complete
ddb75eb7f1e9: Pull complete
7ec8a0667334: Pull complete
7c53f6037242: Pull complete
42574776fa37: Pull complete
74fba464c705: Pull complete
Digest: sha256:94a00394bc5a8ef503fb59db0a7d0ae9e1119866e8aee8ba40cd864cea69ea1a
Status: Downloaded newer image for node:14.7.0
docker.io/library/node:14.7.0

$ docker images --digests
REPOSITORY          TAG                 DIGEST                                                                    IMAGE ID            CREATED             SIZE
node                14.7.0              sha256:94a00394bc5a8ef503fb59db0a7d0ae9e1119866e8aee8ba40cd864cea69ea1a   002df0b34ccb        2 days ago          943MB

$ docker inspect --format '{{index .RepoDigests 0}}' node:14.7.0
node@sha256:94a00394bc5a8ef503fb59db0a7d0ae9e1119866e8aee8ba40cd864cea69ea1a
```

See my other article "[Keep Docker Base Images Updated with Renovate](/blog/keep-docker-base-images-updated-with-renovate)" for more information on why pinning Docker digests is a good idea and how you can keep them updated automatically.

## Manifest lists

In the above `node:14.7.0` example, we were returned a list of manifests when asking the container registry for the raw manifest. This lets developers publish multiple platforms for the same image tag, and it's done with the commands `docker manifest` or `docker buildx` (both experimental as of writing). This is fairly common with "library" base images, such as `node` and `ubuntu`:

```bash
$ skopeo inspect --raw docker://ubuntu:20.04 | jq .
{
  "manifests": [
    {
      "digest": "sha256:60f560e52264ed1cb7829a0d59b1ee7740d7580e0eb293aca2d722136edb1e24",
      "mediaType": "application/vnd.docker.distribution.manifest.v2+json",
      "platform": {
        "architecture": "amd64",
        "os": "linux"
      },
      "size": 1152
    },
    {
      "digest": "sha256:6701deddfa3bdabb3a50eb0a24175367b9c7b145e8b2f889ee3b2c52a295ec0a",
      "mediaType": "application/vnd.docker.distribution.manifest.v2+json",
      "platform": {
        "architecture": "arm",
        "os": "linux",
        "variant": "v7"
      },
      "size": 1152
    },
    {
      "digest": "sha256:8351cb483b295a97ee3cc15150285a58ccf0669e422d4730a9a608988bd5e902",
      "mediaType": "application/vnd.docker.distribution.manifest.v2+json",
      "platform": {
        "architecture": "arm64",
        "os": "linux",
        "variant": "v8"
      },
      "size": 1152
    },
    {
      "digest": "sha256:d5b40885539615b9aeb7119516427959a158386af13e00d79a7da43ad1b3fb87",
      "mediaType": "application/vnd.docker.distribution.manifest.v2+json",
      "platform": {
        "architecture": "ppc64le",
        "os": "linux"
      },
      "size": 1152
    },
    {
      "digest": "sha256:5679518149183fed9dcba60e60f35b0a5ceb59e1ad7b7f9143dc227eda68b202",
      "mediaType": "application/vnd.docker.distribution.manifest.v2+json",
      "platform": {
        "architecture": "s390x",
        "os": "linux"
      },
      "size": 1152
    }
  ],
  "mediaType": "application/vnd.docker.distribution.manifest.list.v2+json",
  "schemaVersion": 2
}
```

If we request the manifest for a specific platform we get more specific information about its layers:

```bash
$ skopeo inspect --raw docker://ubuntu@sha256:60f560e52264ed1cb7829a0d59b1ee7740d7580e0eb293aca2d722136edb1e24 | jq .
{
  "schemaVersion": 2,
  "mediaType": "application/vnd.docker.distribution.manifest.v2+json",
  "config": {
    "mediaType": "application/vnd.docker.container.image.v1+json",
    "size": 3408,
    "digest": "sha256:1e4467b07108685c38297025797890f0492c4ec509212e2e4b4822d367fe6bc8"
  },
  "layers": [
    {
      "mediaType": "application/vnd.docker.image.rootfs.diff.tar.gzip",
      "size": 28557306,
      "digest": "sha256:3ff22d22a8554f746f90a78b501da38d56a46f2ddba0dfec8b260aebaa61b3ba"
    },
    {
      "mediaType": "application/vnd.docker.image.rootfs.diff.tar.gzip",
      "size": 32320,
      "digest": "sha256:e7cb79d19722c46b9c0829811d7a5a0ae82c8771ab7f2f68e7d3a3ed6bd5d5d0"
    },
    {
      "mediaType": "application/vnd.docker.image.rootfs.diff.tar.gzip",
      "size": 851,
      "digest": "sha256:323d0d660b6a7da8df08a01dbc7250f38cfa2161db00c7c27c0b20be07a8236a"
    },
    {
      "mediaType": "application/vnd.docker.image.rootfs.diff.tar.gzip",
      "size": 162,
      "digest": "sha256:b7f616834fd07522cbfd33f0dfa848903599320b5c7191b59fe9aa7562f956a1"
    }
  ]
}
```

The same rule applies for calculating the digest, it's a hash of the manifest:

```bash
$ skopeo inspect --raw docker://ubuntu@sha256:60f560e52264ed1cb7829a0d59b1ee7740d7580e0eb293aca2d722136edb1e24 | shasum --algorithm 256 | awk '{print $1}'
60f560e52264ed1cb7829a0d59b1ee7740d7580e0eb293aca2d722136edb1e24
```

You shouldn't use platform-specific digests in your Dockerfiles as they're less portable, you should stick with the manifest list digest:

```dockerfile
FROM ubuntu:20.04@sha256:5d1d5407f353843ecf8b16524bc5565aa332e9e6a1297c73a92d3e754b8a636d

RUN cat /etc/os-release
```

Docker Hub has pages for platform-specific digests ([`ubuntu:20.04@sha256:60f560e...`](https://hub.docker.com/layers/ubuntu/library/ubuntu/20.04/images/sha256-60f560e52264ed1cb7829a0d59b1ee7740d7580e0eb293aca2d722136edb1e24?context=explore)), but as of writing they don't have pages for manifest list digests (`ubuntu:20.04@sha256:5d1d540...`).

## Bash function

Here's a bash function from [my dotfiles](https://github.com/emmercm/dotfiles) you can put into your `.bash_profile`, `.profile`, or `.bashrc` (whichever is appropriate):

```bash
# Get the digest hash of a Docker image
# @param {string} $1 name[:tag][@digest]
ddigest() {
    if [[ -x "$(command -v skopeo)" ]]; then
        skopeo inspect --raw "docker://$1" | shasum --algorithm 256 | awk '{print "sha256:"$1}'
    else
        docker pull "$1" &> /dev/null || true
        docker inspect --format '{{index .RepoDigests 0}}' "$1" | awk -F "@" '{print $2}'
    fi
}
```

It can be used like this:

```bash
$ ddigest node:14.7.0
sha256:94a00394bc5a8ef503fb59db0a7d0ae9e1119866e8aee8ba40cd864cea69ea1a

$ ddigest golang:alpine
sha256:e9f6373299678506eaa6e632d5a8d7978209c430aa96c785e5edcb1eebf4885e

$ ddigest ubuntu:latest
sha256:5d1d5407f353843ecf8b16524bc5565aa332e9e6a1297c73a92d3e754b8a636d
```
