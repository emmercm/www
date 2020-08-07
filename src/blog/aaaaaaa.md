---

title: What is a Docker Image Digest?
date: 2030-01-01
tags:
- docker

---

Docker tags are mutable - they can be re-published over and over - so the most specific way an image can be referenced is by its digest.

## Identifying a Docker image

As a quick primer, Docker image identifiers are in the form `NAME[:TAG][@DIGEST]`:

- `NAME` being the project or repository name, containing: lowercase letters, digits, periods, underscores, and hyphens
- `TAG` being the specific version of the image, containing: lowercase and uppercase letters, digits, underscores, periods, and hyphens
- `DIGEST` being a hash of a specific image, regardless of tag (more later)

Examples of valid images on Docker Hub:

- `node`
- `node@sha256:521df806339e2e60dfdee6e00e75656e69798c141bd2cff88c0c9a9c50ad4de5`
- `node:latest`
- `node:stretch`
- `node:14`
- `node:14.7`
- `node:14.7.0`
- `node:14.7.0@sha256:521df806339e2e60dfdee6e00e75656e69798c141bd2cff88c0c9a9c50ad4de5`

## Mutable image tags

Docker image tags are mutable by design, that's how tags such as `node:latest` or `golang:alpine` are able to work. This could be confusing where someone might expect `node:14` to change over time, but might expect something tagged very specifically such as `14.7.0-alpine3.11` to not change.

The Renovate blog has a [good article](https://renovate.whitesourcesoftware.com/blog/overcoming-dockers-mutable-image-tags/) about how [yarn](https://yarnpkg.com/) was broken in the official Node.js Docker images when existing tags were re-published.

## Immutable image digests

Docker image digests are simply just a hash of its manifest file. Because the [`docker manifest`](https://docs.docker.com/engine/reference/commandline/manifest/) command is still experimental as of writing, we'll need to use the tool [`skopeo`](https://github.com/containers/skopeo) to look at the contents of the manifest file:

```bash
$ skopeo copy --override-os linux docker://node:14.7.0 dir:./node
Getting image source signatures
Copying blob 7e6d8ed60355 done
Copying blob 43421f771d04 done
Copying blob c36327c39ae4 done
Copying blob 22b0be3e8a61 done
Copying blob 6b168feb1bb0 done
Copying blob 0a127f2eabe9 done
Copying blob b8ebb87902bd done
Copying blob 74fcd4404a16 done
Copying blob e8efbeec3186 done
Copying config 4495f296c6 done
Writing manifest to image destination
Storing signatures

$ shasum --algorithm 256 node/manifest.json
f5bda0840c2349828d89a6532b1d1379b666aa8196a02be258a79e376d818643  node/manifest.json
```

Which is indeed the digest for the `linux/amd64` platform of the `node:14.7.0` image, as [reported by Docker Hub](https://hub.docker.com/layers/node/library/node/14.7.0/images/sha256-f5bda0840c2349828d89a6532b1d1379b666aa8196a02be258a79e376d818643?context=explore).

If we try to [`docker pull`](https://docs.docker.com/engine/reference/commandline/pull/) that digest

```bash
$ docker pull node:14.7.0
14.7.0: Pulling from library/node
7e6d8ed60355: Pull complete
43421f771d04: Pull complete
c36327c39ae4: Pull complete
22b0be3e8a61: Pull complete
6b168feb1bb0: Pull complete
0a127f2eabe9: Pull complete
b8ebb87902bd: Pull complete
74fcd4404a16: Pull complete
e8efbeec3186: Pull complete
Digest: sha256:521df806339e2e60dfdee6e00e75656e69798c141bd2cff88c0c9a9c50ad4de5
Status: Downloaded newer image for node:14.7.0
docker.io/library/node:14.7.0

$ docker pull node@sha256:f5bda0840c2349828d89a6532b1d1379b666aa8196a02be258a79e376d818643
sha256:f5bda0840c2349828d89a6532b1d1379b666aa8196a02be258a79e376d818643: Pulling from library/node
Digest: sha256:f5bda0840c2349828d89a6532b1d1379b666aa8196a02be258a79e376d818643
Status: Downloaded newer image for node@sha256:f5bda0840c2349828d89a6532b1d1379b666aa8196a02be258a79e376d818643
docker.io/library/node@sha256:f5bda0840c2349828d89a6532b1d1379b666aa8196a02be258a79e376d818643

$ docker images --digests
REPOSITORY          TAG                 DIGEST                                                                    IMAGE ID            CREATED             SIZE
node                14.7.0              sha256:521df806339e2e60dfdee6e00e75656e69798c141bd2cff88c0c9a9c50ad4de5   4495f296c63b        3 days ago          943MB
node                14.7.0              sha256:f5bda0840c2349828d89a6532b1d1379b666aa8196a02be258a79e376d818643   4495f296c63b        3 days ago          943MB

$ docker inspect --format '{{range .RepoDigests}}{{println .}}{{end}}' node:14.7.0
node@sha256:521df806339e2e60dfdee6e00e75656e69798c141bd2cff88c0c9a9c50ad4de5
node@sha256:f5bda0840c2349828d89a6532b1d1379b666aa8196a02be258a79e376d818643
```

Notice how a new image wasn't actually pulled, Docker just added the platform-specific image digest but kept the same image ID.

## Repository digests

We just calculated the digest for a specific platform of `node:14.7.0` above, but that doesn't help us when we might not always be working with the same operating system or architecture. Instead, the digest we really want is the "repository digest". This digest can be seen in a few places (look for `521df80...`):

```bash
$ docker pull node:14.7.0
14.7.0: Pulling from library/node
7e6d8ed60355: Pull complete
43421f771d04: Pull complete
c36327c39ae4: Pull complete
22b0be3e8a61: Pull complete
6b168feb1bb0: Pull complete
0a127f2eabe9: Pull complete
b8ebb87902bd: Pull complete
74fcd4404a16: Pull complete
e8efbeec3186: Pull complete
Digest: sha256:521df806339e2e60dfdee6e00e75656e69798c141bd2cff88c0c9a9c50ad4de5
Status: Downloaded newer image for node:14.7.0
docker.io/library/node:14.7.0

$ docker images --digests
REPOSITORY          TAG                 DIGEST                                                                    IMAGE ID            CREATED             SIZE
node                14.7.0              sha256:521df806339e2e60dfdee6e00e75656e69798c141bd2cff88c0c9a9c50ad4de5   4495f296c63b        3 days ago          943MB

$ docker inspect --format '{{index .RepoDigests 0}}' node:14.7.0
node@sha256:521df806339e2e60dfdee6e00e75656e69798c141bd2cff88c0c9a9c50ad4de5
```

See how all of those have the digest of `521df80...` and not `f5bda08...` from above? That's because it's the platform-agnostic "repository digest" of the latest `node:14.7.0` version.

Because [`docker inspect`](https://docs.docker.com/engine/reference/commandline/inspect/) requires us to already have the image pulled, we can again use `skopeo` to calculate this digest, but without needing to pull the image or touching the local filesystem:

```bash
$ skopeo inspect --raw docker://node:14.7.0 | jq .
{
  "manifests": [
    {
      "digest": "sha256:f5bda0840c2349828d89a6532b1d1379b666aa8196a02be258a79e376d818643",
      "mediaType": "application/vnd.docker.distribution.manifest.v2+json",
      "platform": {
        "architecture": "amd64",
        "os": "linux"
      },
      "size": 2215
    },
    {
      "digest": "sha256:dcd9f74f877ab4ece5b171bcd11ccd867a9bd08693243c58c04de8e3ea22b604",
      "mediaType": "application/vnd.docker.distribution.manifest.v2+json",
      "platform": {
        "architecture": "arm",
        "os": "linux",
        "variant": "v7"
      },
      "size": 2214
    },
    {
      "digest": "sha256:212a7165c962468275856b1c61f12e40ef63b6e0bb51ea7b48953f538dcba8da",
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

$ skopeo inspect --raw docker://node:14.7.0 | shasum --algorithm 256 | awk '{print $1}'
521df806339e2e60dfdee6e00e75656e69798c141bd2cff88c0c9a9c50ad4de5
```

Note how the `f5bda08...` platform digest was actually used in calculating the `521df80...` repository digest.

## Bash function

Here's a bash function from [my dotfiles](https://github.com/emmercm/dotfiles) you can put into your `.bash_profile`, `.profile`, or `.bashrc` (whichever is appropriate):

```bash
# Get the digest hash of a Docker image
# @param {string} $1 name[:tag|@digest]
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
sha256:521df806339e2e60dfdee6e00e75656e69798c141bd2cff88c0c9a9c50ad4de5

$ ddigest golang:1.14.6
sha256:2aa6447d32de9bd2156c5aa379acb2766c196415626d06d8f5fcc2167e6f8844
```

## Digest pinning

See my other article "[Keep Docker Base Images Updated with Renovate](/blog/keep-docker-base-images-updated-with-renovate)".........
