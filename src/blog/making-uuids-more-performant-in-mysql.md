---

title: Making UUIDs More Performant in MySQL
date: 2020-11-14T19:46:00
tags:
- databases

---

MySQL does not have a native UUID type, so strings are often used instead, which come with large storage and performance costs.

## UUIDs can take a lot of storage

Storing 36 characters, in an InnoDB table with a default `utf8mb4` character set, is a lot of storage space:

- `CHAR(36)` is always `36 x 4 = 144 bytes`
- `VARCHAR(36)` would be `36 x 4 + 1 = 145 bytes`
- `VARCHAR(255)` would be `36 x 4 + 2 = 146 bytes`

But storage is cheap, so why do we care?

Let's say we want to index our string UUID column, because it's probably an ID we'll use for lookups or joins. A larger column size means a larger index size, which means more difficulty fitting it in working memory, which means slower lookups.

It's even worse if we use a string UUID for our primary key (see: "[Why You Should Use UUIDs for Your Primary Keys](/blog/why-you-should-use-uuids-for-your-primary-keys)"). Every other secondary index on that table has to store the primary key with it, which means larger indexes for everything, again impacting performance.

UUIDs are supposed to be only 16 bytes, so can't we do better?

## Binary UUID columns

If we strip the hyphens and convert the remaining 32 characters to `BINARY`, we can store it in only 16 bytes.

The `BINARY` type isn't affected by the table character set (such as `utf8mb4`), it uses the `binary` character set and collation. Even better, comparison and sorting will use the numeric value of the column, which will perform much better.

All versions of MySQL can use [`UNHEX()`](https://dev.mysql.com/doc/refman/5.7/en/string-functions.html#function_unhex) and [`REPLACE()`](https://dev.mysql.com/doc/refman/5.7/en/string-functions.html#function_replace) to do this:

```sql
SELECT UNHEX(REPLACE("f7c26694-aac6-4333-91c9-72c4441430e2", "-", "")) AS unhex_replace;
```

```text
+------------------------------------+
| unhex_replace                      |
+------------------------------------+
| 0xF7C26694AAC6433391C972C4441430E2 |
+------------------------------------+
```

MySQL v8.0.0 (2016) added the function [`UUID_TO_BIN()`](https://dev.mysql.com/doc/refman/8.0/en/miscellaneous-functions.html#function_uuid-to-bin) which does the same thing:

```sql
SELECT uuid_to_bin("f7c26694-aac6-4333-91c9-72c4441430e2") AS uuid_bin;
```

```text
+------------------------------------+
| uuid_bin                           |
+------------------------------------+
| 0xF7C26694AAC6433391C972C4441430E2 |
+------------------------------------+
```

And it's easy to perform the reverse here:

```sql
SELECT lower(insert(insert(insert(insert(
         hex(0xF7C26694AAC6433391C972C4441430E2)
         , 9, 0, '-'), 14, 0, '-'), 19, 0, '-'), 24, 0, '-')
       ) AS lower_insert_hex
     , bin_to_uuid(0xF7C26694AAC6433391C972C4441430E2) AS bin_uuid;
```

```text
+--------------------------------------+--------------------------------------+
| lower_insert_hex                     | bin_uuid                             |
+--------------------------------------+--------------------------------------+
| f7c26694-aac6-4333-91c9-72c4441430e2 | f7c26694-aac6-4333-91c9-72c4441430e2 |
+--------------------------------------+--------------------------------------+
```

## Putting it all together

Here's an example where a table `users` uses binary UUIDs for its primary key:

```sql
CREATE TABLE users
(
    id   BINARY(16)   NOT NULL,
    name VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
);

INSERT INTO users (id, name)
VALUES (uuid_to_bin(uuid()), 'Larry Page')
     , (uuid_to_bin(uuid()), 'Sergey Brin');

SELECT bin_to_uuid(id) AS id
     , name
FROM users;
```

If everything went well, at the end you should have table contents similar to:

```text
+--------------------------------------+-------------+
| id                                   | name        |
+--------------------------------------+-------------+
| cf2dc9ef-26b0-11eb-a894-0242ac110003 | Larry Page  |
| cf2dcd93-26b0-11eb-a894-0242ac110003 | Sergey Brin |
+--------------------------------------+-------------+
```

See "[Generating v4 UUIDs in MySQL](/blog/generating-v4-uuids-in-mysql)" for a way to generate potentially more desirable UUIDs.
