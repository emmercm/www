---

title: Undoing a Git Commit
date: 2030-01-01
tags:
- git

---

Complicated Git operations are hard to remember and full of landmines - here's a short guide on how to undo any Git commit.

This article is specifically about _undoing_ commits, not _reverting_ them - _reverting_ adds additional commits to your branch which can look messy.

## Example project

Here's an example project with its commits:

```shell
$ git log --oneline --graph
* 2e48006 (HEAD -> main) Bad commit
* b85dd44 (origin/main, origin/HEAD) Questionable commit
* ecc0c2e Good commit
* bfeb1c1 Initial commit
```

There is a bad commit that hasn't been pushed yet, and a questionable commit that has been pushed.

We'll refer to this project in the scenarios below.

## Finding the last "good" commit

It's important for us to figure what the last "good" commit is, because we will undo all the changes after it. Knowing which commit is "good" in the example project is trivial, but it may not be for your project.

`git log` is your primary tool here, and assuming you have verbose commit messages it shouldn't be too difficult to figure out what the last "good" commit is based on your situation.

From the example project, the shortened hash `ecc0c2e` is the last definitively "good" commit, and we're unsure if `b85dd44` is "good" or not.

## Scenario 1: the commit hasn't been pushed

From the above example project, let's say we only want to undo the most recent "bad" commit, and leave the pushed commits alone. This makes `b85dd44` the last known "good" commit.  There are two ways we can undo all changes after `b85dd44`...

Undo the last commit, whatever it is:

```shell
$ git reset --soft HEAD~1

$ git log --oneline --graph
* b85dd44 (HEAD -> main, origin/main, origin/HEAD) Questionable commit
* ecc0c2e Good commit
* bfeb1c1 Initial commit
```

Undo all changes after `b85dd44`, specifically:

```shell
$ git reset --soft b85dd44

$ git log --oneline --graph
* b85dd44 (HEAD -> main, origin/main, origin/HEAD) Questionable commit
* ecc0c2e Good commit
* bfeb1c1 Initial commit
```

In both strategies the `--soft` flag signals that we want to leave files in the working tree alone, which is the least destructive and often preferred behavior. From here we have the freedom to either make fixes and `git commit`, or `git checkout --` and git rid of all uncommited changes.

## Scenario 2: the commit has been pushed

This is the more difficult and dangerous scenario
