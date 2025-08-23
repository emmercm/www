---

title: Pin Your GitHub Actions to Protect Against Mutability
draft: true

---

Pinning third-party GitHub Actions to a commit SHA helps protect you against supply chain attacks.

If you've written a GitHub Actions workflow before then you've probably used a third-party action (an action that lives in another repository other than your own). Even GitHub-published [`actions/checkout`](https://github.com/actions/checkout) is c

- https://docs.github.com/en/actions/reference/security/secure-use#using-third-party-actions
- https://semgrep.dev/blog/2025/popular-github-action-tj-actionschanged-files-is-compromised/
- https://github.com/open-telemetry/sig-security/issues/69#issuecomment-2730078977

Limitations:

- Digest pinning doesn't mean 100% safety if you automate version updates
	- It prevents tag redirection: https://semgrep.dev/blog/2025/popular-github-action-tj-actionschanged-files-is-compromised/
	- Mitigated by holding back updates for a time period?
	- Writing out the full version would do something similar as using the digest hash
<!--stackedit_data:
eyJoaXN0b3J5IjpbOTk5MDMwNDYyLDkwOTkxNDc0OSwxMDIzNj
M4ODM3XX0=
-->