---

title: Deferrable Constraints in PostgreSQL
date: 2022-06-19T18:48:00
tags:
- databases
- postgres

---

Constraints in PostgreSQL are validated immediately row-by-row by default, which might be confusing when updating multiple values in columns that have a uniqueness constraint.

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

## Immediate vs. deferred

[Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html) are `NOT DEFERRABLE INITIALLY IMMEDIATE` by default in PostgreSQL.

- `INITIALLY IMMEDIATE` means that the constraint is being validated after _each_ row is updated individually by default.
- `NOT DEFERRABLE` means we _can't_ change this setting in a transaction.

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

When a constraint is `DEFERRED` it is not validated until the transaction commits. A constraint can be `DEFERRED` two different ways:

- The constraint can be created as `INITIALLY DEFERRED` which will set the constraint to `DEFERRED` by default.
- The constraint can be temporarily `DEFERRED` with one of these statements, but only if it is `DEFERRABLE`:

    ```sql
    SET CONSTRAINTS numbers_number_key DEFERRED;

    SET CONSTRAINTS ALL DEFERRED;
    ```

## Changing the constraint

[PostgreSQL v9.4 (2014)](https://www.postgresql.org/docs/9.4/release-9-4.html) added the ability to execute `ALTER TABLE <name> ALTER CONSTRAINT <setting>;`. Let's try changing the existing constraint on our table:

```sql
ALTER TABLE numbers
    ALTER CONSTRAINT numbers_number_key DEFERRABLE;
-- ERROR:  constraint "numbers_number_key" of relation "numbers" is not a foreign key constraint
```

We got an unhelpful error! That's because buried under `ALTER CONSTRAINT` in the [`ALTER TABLE` documentation](https://www.postgresql.org/docs/14/sql-altertable.html) we can find:

> Currently only foreign key constraints may be altered.

Which means we have to drop the constraint entirely and recreate it, but thankfully we can do that in one statement:

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

This gives us three different combinations of settings we can create constraints with:

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

    Constraints are validated at transaction commit time and this setting can change per transaction. This is the setting we used above in our example.

## Use cases

There are quite a few reasons why you might want deferrable constraints, but not all the reasons follow traditional best practices.

### Position / weight / priority columns

One reason to have a unique constraint on a single numeric column like we have above is so those rows can remember a human-sorted order. Imagine a to-do list application where you can drag and drop items, prioritizing them by due date or importance.

Re-ordering of items here is only possible because of deferred constraints:

```sql
CREATE TABLE todo_items
(
    id       SERIAL PRIMARY KEY,
    task     VARCHAR NOT NULL,
    priority INTEGER NOT NULL,
    UNIQUE (priority) DEFERRABLE INITIALLY DEFERRED
);

-- Insert two to-do items
INSERT INTO todo_items (task, priority)
VALUES ('Clean the bathroom', 1)
     , ('Go grocery shopping', 2);

-- Swap the order of the two to-do items

BEGIN;
UPDATE todo_items SET priority = 2 WHERE task = 'Clean the bathroom';
UPDATE todo_items SET priority = 1 WHERE task = 'Go grocery shopping';
COMMIT;
```

### Creating a circular reference between two tables

I think this is a terrible idea and that you shouldn't do it, but maybe you have a valid use case or you inherited the situation. Here are some inserts in a transaction that only work because the foreign key constraints are deferred:

```sql
CREATE TABLE manufacturers
(
    name                VARCHAR PRIMARY KEY,
    flagship_phone_name VARCHAR NOT NULL
);

CREATE TABLE phones
(
    name              VARCHAR PRIMARY KEY,
    manufacturer_name VARCHAR NOT NULL REFERENCES manufacturers (name) DEFERRABLE INITIALLY DEFERRED
);

-- Add a circular foreign key reference

ALTER TABLE manufacturers
    ADD CONSTRAINT manufacturers_latest_phone_id_fkey FOREIGN KEY (flagship_phone_name) REFERENCES phones (name) DEFERRABLE INITIALLY DEFERRED;

-- Insert some circularly-linked rows

BEGIN;

INSERT INTO manufacturers (name, flagship_phone_name)
VALUES ('Google', 'Pixel 6 Pro')
     , ('Apple', 'iPhone 13 Pro Max')
     , ('Samsung', 'Galaxy S22 Ultra');

INSERT INTO phones (manufacturer_name, name)
VALUES ('Google', 'Pixel 6')
     , ('Google', 'Pixel 6 Pro')
     , ('Apple', 'iPhone 13 Pro')
     , ('Apple', 'iPhone 13 Pro Max')
     , ('Samsung', 'Galaxy S22')
     , ('Samsung', 'Galaxy S22 Ultra');

COMMIT;
```

### Data ingestion, or manual data restore

If you have a data file of SQL statements that aren't in an order that satisfies constraints (e.g. a plaintext [`pg_dump`](https://www.postgresql.org/docs/current/app-pgdump.html) output), it might make sense to defer all constraints in your transaction.

In this case it might make sense to use `DEFERRABLE INITIALLY IMMEDIATE` constraints, but those have the same performance hits as `DEFERRABLE INITIALLY DEFERRED` described below, so you might as well go all or nothing.

Here is an example that only works because the foreign key constraint is deferred:

```sql
CREATE TABLE authors
(
    id   SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL
);

CREATE TABLE books
(
    id        SERIAL PRIMARY KEY,
    author_id INTEGER NOT NULL REFERENCES authors (id) DEFERRABLE INITIALLY DEFERRED,
    title     VARCHAR NOT NULL
);

-- Insert some rows from a data file, temporarily ignoring references between tables

BEGIN;

INSERT INTO books
VALUES (1, 1, 'All Summer in a Day')
     , (2, 1, 'The Martian Chronicles')
     , (3, 2, 'Starship Troopers')
     , (4, 2, 'Stranger in a Strange Land');

INSERT INTO authors
VALUES (1, 'Ray Bradbury')
     , (2, 'Robert A. Heinlein');

COMMIT;
```

Just remember to reset the "start" value of your primary key sequences after a data load like that.

### Deleting some rows out of order

Rather than using the potentially dangerous `ON DELETE CASCADE`, you can use deferrable constraints to let you delete rows from a series of tables in a forgiving order. This could be useful when tearing down stubbed data in an integration test.

```sql
CREATE TABLE countries
(
iso2 CHAR(2) PRIMARY KEY,
name VARCHAR NOT NULL
);

CREATE TABLE cities
(
id           SERIAL PRIMARY KEY,
country_iso2 CHAR(2) NOT NULL REFERENCES countries (iso2) DEFERRABLE INITIALLY DEFERRED,
name         VARCHAR NOT NULL
);

-- Insert some rows with references

INSERT INTO countries (iso2, name)
VALUES ('IS', 'Iceland')
, ('NZ', 'New Zealand');

INSERT INTO cities (country_iso2, name)
VALUES ('IS', 'Reykjavík')
, ('IS', 'Akureyri')
, ('NZ', 'Christchurch')
, ('NZ', 'Queenstown');

-- Delete some rows in an order that temporarily violates the foreign key constraint

BEGIN;
DELETE FROM countries WHERE iso2 = 'NZ';
DELETE FROM cities WHERE country_iso2 = 'NZ';
COMMIT;
```

## Performance considerations

Deferrable constraints seem great, why aren't they the default? Or why shouldn't I make all of my constraints as `INITIALLY DEFERRED`? There are a few reasons:

**Deferrable unique indexes allow a moment in time when there are duplicate values.** This negatively affects what optimizations the query planner can make, as it can no longer know the uniqueness constraint is satisfied at absolutely every point in time. Joe Nelson has a more complete explanation in his [blog post](https://begriffs.com/posts/2017-08-27-deferrable-sql-constraints.html#query-planner-performance-penalty).

This [Hashrocket article](https://hashrocket.com/blog/posts/deferring-database-constraints) talks about a unique column used for sorting items, and that's the exact use I have which led me down this rabbit hole. In this case the position / weight / priority column won't be joined on so it won't take this optimization hit.
