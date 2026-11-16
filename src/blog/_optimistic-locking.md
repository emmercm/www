---

title: Optimistic Concurrency Control

---

a.k.a. optimistic locking

e.g., using a monotonically increasing version field in DynamoDB

can't be used with multi-leader or leaderless replication because they cannot guarantee a single up-to-date copy of the data
<!--stackedit_data:
eyJoaXN0b3J5IjpbMTUwNDQ1ODg0OSwyMDA1Njk0NDE5XX0=
-->