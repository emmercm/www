---

title: Undoing a Git Commit
date: 2030-01-01
tags:
- git

---

Complicated Git operations are hard to remember and are full of landmines - here's a short guide on how to undo any Git commit.

Why would you want to undo a commit? There's a number of reasons:

- Fixing a typo in a commit message
- Adding additional changes to a commit
- Removing committed secrets

## Example project

Here's an example project with its commits:

```shell
$ git reflog
4614585 (HEAD -> main) HEAD@{0}: commit: Bad commit
5fde797 (origin/main, origin/HEAD) HEAD@{1}: commit: Questionable commit
f62390c HEAD@{2}: commit: Good commit
338de59 HEAD@{3}: clone: from https://github.com/emmercm/undoing-a-git-commit.git
```

There is a bad commit that hasn't been pushed yet, and a questionable commit that has been pushed.

We'll refer to this project in the scenarios below.

## Finding the last "good" commit

It's important for us to figure what the last "good" commit is, because we will undo all the changes after it. Knowing which commit is "good" in the example project is trivial, but it may not be for your project.

`git log` and `git reflog` are your primary tools here, and assuming you have verbose commit messages it shouldn't be too difficult to figure out what the last "good" commit in your project is.

From the example project, the shortened hash `f62390c` is the last definitively "good" commit, and we're unsure if `5fde797` is "good" or not.

## Scenario 1: the commit hasn't been pushed

From the above example project, let's say we only want to undo the most recent "bad" commit, and leave the pushed commits alone. This makes `5fde797` the last known "good" commit. There are two ways we can undo all changes after `5fde797`...

Undo the last commit, whatever it is:

```shell
$ git reset --soft HEAD~1

$ git reflog
5fde797 (HEAD -> main, origin/main, origin/HEAD) HEAD@{0}: reset: moving to HEAD~1
4614585 HEAD@{1}: commit: Bad commit
5fde797 (HEAD -> main, origin/main, origin/HEAD) HEAD@{2}: commit: Questionable commit
f62390c HEAD@{3}: commit: Good commit
338de59 HEAD@{4}: clone: from https://github.com/emmercm/undoing-a-git-commit.git
```

Undo all changes after `5fde797`, specifically:

```shell
$ git reset --soft 5fde797

$ git reflog
5fde797 (HEAD -> main, origin/main, origin/HEAD) HEAD@{0}: reset: moving to 5fde797
4614585 HEAD@{1}: commit: Bad commit
5fde797 (HEAD -> main, origin/main, origin/HEAD) HEAD@{2}: commit: Questionable commit
f62390c HEAD@{3}: commit: Good commit
338de59 HEAD@{4}: clone: from https://github.com/emmercm/undoing-a-git-commit.git
```

In both strategies, the `--soft` flag signals that we want to leave files in the working tree (on disk) alone, which is the least destructive and often preferred behavior. From here we have the freedom to either make fixes and `git commit`, or `git checkout --` and git rid of all uncommitted changes.

## Scenario 2: the commit has been pushed

This is the more difficult and dangerous scenario

From the above example project, let's say we find the "questionable" commit to be "bad" - this makes `f62390c` the last known "good" commit. There are two steps to undo all changes after `f62390c`...

Undoing the commits locally:

```shell
$ git reset --soft f62390c

$ git reflog
f62390c (HEAD -> main) HEAD@{0}: reset: moving to f62390c
4614585 HEAD@{1}: commit: Bad commit
5fde797 (origin/main, origin/HEAD) HEAD@{2}: commit: Questionable commit
f62390c (HEAD -> main) HEAD@{3}: commit: Good commit
338de59 HEAD@{4}: clone: from https://github.com/emmercm/undoing-a-git-commit.git
```

Undoing the commits on the remote repository.

Warnings:

- History rewriting has the potential of being destructive - make a local backup of your project folder, along with`.git`, so you can recover from any incorrect commands.
- Other people who have cloned or forked your repository will not have their copy fixed with `git pull`, they will also need to do some manual work (not covered here).

```shell
$ git push --force origin
Total 0 (delta 0), reused 0 (delta 0), pack-reused 0
To https://github.com/emmercm/undoing-a-git-commit.git
 + 5fde797...f62390c main -> main (forced update)

$ git reflog
f62390c (HEAD -> main, origin/main, origin/HEAD) HEAD@{0}: reset: moving to f62390c
4614585 HEAD@{1}: commit: Bad commit
5fde797 HEAD@{2}: commit: Questionable commit
f62390c (HEAD -> main, origin/main, origin/HEAD) HEAD@{3}: commit: Good commit
338de59 HEAD@{4}: clone: from https://github.com/emmercm/undoing-a-git-commit.git
```

## Alternative 1: manually correcting the mistake in a new commit

The solutions offered in the above scenarios have the potential to go wrong - if you're fixing the contents of a file, and you don't mind additional commits in your history, consider adding a new commit for the fix. This option won't work if you're trying to remove committed secrets.

## Alternative 2: using `git revert`

Similarly to making a new commit by hand, `git revert` adds a new commit that undoes all changes from a certain commit:

```shell
$ git revert 4614585
Removing bad
[main 6e1f431] Revert "Bad commit"
 1 file changed, 0 insertions(+), 0 deletions(-)
 delete mode 100644 bad

$ git reflog
6e1f431 (HEAD -> main) HEAD@{0}: revert: Revert "Bad commit"
4614585 HEAD@{1}: commit: Bad commit
5fde797 (origin/main, origin/HEAD) HEAD@{2}: commit: Questionable commit
f62390c HEAD@{3}: commit: Good commit
338de59 HEAD@{4}: clone: from https://github.com/emmercm/undoing-a-git-commit.git
```
