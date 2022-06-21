---

title: Creating a Java Playground in Docker
date: 2030-01-01
tags:
- docker
- java

---

It's helpful to have local throwaway environments for testing code snippets, and creating one for Java is a snap with Docker.

Java can have an involved and somewhat invasive process to install the JDK, and then there's even more work on top of that to set up an IDE with some decent build tools. Sometimes all you want is some quick feedback on Java syntax and behavior without all the setup.

## The JShell "interpreter"

From the [JShell](https://docs.oracle.com/javase/9/jshell/introduction-jshell.htm) documentation:

> The Java Shell tool (JShell) is an interactive tool for learning the Java programming language and prototyping Java code. JShell is a Read-Evaluate-Print Loop (REPL), which evaluates declarations, statements, and expressions as they are entered and immediately shows the results. The tool is run from the command line.

In short, it lets us run and test code like we might with the [Python interpreter](https://docs.python.org/3/tutorial/interpreter.html).

If you have the JDK installed then you might already have the `jshell` binary available to you, but maybe you're interested in testing some existing code in a different JDK version, or trying new Java syntax in newer versions.

## Using Docker

The [OpenJDK image](https://hub.docker.com/_/openjdk) for [Docker](https://www.docker.com/) is an easy way to gain a JShell session:

```shell
$ docker run --interactive --tty openjdk:latest jshell
Unable to find image 'openjdk:latest' locally
latest: Pulling from library/openjdk
5f160c0f6cac: Pull complete
fb499df0377a: Pull complete
373b9e2b6c72: Pull complete
Digest: sha256:fe7336430f035011a70c69cfb82760efbe0ae9b0707e1e86c8796c1702bd2ba6
Status: Downloaded newer image for openjdk:latest
Jun 21, 2022 2:59:21 AM java.util.prefs.FileSystemPreferences$1 run
INFO: Created user preferences directory.
|  Welcome to JShell -- Version 18.0.1.1
|  For an introduction type: /help intro

jshell>
```

_My recommendation is to change the [`openjdk` tag](https://hub.docker.com/_/openjdk?tab=tags) from `latest` to whatever major version want, such as `openjdk:11`._

Because every TUI and shell needs a unique exit command, the command in JShell is `/exit`. When you exit the JShell session it will stop the Docker container.

## Working with old JDK versions

JShell was included with [JDK 9 (2017)](https://docs.oracle.com/javase/9/whatsnew/toc.htm) and onward. If you want to use JShell with an older version of the JDK ...

## Testing some code
