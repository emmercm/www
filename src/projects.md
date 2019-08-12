---

title: Projects
description: A collection of open source projects I have developed.
style: container

---

# {{ title }}

{{ description }}

## <i class="fab fa-docker"></i> Docker Images

I have published a number of public Docker images to [Docker Hub](https://hub.docker.com/u/emmercm).

All images have:

* Been optimized to have the fewest number of the smallest layers possible.
* High test coverage using Google's [Container Structure Test](https://github.com/GoogleContainerTools/container-structure-test).
* Base images kept up-to-date by [Renovate](https://renovatebot.com/), with automatic pull request merges.
* CI/CD using [Circle CI](https://circleci.com/) for automatic testing and pushing to [Docker Hub](https://hub.docker.com/u/emmercm).

### [libtorrent](https://github.com/emmercm/docker-libtorrent)

A collection of images with [libtorrent](https://www.libtorrent.org/) compiled, including Python bindings, to be used as a base image for applications such as [qBittorrent](https://github.com/emmercm/docker-qbittorrent) and [FlexGet](https://github.com/emmercm/docker-qbittorrent).

### [qBittorrent](https://github.com/emmercm/docker-qbittorrent)

A collection of images with a headless version of [qBittorrent](https://www.qbittorrent.org/) (`qbittorrent-nox`) compiled and the web UI exposed.

### [FlexGet](https://github.com/emmercm/docker-flexget)

A collection of images with [FlexGet](https://flexget.com/) installed and the web UI exposed.

## <i class="fab fa-node-js"></i> Metalsmith Plugins

I have published a number of plugins for [Metalsmith](https://metalsmith.io/), a plugin-based static site generator originally from [Segment](https://segment.com/), to [npm](https://www.npmjs.com/settings/emmercm/packages).

All plugins have:

* High test coverage using [Jest](https://jestjs.io/).
* Dependencies kept up-to-date by [Renovate](https://renovatebot.com/), with automatic pull request merges.
* CI/CD using [Circle CI](https://circleci.com/) for automatic testing and publishing to [npm](https://www.npmjs.com/settings/emmercm/packages).

### [metalsmith-include-files](https://github.com/emmercm/metalsmith-include-files)

A plugin to include files outside of the source directory.

### [metalsmith-htaccess](https://github.com/emmercm/metalsmith-htaccess)

A plugin to create an `.htaccess` Apache HTTP Server (`httpd`) [configuration file](https://httpd.apache.org/docs/current/howto/htaccess.html). 

### [metalsmith-html-glob](https://github.com/emmercm/metalsmith-html-glob)

A plugin to process glob patterns (e.g. `<script src="**/*.js">`) in HTML tags.

### [metalsmith-html-relative](https://github.com/emmercm/metalsmith-html-relative)

A plugin to make local paths relative (e.g. `<a href="../index.html">`) in HTML tags.

### [metalsmith-html-unused](https://github.com/emmercm/metalsmith-html-unused)

A plugin to remove resources (`.css`, `.js`, `.png`, etc.) that aren't used in any HTML file.

### [metalsmith-html-sri](https://github.com/emmercm/metalsmith-html-sri)

A plugin to add [subresource integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity) attributes (e.g. `<script src="..." integrity="sha384-sc7RxY9...">`) to HTML tags.

### [metalsmith-uncss-2](https://github.com/emmercm/metalsmith-uncss-2)

A plugin to run the [UnCSS](https://github.com/uncss/uncss) unused CSS remover on source files.

## <i class="fab fa-raspberry-pi"></i> Raspberry Pi Tools

I have written a number of Bash scripts for Raspberry Pi to automate building and installing kernels and drivers from source.

### [rpi-kernel](https://github.com/emmercm/rpi-kernel)

A script to build and install the [Raspberry Pi Foundation kernel](https://github.com/raspberrypi/linux) from source.

### [rpi-headers](https://github.com/emmercm/rpi-headers)

A script to build and install the [Raspberry Pi Foundation kernel](https://github.com/raspberrypi/linux) headers from source.

Kernel headers are used for compiling code that interfaces with the kernel, such as drivers.

### [rpi-backports](https://github.com/emmercm/rpi-backports)

A script to build and install the [Backports Project](https://backports.wiki.kernel.org/index.php/Main_Page) drivers (formerly `compat-drivers`) from source.

### [rpi-rtl8812au](https://github.com/emmercm/rpi-rtl8812au)

A script to build and install a Realtek RTL8812AU WiFi driver from source.

## <i class="far fa-robot"></i> FIRST Robotics Competition

I have developed a number of applications for use in the [FIRST Robotics Competition](https://www.firstinspires.org/robotics/frc), a worldwide STEM competition for high school students.

### [SharkScout](https://github.com/hammerhead226/SharkScout)

A Python (`CherryPy`, `ws4py`, `Genshi`) and MongoDB-based web app for both quantitative and qualitative [competition scouting](http://www.team358.org/files/scouting/). Used by the [Hammerheads (226)](http://hammerhead226.org/) in the 2017 and 2018 competition seasons.

Built with unreliable client connections as a primary concern, the app makes use of front-end caching and background syncing with web sockets. Designed to make use of team and event data from [The Blue Alliance](https://www.thebluealliance.com/), stored locally for offline use, there is very little work required to get started.

### [SharkCV](https://github.com/hammerhead226/SharkCV)

A Python and OpenCV\-based vision processing framework designed to run on a coprocessor. Used by the [Hammerheads (226)](http://hammerhead226.org/) in the 2016 competition season.

Similar to the [GRIP](https://wpiroboticsprojects.github.io/GRIP) and [Limelight](https://limelightvision.io/) software, SharkCV was designed to abstract away most of the OpenCV complexity so configuration can be fast and easy. Unlike other hardware solutions, SharkCV running on a coprocessor such as a Raspberry Pi gives many different options for both input and output sources.
