---

title: Syncing Changes Between Git Working Trees
draft: true
tags:
- git

---

How to sync uncommitted changes between two different working trees of the same repository.

I've been experimenting with using [Git sparse checkout](https://git-scm.com/docs/git-sparse-checkout) with a very large monorepo recently. I usually have a number of changed files that aren't ready to commit just yet in my working tree, so I wanted to create a new working tree to experiment with until I was happy first. Once I was happy, I wanted to copy all my in-flight changes over
<!--stackedit_data:
eyJoaXN0b3J5IjpbLTEwNjIyODE2NjhdfQ==
-->