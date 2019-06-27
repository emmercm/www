---
title: Projects
---

# <i class="fab fa-docker"></i> Docker Images

I have published a number of public Docker images to [Docker Hub](https://hub.docker.com/u/emmercm).

All images have:

* Been optimized to have the fewest number of the smallest layers possible.
* Strong test coverage using Google's [Container Structure Test](https://github.com/GoogleContainerTools/container-structure-test).
* Base images kept up-to-date by [Renovate](https://renovatebot.com/) with automatic pull request merges.
* CI/CD using [Circle CI](https://circleci.com/) for automatic testing and pushing to [Docker Hub](https://hub.docker.com/u/emmercm).

## [libtorrent](https://github.com/emmercm/docker-libtorrent)

Images with [libtorrent](https://www.libtorrent.org/) compiled, including Python bindings, to be used as a base image for applications such as [qBittorrent](https://github.com/emmercm/docker-qbittorrent) and [FlexGet](https://github.com/emmercm/docker-qbittorrent).

## [qBittorrent](https://github.com/emmercm/docker-qbittorrent)

Images with a headless version of [qBittorrent](https://www.qbittorrent.org/) (`qbittorrent-nox`) compiled and the web UI exposed.

## [FlexGet](https://github.com/emmercm/docker-flexget)

Images with [FlexGet](https://flexget.com/) installed and the web UI exposed.

# <i class="fab fa-js"></i> Metalsmith Plugins

I have published a number of plugins for [Metalsmith](https://metalsmith.io/), a plugin-based JavaScript static site generator, to [npm](https://www.npmjs.com/settings/emmercm/packages).

All plugins have:

* Strong test coverage using [Jest](https://jestjs.io/).
* Dependencies kept up-to-date by [Renovate](https://renovatebot.com/) with automatic pull request merges.
* CI/CD using [Circle CI](https://circleci.com/) for automatic testing and publishing to [npm](https://www.npmjs.com/settings/emmercm/packages).

## [metalsmith-include-files](https://github.com/emmercm/metalsmith-include-files)

A plugin to include files outside the source directory.

## [metalsmith-htaccess](https://github.com/emmercm/metalsmith-htaccess)

A plugin to create [`.htaccess`](https://httpd.apache.org/docs/current/howto/htaccess.html) Apache HTTP Server configuration files. 

## [metalsmith-html-glob](https://github.com/emmercm/metalsmith-html-glob)

A plugin to process glob patterns (e.g. `<script src="**/*.js">`) in HTML tags.

## [metalsmith-html-relative](https://github.com/emmercm/metalsmith-html-relative)

A plugin to resolve relative paths (e.g. `<a href="../">`) in HTML tags

## [metalsmith-html-unused](https://github.com/emmercm/metalsmith-html-unused)

A plugin to remove unused resources (`.css`, `.js`, `.png`, etc.) in any of the HTML files.

## [metalsmith-html-sri](https://github.com/emmercm/metalsmith-html-sri)

A plugin to add [subresource integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity) attributes (e.g. `<script src="..." integrity="sha384-sc7RxY9...">`) to HTML tags.

## [metalsmith-uncss-2](https://github.com/emmercm/metalsmith-uncss-2)

A plugin to run the [UnCSS](https://github.com/uncss/uncss) unused CSS remover.

# <i class="fab fa-raspberry-pi"></i> Raspberry Pi Tools

I have written a number of Bash scripts for Raspberry Pis to automate the building of some kernel and driver code.

## [rpi-kernel](https://github.com/emmercm/rpi-kernel)

A script to build and install the [Raspberry Pi Foundation kernel](https://github.com/raspberrypi/linux) from source.

## [rpi-headers](https://github.com/emmercm/rpi-headers)

A script to build and install the [Raspberry Pi Foundation kernel](https://github.com/raspberrypi/linux) headers from source.

## [rpi-backports](https://github.com/emmercm/rpi-backports)

A script to build and install the [Backports Project](https://backports.wiki.kernel.org/index.php/Main_Page) (formerly `compat-drivers`) drivers from source.

## [rpi-rtl8812au](https://github.com/emmercm/rpi-rtl8812au)

A script to build the Realtek RTL8812AU WiFi driver.
