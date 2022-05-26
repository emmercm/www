---

title: Deferrable Constraints in PostgreSQL
date: 2022-05-26T23:48:00
tags:
- postgres

---

Constraints in PostgreSQL are validated immediately by default, which might be confusing when updating multiple values in columns that have a uniqueness constraint.

Consider this contrived scenario of one table with one column that has a uniqueness constraint:

```sql
CREATE TABLE numbers
(
    number INT,
    UNIQUE (number)
);

INSERT INTO numbers
VALUES (1)
     , (2);
```

If we try to update every row in the table, incrementing the value by 1, we run into a problem:

```sql
UPDATE numbers
SET number = number + 1;
-- ERROR:  duplicate key value violates unique constraint "numbers_number_key"
-- DETAIL:  Key (number)=(2) already exists.
```

## `IMMEDIATE` vs. `DEFERRED`

[Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html) are `NOT DEFERRABLE INITIALLY IMMEDIATE` by default in PostgreSQL.

- `INITIALLY IMMEDIATE` means that the constraint is being validated after _each_ row is updated individually by default
- `NOT DEFERRABLE` means we _can't_ change this setting in a transaction

We can see every constraint in our database with this query:

```sql
SELECT ns.nspname        AS schema
     , class.relname     AS "table"
     , con.conname       AS "constraint"
     , con.condeferrable AS "deferrable"
     , con.condeferred   AS deferred
FROM pg_constraint con
         INNER JOIN pg_class class ON class.oid = con.conrelid
         INNER JOIN pg_namespace ns ON ns.oid = class.relnamespace
WHERE con.contype IN ('p', 'u')
  AND ns.nspname != 'pg_catalog'
ORDER BY 1, 2, 3;
```

And we can see that indeed the unique constraint is `NOT DEFERRABLE` (`deferrable = false`) and `INITIALLY IMMEDIATE` (`deferred = false`):

```text
 schema |  table  |     constraint     | deferrable | deferred
--------+---------+--------------------+------------+----------
 public | numbers | numbers_number_key | f          | f
```

When a constraint is `DEFERRED` it is not validated until transaction commit. A constraint can be `DEFERRED` two different ways:

- The constraint can be created as `DEFERRABLE INITIALLY DEFERRED` which will set the constraint to `DEFERRED` by default
- The constraint can be temporarily `DEFERRED` with `SET CONSTRAINTS <name> DEFERRED;`, but only if it is `DEFERRABLE`

## Changing the constraint

[PostgreSQL v9.4 (2014)](https://www.postgresql.org/docs/9.4/release-9-4.html) added the ability to execute `ALTER TABLE <name> ALTER CONSTRAINT <setting>;`. Let's try changing the existing constraint on our table:

```sql
ALTER TABLE numbers
    ALTER CONSTRAINT numbers_number_key DEFERRABLE;
-- ERROR:  constraint "numbers_number_key" of relation "numbers" is not a foreign key constraint
```

We got an unhelpful error! That's because buried under `ALTER CONSTRAINT` in the [`ALTER TABLE` documentation](https://www.postgresql.org/docs/14/sql-altertable.html) we can find:

> Currently only foreign key constraints may be altered.

Which means we have to drop the constraint entirely and recreate it:

```sql
ALTER TABLE numbers
    DROP CONSTRAINT numbers_number_key,
    ADD CONSTRAINT numbers_number_key UNIQUE (number) DEFERRABLE INITIALLY DEFERRED;
```

And if we try that `UPDATE` statement again we can see it now succeeds:

```sql
UPDATE numbers
SET number = number + 1;

SELECT *
FROM numbers;
```

```text
 number
--------
      2
      3
```

## The three constraint settings

Under the [`ALTER TABLE` documentation](https://www.postgresql.org/docs/current/sql-altertable.html) synopsis we can see that the legal syntax for `ALTER TABLE name ALTER CONSTRAINT` is:

> `ALTER CONSTRAINT constraint_name [ DEFERRABLE | NOT DEFERRABLE ] [ INITIALLY DEFERRED | INITIALLY IMMEDIATE ]`

This gives us three different combination of settings we can create constraints with:

1. **`NOT DEFERRABLE [INITIALLY IMMEDIATE]` (default)**

    Constraints are validated immediately and this setting can't change per transaction. This is the default for both primary keys and unique indexes.

2. **`DEFERRABLE [INITIALLY IMMEDIATE]`**

    ```sql
    CREATE TABLE numbers
    (
        number INT,
        UNIQUE (number) DEFERRABLE INITIALLY IMMEDIATE
    );
    ```

    Constraints are validated immediately, but this setting can change per transaction. I would not recommend this setting as I consider per-connection, per-transaction, and per-query settings an anti-pattern that are likely covering up a root issue.

3. **`[DEFERRABLE] INITIALLY DEFERRED`**

    ```sql
    CREATE TABLE numbers
    (
        number INT,
        UNIQUE (number) DEFERRABLE INITIALLY DEFERRED
    );
    ```

    Constraints are validated at transaction commit and this setting can change per transaction. This is the setting we used above in our example.

## Use cases

In addition to the above example where a unique column might have a conflict during a transaction but not at the end, some other use cases for deferrable constraints are:

- **Creating a circular reference between two tables.**

    I think this is a terrible idea and that you shouldn't do it, but maybe you have a good reason. Here are some inserts in a transaction that only work because the foreign key constraints are deferred:

    ```sql
    CREATE TABLE manufacturers
    (
        name            VARCHAR PRIMARY KEY,
        latest_phone_id VARCHAR NOT NULL
    );

    CREATE TABLE phones
    (
        model             VARCHAR PRIMARY KEY,
        manufacturer_name VARCHAR NOT NULL REFERENCES manufacturers (name) DEFERRABLE INITIALLY DEFERRED,
        name              VARCHAR NOT NULL
    );

    ALTER TABLE manufacturers
        ADD CONSTRAINT manufacturers_latest_phone_id_fkey FOREIGN KEY (latest_phone_id) REFERENCES phones (model) DEFERRABLE INITIALLY DEFERRED;

    BEGIN;

    INSERT INTO manufacturers (name, latest_phone_id)
    VALUES ('Google', 'GF5KQ')
         , ('Apple', 'A2484')
         , ('Samsung', 'SM-S908U');

    INSERT INTO phones (model, manufacturer_name, name)
    VALUES ('GR1YH', 'Google', 'Pixel 6')
         , ('GF5KQ', 'Google', 'Pixel 6 Pro')
         , ('A2483', 'Apple', 'iPhone 13 Pro')
         , ('A2484', 'Apple', 'iPhone 13 Pro Max')
         , ('SM-S901U', 'Samsung', 'Galaxy S22')
         , ('SM-S908U', 'Samsung', 'Galaxy S22 Ultra');

    COMMIT;
    ```
