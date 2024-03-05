---

title: Avoiding Blind UPDATE Statements
draft: true
tags:
- databases

---

```sql
BEGIN;

-- UPDATE here

ROLLBACK;
-- COMMIT;
```

And also this could be cultural, do you rollback bad deploys?
