---

title: Testing Docker Images with Container Structure Test
date: 2020-07-18T17:42:00
imageCredit: 'Photo by <a href="https://unsplash.com/@hdbernd">Bernd Dittrich</a> on <a href="https://unsplash.com/photos/El7nMmPZWCQ">Unsplash</a>'
tags:
- docker
- testing

---

Just because a Docker image builds successfully doesn't mean it will perform as expected. Google's [container Structure Test](https://github.com/GoogleContainerTools/container-structure-test) tool helps you check images to make sure they're working as intended.

Container Structure Test can be thought of as **unit tests for your Docker images**. Unit tests (and integration tests) help ensure your code is behaving as expected given various inputs; the same can be done with your Docker images. There are things that can go wrong with an image build, so images should be tested just like code is.

Container Structure Test can be configured to test a few different things:

- The stdout, stderr, and exit code of commands
- The existence of a file, along with its ownership and permissions
- The contents of a file, using regular expressions
- Metadata of the image such as: labels, entry point, command, exposed ports, and the working directory

## Why test a built image?

One reason is to make sure the image **contains all the files it needs** to run. If you have non-deterministic instructions such as `COPY . ./` that depend heavily on the build context, they may succeed but not copy something important such as a configuration file. Or if you have a `CMD` such as `CMD ["node", "index.js"]` it would probably be a good idea to make sure `index.js` exists.

Another reason is to ensure there's **no immediate runtime errors**. Just because your image successfully built a C/C++/Go/etc. binary doesn't mean it won't immediately crash on execution. There might be some shared libraries or a configuration file missing, or an issue with opening files or network sockets.

One last non-obvious reason to verify your images is it can **enable automatic CI/CD**. If you use tools such as [Renovate](https://renovate.whitesourcesoftware.com/), [Dependabot](https://dependabot.com/), or [Greenkeeper](https://greenkeeper.io/) to manage dependency updates, you could add Container Structure Test to your CI and have those tools auto-merge their pull requests, safely kicking off your CD without any human intervention.

## Testing `golang:latest`

To give a quick example of how to set up a Container Structure Test [config file](https://github.com/GoogleContainerTools/container-structure-test#setup), we'll test the base image `golang:1.14.6` (`latest` as of writing).

Create a file `config.yaml` and fill it in like this:

```yaml
schemaVersion: 2.0.0

metadataTest:
  # Image has expected default metadata
  env:
    - key: GOPATH
      value: /go
  exposedPorts: []
  volumes: []
  entrypoint: []

fileExistenceTests:
  # Main binary exists
  - name: go
    path: /usr/local/go/bin/go
    shouldExist: true
    permissions: "-rwxr-xr-x"

commandTests:
  # Main binary can print its version
  - name: go version
    command: go
    args: ["version"]
    expectedOutput: ["go version go1.14.6"]
    exitCode: 0
  # Can compile a valid "hello world"
  - name: hello world
    setup: [["wget", "https://raw.githubusercontent.com/go-training/helloworld/master/main.go"]]
    command: go
    args: ["run", "main.go"]
    expectedOutput: ["Hello World!!"]
    exitCode: 0
    teardown: [["rm", "main.go"]]
```

And then after [installing Container Structure Test](https://github.com/GoogleContainerTools/container-structure-test#installation), run the command:

```bash
$ container-structure-test test --image golang:1.14.6 --config config.yaml

====================================
====== Test file: config.yaml ======
====================================
=== RUN: Command Test: go version
--- PASS
duration: 432.795611ms
stdout: go version go1.14.6 linux/amd64

=== RUN: Command Test: hello world
--- PASS
duration: 735.946684ms
stdout: Hello World!!

=== RUN: File Existence Test: go
--- PASS
duration: 0s
=== RUN: Metadata Test
--- PASS
duration: 0s

=====================================
============== RESULTS ==============
=====================================
Passes:      4
Failures:    0
Duration:    1.168742295s
Total tests: 4

PASS
```

This is just a quick example of how to test some important parts of an image, see the full Container Structure Test [README](https://github.com/GoogleContainerTools/container-structure-test#setup) for all available options.

## Real world examples

I use Container Structure Test with all of [my public Docker Hub images](https://hub.docker.com/u/emmercm), here's some real world reasons why:

### [`emmercm/libtorrent`](https://github.com/emmercm/docker-libtorrent)

[libtorrent](https://www.libtorrent.org/) is a C++ BitTorrent library used by a number of clients such as [Deluge](https://deluge-torrent.org/) and [qBittorrent](https://www.qbittorrent.org/). It has a long enough build time on its own such that it was worth turning into a base image.

The [Container Structure Test config](https://github.com/emmercm/docker-qbittorrent/blob/master/4.2/container-structure-test.yml) makes sure:

- Both the shared and static versions of the library were built and exist in the right location (critical file existence check)
- Both the Python 2 and 3 bindings work and are able to print their version information (runtime error check)

### [`emmercm/qbittorrent`](https://github.com/emmercm/docker-qbittorrent)

[qBittorrent](https://www.qbittorrent.org/) is a BitTorrent client built on [libtorrent](https://www.libtorrent.org/). There is no official image for qBittorrent and there are very few actively maintained community versions with complete documentation.

The [Container Structure Test config](https://github.com/emmercm/docker-qbittorrent/blob/master/4.2/container-structure-test.yml) makes sure:

- The `ENTRYPOINT` shell script executes correctly with a dummy command (`echo "ok"`) (runtime error check)
- The main, built binary can be found in `$PATH` (critical file existence check)
- The main, built binary echoes its version successfully (runtime error check)
- The `ENTRYPOINT` shell script executes correctly with the primary `CMD` (runtime error check)

## Conclusion

You test your code (or you should), why wouldn't you test your Docker images?
