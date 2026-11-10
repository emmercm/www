---

title: Generating v4 UUIDs in MySQL
date: 2020-11-13T22:43:00
updated: 2026-11-10T04:26:00
tags:
- databases
- mysql

---

MySQL's [`UUID()`](https://dev.mysql.com/doc/refman/8.0/en/miscellaneous-functions.html#function_uuid) function generates [v1 UUIDs](https://en.wikipedia.org/wiki/Universally_unique_identifier#Versions_1_and_6_(date%E2%80%93time_and_node_ID)), which have a time component that make them unevenly distributed over short periods of time.
We can define our own function to generate [v4 UUIDs](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)), which are random and therefore more evenly distributed.

Check out "[Generating v7 UUIDs in MySQL](/blog/generating-v7-uuids-in-mysql)" for a time-ordered alternative.

## A custom `uuid_v4()` function

Here's the function, with comments explaining each group:

```sql
CREATE FUNCTION uuid_v4() RETURNS CHAR(36)
    NOT DETERMINISTIC
    NO SQL
BEGIN
    -- 16 random bytes = 32 random hex characters, generated all at once
    DECLARE r CHAR(32) DEFAULT HEX(RANDOM_BYTES(16));

    -- 1st group is 8 characters = 4 bytes
    DECLARE g1 CHAR(8) DEFAULT SUBSTR(r, 1, 8);

    -- 2nd group is 4 characters = 2 bytes
    DECLARE g2 CHAR(4) DEFAULT SUBSTR(r, 9, 4);

    -- 3rd group is 4 characters = 2 bytes, starting with a: '4'
    DECLARE g3 CHAR(4) DEFAULT CONCAT('4', SUBSTR(r, 13, 3));

    -- 4th group is 4 characters = 2 bytes, starting with a: '8', '9', 'A', or 'B'
    DECLARE g4 CHAR(4) DEFAULT CONCAT(HEX(CONV(SUBSTR(r, 16, 1), 16, 10) & 3 | 8), SUBSTR(r, 17, 3));

    -- 5th group is 12 characters = 6 bytes
    DECLARE g5 CHAR(12) DEFAULT SUBSTR(r, 20, 12);

    RETURN LOWER(CONCAT(g1, '-', g2, '-', g3, '-', g4, '-', g5));
END;
```

This generates all the random bytes with a single call to `RANDOM_BYTES()`, rather than one call per group, and then splits them up. It uses [local variables](https://dev.mysql.com/doc/refman/8.0/en/declare-local-variable.html), which are cheaper than `@` [user-defined variables](https://dev.mysql.com/doc/refman/8.0/en/user-variables.html), and they don't leak into the caller's session.

Here's a version with only one variable, to remove any overhead the others might add:

```sql
CREATE FUNCTION uuid_v4() RETURNS CHAR(36)
    NOT DETERMINISTIC
    NO SQL
BEGIN
    DECLARE r CHAR(32) DEFAULT HEX(RANDOM_BYTES(16));
    RETURN LOWER(CONCAT(
            SUBSTR(r, 1, 8),
            '-', SUBSTR(r, 9, 4),
            '-4', SUBSTR(r, 13, 3),
            '-', HEX(CONV(SUBSTR(r, 16, 1), 16, 10) & 3 | 8), SUBSTR(r, 17, 3),
            '-', SUBSTR(r, 20, 12)
        ));
END;
```

This uses [`RANDOM_BYTES()`](https://dev.mysql.com/doc/refman/8.0/en/encryption-functions.html#function_random-bytes) instead of [`RAND()`](https://dev.mysql.com/doc/refman/8.0/en/mathematical-functions.html#function_rand) because the former is non-deterministic and therefore more cryptographically secure, resulting in fewer UUID collisions in the end.

MariaDB doesn't have `RANDOM_BYTES()`, but [MariaDB v11.7.0 (2024)](https://mariadb.com/docs/release-notes/community-server/old-releases/11.7/11.7.0) added a native `UUID_v4()` function, so you don't need any of this.

## Putting it all together

Here's an example where a table `users` uses UUIDs for its primary key. Using `CHAR(36)` simplifies this example, but see "[Making UUIDs More Performant in MySQL](/blog/making-uuids-more-performant-in-mysql)" for why you don't want to use strings for performance reasons.

```sql
CREATE TABLE users
(
    id   CHAR(36)     NOT NULL,
    name VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
);

INSERT INTO users (id, name) VALUE (uuid_v4(), 'Bill Gates');

SELECT *
FROM users;
```

If everything went well, at the end you should have table contents similar to:

```text
+--------------------------------------+------------+
| id                                   | name       |
+--------------------------------------+------------+
| bdffcd96-a52e-40ed-8c3f-806899e5b6b4 | Bill Gates |
+--------------------------------------+------------+
```

## Why _not_ choose v4?

The random nature of v4 UUIDs makes them a poor choice for clustered indexes. See "[Why You Should Use UUIDs for Your Primary Keys](/blog/why-you-should-use-uuids-for-your-primary-keys)" for more information.
