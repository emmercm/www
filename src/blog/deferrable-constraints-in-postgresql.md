---

title: Deferrable Constraints in PostgreSQL
date: 2022-05-26T21:42:00
tags:
- postgres

---

Constraints in PostgreSQL are validated immediately by default, which might be confusing when updating columns in multiple rows that have a uniqueness constraint.

Consider this contrived scenario of one table with one column that has a uniqueness constraint (via primary key):

```sql
CREATE TABLE numbers
(
    number SERIAL PRIMARY KEY
);

INSERT INTO numbers
VALUES (1)
     , (2);
```

If we try to update every row in the table, incrementing the value by 1, we run into a problem:

```sql
UPDATE numbers
SET number = number + 1;
-- ERROR:  duplicate key value violates unique constraint "numbers_pkey"
-- DETAIL:  Key (number)=(2) already exists.
```

## `IMMEDIATE` vs. `DEFERRED`

Constraints are `NOT DEFERRABLE INITIALLY IMMEDIATE` by default in PostgreSQL.

- `INITIALLY IMMEDIATE` means that the constraint is being validated after each row is updated individually by default
- `NOT DEFERRABLE` means we can't change this setting in a transaction

We can see every constraint in our database with this query:

```sql
SELECT ns.nspname        AS schema
     , class.relname     AS "table"
     , con.conname       AS "constraint"
     , con.condeferrable AS "deferrable"
     , con.condeferred   AS deferred
FROM pg_catalog.pg_constraint con
         INNER JOIN pg_catalog.pg_class class ON class.oid = con.conrelid
         INNER JOIN pg_namespace ns ON ns.oid = class.relnamespace
WHERE con.contype IN ('p', 'u')
  AND ns.nspname != 'pg_catalog'
ORDER BY 1, 2, 3;
```

And we can see that indeed the primary key constraint is `NOT DEFERRABLE INITIALLY IMMEDIATE`:

```text
 schema |  table  |  constraint  | deferrable | deferred
--------+---------+--------------+------------+----------
 public | numbers | numbers_pkey | f          | f
```

When a constraint is `DEFERRED` it is not checked until transaction commit time. A constraint can be `DEFERRED` two different ways:

- The constraint can be created as `DEFERRABLE INITIALLY DEFERRED` which will set the constraint to `DEFERRED` by default
- The constraint can be temporarily `DEFERRED` with `SET CONSTRAINTS <name> DEFERRED`, but only if it is `DEFERRABLE`

## Changing the constraint

[PostgreSQL v9.4 (2014)](https://www.postgresql.org/docs/9.4/release-9-4.html) added the ability to execute `ALTER TABLE <name> ALTER CONSTRAINT`. Let's try changing the existing constraint on our table:

```sql
ALTER TABLE numbers
    ALTER CONSTRAINT numbers_pkey DEFERRABLE;
-- ERROR:  CONSTRAINT "numbers_pkey" OF relation "numbers" IS NOT a FOREIGN KEY CONSTRAINT
```

We got an unhelpful error! That's because buried under `ALTER CONSTRAINT` in the [`ALTER TABLE` documentation](https://www.postgresql.org/docs/14/sql-altertable.html) we can find:

> Currently only foreign key constraints may be altered.

Which means we have to drop the constraint entirely and recreate it:

```sql
ALTER TABLE numbers
    DROP CONSTRAINT numbers_pkey,
    ADD PRIMARY KEY (number) DEFERRABLE;
```

And if we try that `UPDATE` statement again we can see it works:

```sql
UPDATE numbers
SET number = number + 1;

SELECT *
FROM numbers;
```

```text
 number
--------
      1
      2
```

## The three constraint settings

Under the [`ALTER TABLE` documentation](https://www.postgresql.org/docs/current/sql-altertable.html) synopsis we can see that the legal syntax for `ALTER TABLE name ALTER CONSTRAINT` is:

> `ALTER CONSTRAINT constraint_name [ DEFERRABLE | NOT DEFERRABLE ] [ INITIALLY DEFERRED | INITIALLY IMMEDIATE ]`

This gives us three different combination of settings we can create constraints with:

1. **`NOT DEFERRABLE [INITIALLY IMMEDIATE]` (default)**

    Constraints are validated immediately, and this setting can't change per transaction. This is the default for both primary keys and unique indexes.

2. **`DEFERRABLE INITIALLY IMMEDIATE`**

    Constraints are validated immediately, but this setting can change per transaction. I would not recommend this setting as I consider per-connection, per-transaction, and per-query settings an anti-pattern that cover up a root issue.

3. **`DEFERRABLE [INITIALLY DEFERRED]`**

    Constraints are validated at transaction commit, and this setting can change per transaction. This is the setting we used above in our example.
