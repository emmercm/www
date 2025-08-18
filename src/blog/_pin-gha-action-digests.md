---

title: Pin GitHub Actions Digests to ...
draft: true

---

- https://docs.github.com/en/actions/reference/security/secure-use#using-third-party-actions
- https://semgrep.dev/blog/2025/popular-github-action-tj-actionschanged-files-is-compromised/
- https://github.com/open-telemetry/sig-security/issues/69#issuecomment-2730078977

Limitations:

- Digest pinning doesn't mean 100% safety if you automate updates
	- It prevents tag redire
	- Mitigated by holding back updates for a time period?
	- Writing out the full version would do something similar as using the digest hash
<!--stackedit_data:
eyJoaXN0b3J5IjpbMTYyNDQzMTA3NV19
-->