---

title: Copying Files from One Git Branch to Another
draft: true

---

```text
https://jasonrudolph.com/blog/2009/02/25/git-tip-how-to-merge-specific-files-from-another-branch/
https://stackoverflow.com/questions/8964666/how-do-i-find-a-list-of-files-committed-to-a-branch/18768748
```

```shell
git diff master...new-branch --name-status
git --no-pager diff master...emmercm/trigger-properties-consolidation --name-status
```
