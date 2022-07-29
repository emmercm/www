---

title: Generating v4 UUIDs in MySQL
date: 2020-11-13T22:43:00
tags:
- databases
- mysql

---

MySQL's [`UUID()`](https://dev.mysql.com/doc/refman/8.0/en/miscellaneous-functions.html#function_uuid) function generates [v1 UUIDs](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_1_(date-time_and_MAC_address)), which have a time component that make them unevenly distributed over short periods of time.
We can define our own function to generate [v4 UUIDs](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)), which are random and therefore more evenly distributed.

Check out "[Why You Should Use UUIDs for Your Primary Keys](/blog/why-you-should-use-uuids-for-your-primary-keys)" for a reason to use UUIDs in databases.

## A custom `uuid_v4()` function

Here's the function, with comments explaining each group:

```sql
CREATE FUNCTION uuid_v4() RETURNS CHAR(36)
BEGIN
    -- 1st group is 8 characters = 4 bytes
    SET @g1 = HEX(RANDOM_BYTES(4));

    -- 2nd group is 4 characters = 2 bytes
    SET @g2 = HEX(RANDOM_BYTES(2));

    -- 3rd group is 4 characters = 2 bytes, starting with a: 4
    SET @g3 = CONCAT('4', SUBSTR(HEX(RANDOM_BYTES(2)), 2, 3));

    -- 4th group is 4 characters = 2 bytes, starting with a: 8, 9, A, or B
    SET @g4 = CONCAT(HEX(FLOOR(ASCII(RANDOM_BYTES(1)) / 64) + 8), SUBSTR(HEX(RANDOM_BYTES(2)), 2, 3));

    -- 1st group is 12 characters = 6 bytes
    SET @g5 = HEX(RANDOM_BYTES(6));

    RETURN LOWER(CONCAT(@g1, '-', @g2, '-', @g3, '-', @g4, '-', @g5));
END;
```

Here's a version without variables, to remove any overhead they might add:

```sql
CREATE FUNCTION uuid_v4() RETURNS CHAR(36)
BEGIN
    RETURN LOWER(CONCAT(
            HEX(RANDOM_BYTES(4)),
            '-', HEX(RANDOM_BYTES(2)),
            '-4', SUBSTR(HEX(RANDOM_BYTES(2)), 2, 3),
            '-', HEX(FLOOR(ASCII(RANDOM_BYTES(1)) / 64) + 8), SUBSTR(HEX(RANDOM_BYTES(2)), 2, 3),
            '-', hex(RANDOM_BYTES(6))
        ));
END;
```

This uses [`RANDOM_BYTES()`](https://dev.mysql.com/doc/refman/8.0/en/encryption-functions.html#function_random-bytes) instead of [`RAND()`](https://dev.mysql.com/doc/refman/8.0/en/mathematical-functions.html#function_rand) because the former is non-deterministic and therefore more cryptographically secure, resulting in fewer UUID collisions in the end.

[`RANDOM_BYTES()`](https://dev.mysql.com/doc/refman/8.0/en/encryption-functions.html#function_random-bytes) was introduced in [MySQL v5.6.17 (2014)](https://dev.mysql.com/doc/relnotes/mysql/5.6/en/news-5-6-17.html#mysqld-5-6-17-feature), and is currently not available in MariaDB.

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
