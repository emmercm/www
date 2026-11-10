---

title: Generating v7 UUIDs in MySQL
date: 2026-11-10T04:26:00
tags:
- databases
- mysql

---

MySQL's [`UUID()`](https://dev.mysql.com/doc/refman/8.4/en/miscellaneous-functions.html#function_uuid) function generates [v1 UUIDs](https://en.wikipedia.org/wiki/Universally_unique_identifier#Versions_1_and_6_(date%E2%80%93time_and_node_ID)), which are time-based, but not time-ordered. We can define our own function to generate [v7 UUIDs](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_7_(timestamp_and_random)), which are more appropriate for primary keys.

Check out "[Why You Should Use UUIDs for Your Primary Keys](/blog/why-you-should-use-uuids-for-your-primary-keys)" for a reason to use UUIDs in databases, and "[Generating v4 UUIDs in MySQL](/blog/generating-v4-uuids-in-mysql)" for a fully random alternative.

## A custom `uuid_v7()` function

Here's the function, with comments explaining each group:

```sql
CREATE FUNCTION uuid_v7() RETURNS CHAR(36)
    NOT DETERMINISTIC
    NO SQL
BEGIN
    -- 10 random bytes = 20 random hex characters, generated all at once
    DECLARE r CHAR(20) DEFAULT HEX(RANDOM_BYTES(10));

    -- 48-bit Unix timestamp in milliseconds = 12 characters = 6 bytes
    DECLARE ts CHAR(12) DEFAULT LPAD(HEX(FLOOR(UNIX_TIMESTAMP(SYSDATE(3)) * 1000)), 12, '0');

    -- 1st group is 8 characters = 4 bytes, the first part of the timestamp
    DECLARE g1 CHAR(8) DEFAULT SUBSTR(ts, 1, 8);

    -- 2nd group is 4 characters = 2 bytes, the rest of the timestamp
    DECLARE g2 CHAR(4) DEFAULT SUBSTR(ts, 9, 4);

    -- 3rd group is 4 characters = 2 bytes, starting with a: 7
    DECLARE g3 CHAR(4) DEFAULT CONCAT('7', SUBSTR(r, 1, 3));

    -- 4th group is 4 characters = 2 bytes, starting with a: 8, 9, A, or B
    DECLARE g4 CHAR(4) DEFAULT CONCAT(HEX(CONV(SUBSTR(r, 4, 1), 16, 10) & 3 | 8), SUBSTR(r, 5, 3));

    -- 5th group is 12 characters = 6 bytes
    DECLARE g5 CHAR(12) DEFAULT SUBSTR(r, 8, 12);

    RETURN LOWER(CONCAT(g1, '-', g2, '-', g3, '-', g4, '-', g5));
END;
```

This generates all the random bytes with a single call to [`RANDOM_BYTES()`](https://dev.mysql.com/doc/refman/8.4/en/encryption-functions.html#function_random-bytes), rather than one call per group, and then splits them up. It uses [local variables](https://dev.mysql.com/doc/refman/8.4/en/declare-local-variable.html), which are cheaper than `@` [user-defined variables](https://dev.mysql.com/doc/refman/8.4/en/user-variables.html), and they don't leak into the caller's session.

Here's a version with only one variable, to remove any overhead the others might add. It uses [`INSERT()`](https://dev.mysql.com/doc/refman/8.4/en/string-functions.html#function_insert) to add the first hyphen into the timestamp, so that the timestamp only has to be calculated once:

```sql
CREATE FUNCTION uuid_v7() RETURNS CHAR(36)
    NOT DETERMINISTIC
    NO SQL
BEGIN
    DECLARE r CHAR(20) DEFAULT HEX(RANDOM_BYTES(10));
    RETURN LOWER(CONCAT(
            INSERT(LPAD(HEX(FLOOR(UNIX_TIMESTAMP(SYSDATE(3)) * 1000)), 12, '0'), 9, 0, '-'),
            '-7', SUBSTR(r, 1, 3),
            '-', HEX(CONV(SUBSTR(r, 4, 1), 16, 10) & 3 | 8), SUBSTR(r, 5, 3),
            '-', SUBSTR(r, 8, 12)
        ));
END;
```

A few notes on the timestamp:

- This uses [`SYSDATE()`](https://dev.mysql.com/doc/refman/8.4/en/date-and-time-functions.html#function_sysdate) instead of [`NOW()`](https://dev.mysql.com/doc/refman/8.4/en/date-and-time-functions.html#function_now) because `NOW()` returns the time the _statement_ started, so every row in a multi-row `INSERT` would get the same timestamp. `SYSDATE()` returns the time the function actually executes.
- The `3` passed to `SYSDATE(3)` requests millisecond precision, which [`UNIX_TIMESTAMP()`](https://dev.mysql.com/doc/refman/8.4/en/date-and-time-functions.html#function_unix-timestamp) preserves as a decimal. Multiplying by 1,000 and flooring gives an integer number of milliseconds.

MariaDB doesn't have `RANDOM_BYTES()`, but [MariaDB v11.7.0 (2024)](https://mariadb.com/docs/release-notes/community-server/old-releases/11.7/11.7.0) added a native `UUID_v7()` function, so you don't need any of this.

## Putting it all together

Here's an example where a table `users` uses UUIDs for its primary key. Using `CHAR(36)` simplifies this example, but see "[Making UUIDs More Performant in MySQL](/blog/making-uuids-more-performant-in-mysql)" for why you don't want to use strings for performance reasons. Note that because v7 UUIDs are already time-ordered, you _don't_ want to use the `swap_flag` option of [`UUID_TO_BIN()`](https://dev.mysql.com/doc/refman/8.4/en/miscellaneous-functions.html#function_uuid-to-bin) with them, as that's specifically for rearranging v1 UUIDs.

```sql
CREATE TABLE users
(
    id   CHAR(36)     NOT NULL,
    name VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
);

INSERT INTO users (id, name) VALUE (uuid_v7(), 'Tanya Reilly');
INSERT INTO users (id, name) VALUE (uuid_v7(), 'Charity Majors');
INSERT INTO users (id, name) VALUE (uuid_v7(), 'Camille Fournier');

SELECT *
FROM users
ORDER BY id;
```

If everything went well, at the end you should have table contents similar to the following, sorted in the order the rows were inserted:

```text
+--------------------------------------+------------------+
| id                                   | name             |
+--------------------------------------+------------------+
| 01a1c3c4-b3e4-7c2e-9d4f-3b8e1f6a2c07 | Tanya Reilly     |
| 01a1c3c4-b3e4-74b1-a6e2-c90d7f15e8b3 | Charity Majors   |
| 01a1c3c4-b3e4-7f08-8b71-52e4ad9c06f1 | Camille Fournier |
+--------------------------------------+------------------+
```

## Why choose v7?

InnoDB is the default storage engine for MySQL, so it's probably what your tables are using. InnoDB uses a [clustered index](https://dev.mysql.com/doc/refman/8.4/en/innodb-index-types.html), which means data is stored on disk in primary key order. Most tables use a monotonically increasing `AUTO_INCREMENT` primary key, causing `INSERT`s to always append to the end of the clustered index.

[v4 UUIDs](/blog/generating-v4-uuids-in-mysql) are completely random, which makes them a poor choice for clustered indexes because `INSERT`s will land on random pages, which:

- Has a high chance of causing page splits and therefore fragmentation because of the default [`innodb_fill_factor`](https://dev.mysql.com/doc/refman/8.4/en/innodb-physical-structure.html) setting of `100`(%).
- Has a high chance of [buffer pool](https://dev.mysql.com/doc/refman/8.4/en/innodb-buffer-pool.html) misses, requiring data to be read from disk.

v7 UUIDs alleviate these issues by being time-ordered (though not strictly monotonically increasing). v7 UUIDs are only required to have millisecond precision, though, so not every `INSERT` is guaranteed to be an append if there are multiple at the same time.
