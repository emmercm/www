---

title: Creating a Java Playground in Docker
date: 2022-07-03T17:07:00
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
Jul 03, 2022 3:53:40 PM java.util.prefs.FileSystemPreferences$1 run
INFO: Created user preferences directory.
|  Welcome to JShell -- Version 18.0.1.1
|  For an introduction type: /help intro

jshell>
```

_My recommendation is to change the [`openjdk` tag](https://hub.docker.com/_/openjdk?tab=tags) from `latest` to whatever major version you want, such as `openjdk:11`._

Because every TUI and interactive shell needs a unique exit command, the command in JShell is `/exit`. When you exit the JShell session it will stop the Docker container.

To double-check what JDK version is being used, you can run:

```shell
jshell> System.getProperty("java.version");
$1 ==> "18.0.1.1"
```

## Working with old JDK versions

JShell is included with [JDK 9 (2017)](https://docs.oracle.com/javase/9/whatsnew/toc.htm) and onward. For a similar experience with JDK versions 5 through 8 (though OpenJDK only started at 6), you can use [BeanShell](https://github.com/beanshell/beanshell):

```shell
$ docker run --interactive --tty openjdk:8 bash -c "wget --quiet https://github.com/beanshell/beanshell/releases/download/2.1.0/bsh-2.1.0.jar && java -cp bsh-*.jar bsh.Interpreter"
BeanShell 2.1.0 - https://github.com/beanshell/beanshell
bsh %
```

BeanShell will exit with a typical `CTRL-C` keypress.

And similar to JShell, you can check the JDK version with:

```shell
bsh % System.getProperty("java.version");
<1.8.0_332>
```

## Dotfile alias

We can tie all of the above logic together into a nice Bash function we can add to our dotfiles:

```bash
djava() {
    if [[ -z "$1" || "${1:-}" -ge 9 ]]; then
        docker run --interactive --tty "openjdk:${1:-latest}" jshell
    else
        docker run --interactive --tty "openjdk:$1" bash -c "wget --quiet https://github.com/beanshell/beanshell/releases/download/2.1.0/bsh-2.1.0.jar && java -cp bsh-*.jar bsh.Interpreter"
    fi
}
```

You can find it in [mine](https://github.com/emmercm/dotfiles/blob/72019c371f3797d4bbaf1718331220a99f359c43/.20_docker.bash#L71-L83).

## Testing some code

Let's run some code to see what the output is:

```shell
jshell> Stream.of(1,2,3,4,5).reduce(0, (a,b) -> a+b);
$1 ==> 15


jshell> double calculateHypotenuse(double a, double b) { return Math.sqrt(a*a+b*b);}
|  created method calculateHypotenuse(double,double)

jshell> calculateHypotenuse(3,4);
$3 ==> 5.0


jshell> 10 / 0;
|  Exception java.lang.ArithmeticException: / by zero
|        at (#4:1)


jshell> IntStream.rangeClosed(0, 10).mapToObj(
   ...>         i -> i % 3 == 0 ?
   ...>                 (i % 5 == 0 ? "FizzBuzz" : "Fizz") :
   ...>                 (i % 5 == 0 ? "Buzz" : i))
   ...>         .forEach(System.out::println);
FizzBuzz
1
2
Fizz
4
Buzz
Fizz
7
8
Fizz
Buzz
```
