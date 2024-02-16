---

title: Disabling Foreign Key Integrity Checks in PostgreSQL
draft: true

---

```text
alter table t1 disable trigger all;
vs.
set constraints all deferred
vs.
set session_replication_role to replica
```
