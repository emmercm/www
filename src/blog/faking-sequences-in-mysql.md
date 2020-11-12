---

title: Faking Sequences in MySQL
date: 2020-11-12T03:21:00
tags:
- databases

---

MySQL doesn't have a concept of custom sequences that other databases such as PostgreSQL do, but they can be faked with a table and some clever queries.

Sequences are great because they let you rely on the ACID properties of databases to generate unique numbers, usually used in ID columns in tables. When you request the "next value" from a sequence, internally it will increment and return you the new value.

MySQL supports auto-incrementing keys, but only one column in a table can have the [`AUTO_INCREMENT`](https://dev.mysql.com/doc/refman/8.0/en/example-auto-increment.html) attribute. There exists esoteric use cases where you might want to have more than one column with auto-incrementing behavior. This behavior can be achieved with a special table and the [`last_insert_id()`](https://dev.mysql.com/doc/refman/8.0/en/information-functions.html#function_last-insert-id) function.

## Setup

First, let's start up a MySQL server instance with Docker. For ease of example we'll use the `root` user, but you'll want to think twice about doing this in production.

```bash
docker run --env MYSQL_ROOT_PASSWORD=password --detach mysql:8
```

Then, let's create our sequences table:

```sql
CREATE TABLE sequences
(
    name      VARCHAR(255)      NOT NULL,
    currval   BIGINT UNSIGNED   NOT NULL DEFAULT 0,
    increment SMALLINT UNSIGNED NOT NULL DEFAULT 1,
    PRIMARY KEY (name)
);
```

- `name` being how we'll reference created sequences
- `currval` to hold the most recently generated value
- `increment` to define a custom increment value

## Creating and deleting sequences

To create a new sequence, we'll `INSERT` a row into the table:

```sql
INSERT INTO sequences (name)
VALUES ('secondary_id');
```

To delete a sequence, we'll simply `DELETE` it from the table:

```sql
DELETE
FROM sequences
WHERE name = 'secondary_id';
```

## Getting the current value in a sequence

Knowing what the "current" (previously obtained) value in a sequence is as easy as `SELECT`ing it from the table:

```sql
SELECT currval
FROM sequences
WHERE name = 'secondary_id';
```

## Getting the next value in a sequence

Here's where the real magic happens. The most common use case with sequences is to request the "next" unused value, and with MySQL we have to do it in two statements within the same database connection:

```sql
UPDATE sequences
SET currval = last_insert_id(currval + increment)
WHERE name = 'secondary_id';

SELECT last_insert_id() AS currval;
```

Because MySQL doesn't have a `RETURNING` statement that other databases such as PostgreSQL do, we have to make use of manually setting our "last insert ID" by calling `last_insert_id()` with an argument.

Normally `last_insert_id()` without an argument will return the last `AUTO_INCREMENT` ID inserted in the same connection, but we can actually set it ourselves and then request it immediately following in the same database connection.

`last_insert_id()` is connection-dependent, so it's important to request it with the same connection and store it immediately so it's not lost. This is actually a good thing, it means concurrent writes from different clients won't cause issues.

## Putting it all together

Here's an example where a table `users` has a secondary ID column that we want to have auto-incrementing behavior, but the table already has `AUTO_INCREMENT` on the primary key.

```sql
CREATE TABLE users
(
    id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    secondary_id BIGINT UNSIGNED NOT NULL,
    name         VARCHAR(255)    NOT NULL,
    PRIMARY KEY (id)
);

INSERT INTO sequences (name, currval) VALUE ('users.secondary_id', 1000);

UPDATE sequences
SET currval = last_insert_id(currval + increment)
WHERE name = 'users.secondary_id';

INSERT INTO users (secondary_id, name) VALUE (last_insert_id(), 'Larry Ellison');

SELECT *
FROM users;
```

If everything went well, at the end you should have the table contents:

```text
+----+--------------+---------------+
| id | secondary_id | name          |
+----+--------------+---------------+
|  1 |         1001 | Larry Ellison |
+----+--------------+---------------+
```
