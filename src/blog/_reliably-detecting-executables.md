---

title: Reliably Detecting Executables in Bash
date: 2024-12-02
tags:
- shell

---

There are quite a few different methods you'll find on the internet that all have their own problems.

Before I go into the details, this is the syntax you want:

```bash
if command -v (command) &> /dev/null; then
	echo "do something"
fi
```

or alternatively:

```bash
command -v (command) &> /dev/null && echo "do something"
```

## Explanation

Here's the man page for `command -v`:

```text
-v       Write a string to standard output that indicates the  
         pathname or command that will be used by the shell, in  
         the current shell execution environment (see _Section_  
         _2.12_, _Shell Execution Environment_), to invoke  
         _command_name_, but do not invoke _command_name_.  
  
          *  Utilities, regular built-in utilities,  
             _command_name_s including a <slash> character, and  
             any implementation-defined functions that are found  
             using the _PATH_ variable (as described in _Section_  
             _2.9.1.1_, _Command Search and Execution_), shall be  
             written as absolute pathnames.  
  
          *  Shell functions, special built-in utilities,  
             regular built-in utilities not associated with a  
             _PATH_ search, and shell reserved words shall be  
             written as just their names.  
  
          *  An alias shall be written as a command line that  
             represents its alias definition.  
  
          *  Otherwise, no output shall be written and the exit  
             status shall reflect that the name was not found.
```
<!--stackedit_data:
eyJoaXN0b3J5IjpbLTE4MzcwNDQ2NDZdfQ==
-->