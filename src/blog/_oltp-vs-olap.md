---

title: OLTP vs. OLAP
draft: true

---

Software Architecture: The Hard Parts (p. 4)

> Operational data: data used for the operation of business, including sales, transactional data, inventory, and so on. This data is what the company runs on--if something interrupts this data, the organization cannot function for very long. This type of data is defined as _Online Transactional Processing_ (OLTP), which typically involves inserting, updating, and deleting data in a database.

> Analytical data: data used by data scientists and toehr business analysts for predictions, trending, and other business intelligence. This data is typically not transactional and often not relational--it may be ina. graph database or snapshots in a different format than its original transactional form. This data isn't critical for the day-to-day operation but rather for the long-term strategic direction and decisions.
<!--stackedit_data:
eyJoaXN0b3J5IjpbLTU5MTg3NzM1MF19
-->