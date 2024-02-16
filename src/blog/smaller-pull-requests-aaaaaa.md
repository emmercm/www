---

title: Smaller Pull Requests Reduce Cycle Time
image: https://unsplash.com/photos/Iqwlfc1cnnw
draft: true
tags:
- career
- github

---

Alternative titles:

- merge early, merge often
- release early, release often

Large pull requests put an unnecessary cognitive load on code reviewers which will inevitably lead to longer review cycle times.

**Example scenario:** we run an e-commerce store that only operates in the US and only takes USD as payment. We want to support other currencies as we expand our business.

splitting up: contract changes (proto, model, etc.), repository / volatile dependency changes, service changes, DB/migration changes

> "You know the joke--what's the plural of 'developer'?" says Maxine. "A 'merge conflict.'"
>
> -The Unicorn Project (p. 158)
