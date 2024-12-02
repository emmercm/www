---

title: Reliably Detecting Existing Commands in Bash
date: 2024-12-02
tags:
- shell

---

There are quite a few different methods you'll find on the internet that all have their own problems.

Before I go into the details, this is the syntax you want:

```bash
if command -v <command_name> &> /dev/null; then
	echo "command exists"
fi
```

or alternatively:

```bash
command -v <command_name> &> /dev/null && echo "command exists"
```

## Explanation

Here's the [man page](https://man7.org/linux/man-pages/man1/command.1p.html) for `command -v command_name`:

<pre>
-v       Write a string to standard output that indicates the  
         pathname or command that will be used by the shell, in  
         the current shell execution environment (see <i>Section  
         2.12</i>, <i>Shell Execution Environment</i>), to invoke  
         <i>command_name</i>, but do not invoke <i>command_name</i>.  
  
          *  Utilities, regular built-in utilities,  
             <i>command_name</i>s including a &lt;slash&gt; character, and  
             any implementation-defined functions that are found  
             using the <i>PATH</i> variable (as described in <i>Section  
             2.9.1.1</i>, <i>Command Search and Execution</i>), shall be  
             written as absolute pathnames.  
  
          *  Shell functions, special built-in utilities,  
             regular built-in utilities not associated with a  
             <i>PATH</i> search, and shell reserved words shall be  
             written as just their names.  
  
          *  An alias shall be written as a command line that  
             represents its alias definition.  
  
          *  Otherwise, no output shall be written and the exit  
             status shall reflect that the name was not found.
</pre>

The main takeaway here is this method will work for executables in `$PATH`, functions, and aliases. Other methodologies only work for a subset of those commands.

## The problem with `if -x file`

One of the more common methods I've seen suggested is:

```bash
if [[ -x "$(command -v <command_name>)" ]]; then
	echo "executable exists"
fi
```
<!--stackedit_data:
eyJoaXN0b3J5IjpbLTMzNDYzNzI5MV19
-->