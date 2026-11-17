---

title: MySQL Transaction Isolation Levels

---

## `REPEATABLE READ` (default)

(Does not actually offer snapshot isolation? Per DDIA rev 2. The SQL standard "doesn't have the concept of snapshot isolation...based on System R's 1975 definition". Also because InnoDB can't detect lost updates like Postgres can)

## `READ COMMITTED`

## `READ UNCOMMITTED`

## `SERIALIZABLE`draft: true

---
<!--stackedit_data:
eyJoaXN0b3J5IjpbMTY2NzQ4MTYzOCwxODYwMjg5NzU0LDEwND
k4MTE2ODUsLTEzMTcwMzYxNTddfQ==
-->