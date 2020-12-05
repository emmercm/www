---

title: Changing a Git Commit Message
date: 2020-12-05T21:35:00
tags:
- git
- github

---

The Git commands to change a commit message are situational - here's a short guide to all of them.

## Example project

Starting from an empty repository that was freshly cloned, let's create an example situation with a few commit message mistakes:

```shell
$ touch index.html && git add .

$ git commit -m "Aded homepage"
[master (root-commit) 4dc005b] Aded homepage
 1 file changed, 0 insertions(+), 0 deletions(-)
 create mode 100644 index.html

$ git push

$ echo "body{background:grey;}" > style.css && git add .

$ git commit -m "Added stilesheet"
[master 468d547] Added stilesheet
 1 file changed, 1 insertion(+)
 create mode 100644 style.css

$ echo "console.log('debug');" > script.js && git add .

$ git commit -m "Updated stylesheet"
[master bd9d97a] Updated stylesheet
 1 file changed, 1 insertion(+)
 create mode 100644 script.js

$ git log --oneline
bd9d97a (HEAD -> master) Updated stylesheet
468d547 Added stilesheet
4dc005b (origin/master) Aded homepage
```

There are three scenarios to correct here:

- The last commit has an incorrect message, and it is _not_ pushed
- The middle commit has a misspelling, and it is _not_ pushed
- The first commit has a misspelling, and it _is_ pushed

## Scenario 1: changing the most recent commit

To fix the incorrect message in the most recent commit we can use the "amend commit" command:

```bash
git commit --amend
```

This will open your CLI editor (`$EDITOR`) with the contents:

```text
Updated stylesheet

# Please enter the commit message for your changes. Lines starting
# with '#' will be ignored, and an empty message aborts the commit.
#
# Date:      Sat Dec 5 15:45:45 2020 -0500
#
# On branch master
# Your branch is ahead of 'origin/master' by 2 commits.
#   (use "git push" to publish your local commits)
#
# Changes to be committed:
#       new file:   script.js
#
```

We didn't update the stylesheet in this commit, we added some JavaScript. Change the commit message to "Added JavaScript", then save and exit the editor. This will rewrite the commit, as evidenced by the different commit hash:

```shell
$ git log --oneline
3ebd64d (HEAD -> master) Added JavaScript
468d547 Added stilesheet
4dc005b (origin/master) Aded homepage
```

Because the remote repository doesn't know about this commit yet, we don't need to do any additional work.

## Scenario 2: changing an older commit

To fix the spelling mistake in the middle commit, we need to use the "[interactive rebase](https://git-scm.com/book/en/v2/Git-Tools-Rewriting-History)" command, looking back 2 commits:

```bash
git rebase -i HEAD~2
```

This will again open your CLI editor (`$EDITOR`), with the truncated contents:

```text
pick 468d547 Added stilesheet
pick 3ebd64d Added JavaScript

# Rebase 4dc005b..3ebd64d onto 4dc005b (2 commands)
```

We want to perform the "reword" command on the `468d547` commit, so change the contents to:

```text
reword 468d547 Added stilesheet
pick 3ebd64d Added JavaScript
```

Save the file and exit. A new editor will open with the contents:

```text
Added stilesheet

# Please enter the commit message for your changes. Lines starting
# with '#' will be ignored, and an empty message aborts the commit.
#
# Date:      Sat Dec 5 15:45:08 2020 -0500
#
# interactive rebase in progress; onto 4dc005b
# Last command done (1 command done):
#    reword 468d547 Added stilesheet
# Next command to do (1 remaining command):
#    pick 3ebd64d Added JavaScript
# You are currently editing a commit while rebasing branch 'master' on '4dc005b'.
#
# Changes to be committed:
#       new file:   style.css
#
```

Correcting the spelling to "Added stylesheet", then save and exit the editor. This will rewrite the commit and all commits after it, as evidenced by the different commit hashes:

```shell
$ git log --oneline
82c8f91 (HEAD -> master) Added JavaScript
67b43d4 Added stylesheet
4dc005b (origin/master) Aded homepage
```

And again because the remote repository doesn't know about this commit yet, we don't need to do any additional work.

## Scenario 3: changing a commit that has been pushed

In the first two scenarios we corrected commits that haven't been pushed yet, only making changes to our local repository. To correct the misspelling in the very first commit message, we'll again use the "[interactive rebase](https://git-scm.com/book/en/v2/Git-Tools-Rewriting-History)" command, but we'll also need to "force push" the branch to the remote repository afterwards.

**Warnings:**

- History rewriting has the potential of being destructive - make a local backup of your project folder, along with its `.git` folder, so you can recover from any incorrect commands.
- Other people who have cloned or forked your repository will not have their copy fixed with `git pull`, they will also need to do some manual work (not covered here).

We'll start the interactive rebase, looking back 3 commits this time, but because it includes the first commit we need to use `--root` instead of `HEAD~3`:

```bash
git rebase -i --root
```

This will again open your CLI editor (`$EDITOR`), with the truncated contents:

```text
pick 4dc005b Aded homepage
pick 67b43d4 Added stylesheet
pick 82c8f91 Added JavaScript

# Rebase 82c8f91 onto 0299017 (3 commands)
```

We want to perform the "reword" command on the `4dc005b` commit, so change the contents to:

```text
reword 4dc005b Aded homepage
pick 67b43d4 Added stylesheet
pick 82c8f91 Added JavaScript
```

Again save the file and exit. A new editor will open with the contents:

```text
Aded homepage

# Please enter the commit message for your changes. Lines starting
# with '#' will be ignored, and an empty message aborts the commit.
#
# Date:      Sat Dec 5 15:37:30 2020 -0500
#
# interactive rebase in progress; onto 0299017
# Last command done (1 command done):
#    reword 4dc005b Aded homepage
# Next commands to do (2 remaining commands):
#    pick 67b43d4 Added stylesheet
#    pick 82c8f91 Added JavaScript
# You are currently editing a commit while rebasing branch 'master' on '0299017'.
#
#
# Initial commit
#
# Changes to be committed:
#       new file:   index.html
#
```

Change "Aded" to "Added", then save and exit the editor. This will rewrite the first commit and all commits after it, as evidenced by the different commit hashes:

```shell
$ git log --oneline
a336c67 (HEAD -> master) Added JavaScript
9a5def0 Added stylesheet
137cf38 Added homepage
```

Note that `origin/master` has disappeared, indicating our local repository has completely diverged from remote.

Because we've edited a commit that was already pushed, we need to "force push" our local branch, overwriting the remote repository history:

```bash
git push --force
```

We can validate that the operation was successful if `origin/master` is on the most recent commit here:

```shell
$ git log --oneline
a336c67 (HEAD -> master, origin/master) Added JavaScript
9a5def0 Added stylesheet
137cf38 Added homepage
```
