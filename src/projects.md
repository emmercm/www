---

title: Projects
description: A collection of open source projects I have developed.
priority: 0.8

---

# {{ title }}

{{ description }}

## <i class="fa-regular fa-joystick"></i> Iigir

[I`igir`](https://github.com/emmercm/igir) is a platform-independent video game ROM collection manager to help filter, sort, patch, and archive ROM collections. It combines all the best features from other ROM managers together into a neat, intuitive CLI package.

## <i class="fa-brands fa-node-js"></i> Metalsmith Plugins

I have published a number of plugins for [Metalsmith](https://metalsmith.io/), a plugin-based static site generator originally from [Segment](https://segment.com/), to [npm](https://www.npmjs.com/settings/emmercm/packages).

All the plugins are managed under one [Lerna](https://lerna.js.org/) monorepo at [metalsmith-plugins](https://github.com/emmercm/metalsmith-plugins).

Related blog posts:

- [Adding a Google Site Ownership Verification File in Metalsmith](/blog/adding-a-google-site-ownership-verification-file-in-metalsmith)
- [Linting Metalsmith Output HTML](/blog/linting-metalsmith-output-html)
- [Minify Files in Metalsmith](/blog/minify-files-in-metalsmith)
- [Remove Unused Assets in Metalsmith](/blog/remove-unused-assets-in-metalsmith)
- [Using Bootstrap 4 with Metalsmith](/blog/using-bootstrap-4-with-metalsmith)
- [Using Font Awesome with Metalsmith](/blog/using-font-awesome-with-metalsmith)
- [Using Relative Links in Metalsmith](/blog/using-relative-links-in-metalsmith)

## <i class="fa-brands fa-docker"></i> Docker Images

I have published a number of public Docker images to [Docker Hub](https://hub.docker.com/u/emmercm).

All images have:

- Been optimized to have the fewest number of the smallest layers possible.
- High test coverage using Google's [Container Structure Test](https://github.com/GoogleContainerTools/container-structure-test).
- Base images kept up-to-date by [Renovate](https://renovatebot.com/), with automatic pull request merges.
- CI/CD using [Circle CI](https://circleci.com/) for automatic testing and pushing to [Docker Hub](https://hub.docker.com/u/emmercm).

### [libtorrent](https://github.com/emmercm/docker-libtorrent)

A collection of images with [libtorrent](https://www.libtorrent.org/) compiled, including Python bindings, to be used as a base image for applications such as [qBittorrent](https://github.com/emmercm/docker-qbittorrent) and [FlexGet](https://github.com/emmercm/docker-qbittorrent).

Related blog articles:

- [Reducing Docker Layers](/blog/reducing-docker-layers)

### [qBittorrent](https://github.com/emmercm/docker-qbittorrent)

A collection of images with a headless version of [qBittorrent](https://www.qbittorrent.org/) (`qbittorrent-nox`) compiled and the web UI exposed.

### [FlexGet](https://github.com/emmercm/docker-flexget)

A collection of images with [FlexGet](https://flexget.com/) installed and the web UI exposed.

## <i class="fa-brands fa-raspberry-pi"></i> Raspberry Pi Tools

I have written a number of Bash scripts for Raspberry Pi to automate building and installing kernels and drivers from source.

### [rpi-kernel](https://github.com/emmercm/rpi-kernel)

A script to build and install the [Raspberry Pi Foundation kernel](https://github.com/raspberrypi/linux) from source.

### [rpi-headers](https://github.com/emmercm/rpi-headers)

A script to build and install the [Raspberry Pi Foundation kernel](https://github.com/raspberrypi/linux) headers from source.

Kernel headers are used for compiling code that interfaces with the kernel, such as drivers.

### [rpi-backports](https://github.com/emmercm/rpi-backports)

A script to build and install the [Backports Project](https://backports.wiki.kernel.org/index.php/Main_Page) drivers (formerly [`compat-drivers`](https://backports.wiki.kernel.org/index.php/Documentation/compat-drivers)) from source.

### [rpi-rtl8812au](https://github.com/emmercm/rpi-rtl8812au)

A script to build and install a Realtek RTL8812AU WiFi driver from source.

### [rpi-cast](https://github.com/emmercm/rpi-cast)

A tool to automatically cast audio input from a Raspberry Pi.
