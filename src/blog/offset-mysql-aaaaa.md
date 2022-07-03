---

title: The Dangers of OFFSET With MySQL
date: 2030-01-01
tags:
- databases
- mysql

---

TODO

Let's create a simple table and fill it with 10,000,000 rows of non-trivial size:

```sql
CREATE TABLE messages
(
    id      SERIAL PRIMARY KEY,
    message TEXT NOT NULL
);

INSERT INTO messages (message)
SELECT 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer aliquam ornare velit, auctor tempus erat ultrices ut. Phasellus ac nibh ante. Morbi consectetur, lorem in pulvinar tincidunt, augue est cursus ipsum, sed dapibus neque sapien id libero. Donec id felis sem. Morbi quis mi turpis. Nam viverra felis ac ex convallis, in congue nunc ultrices. Curabitur rutrum, lorem sit amet vulputate ultricies, velit odio ultrices dui, sed volutpat lorem felis vitae nibh. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Aenean orci mi, consectetur sed turpis sed, consequat tempor nisi. Cras id venenatis mi. Sed cursus in eros sit amet interdum.'
FROM (SELECT a.n + b.n * 10 + c.n * 100 + d.n * 1000 + e.n * 10000 + f.n * 100000 + g.n * 1000000 + 1 AS n
      FROM (SELECT 0 AS n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) a
         , (SELECT 0 AS n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) b
         , (SELECT 0 AS n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) c
         , (SELECT 0 AS n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) d
         , (SELECT 0 AS n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) e
         , (SELECT 0 AS n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) f
         , (SELECT 0 AS n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) g) temp;
```

The table ended up with about 7.29GB of data:

```shell
mysql> SELECT round((data_length + index_length) / 1024 / 1024 / 1024, 2) AS `Size (GB)`
FROM information_schema.tables
WHERE table_name = 'messages';

+-----------+
| Size (GB) |
+-----------+
|      7.29 |
+-----------+
```

_We need a table of some significant size like this in order to illustrate the performance degradation of `OFFSET`. Having a table with only a single numeric primary key column won't highlight the issues as well._

Now let's measure how long it takes to select 10 rows at a time at various offsets:

```shell
mysql> SELECT * FROM messages LIMIT 10;
10 rows in set (0.00 sec)

mysql> SELECT * FROM messages LIMIT 10 OFFSET 10;
10 rows in set (0.00 sec)

mysql> SELECT * FROM messages LIMIT 10 OFFSET 100;
10 rows in set (0.00 sec)

mysql> SELECT * FROM messages LIMIT 10 OFFSET 1000;
10 rows in set (0.01 sec)

mysql> SELECT * FROM messages LIMIT 10 OFFSET 10000;
10 rows in set (0.05 sec)

mysql> SELECT * FROM messages LIMIT 10 OFFSET 100000;
10 rows in set (0.83 sec)

mysql> SELECT * FROM messages LIMIT 10 OFFSET 1000000;
10 rows in set (8.41 sec)

mysql> SELECT * FROM messages LIMIT 10 OFFSET 9999000;
10 rows in set (1 min 22.06 sec)
```

_Your timings may vary, but they should have a similar exponential growth. Both MySQL 5.7 and 8.0 exhibit this behavior._

All the offsets up through 10,000 are negligible, but once we get close to 100,000 the performance penalty becomes clear.

This begs the question: why would you ever query with an offset of 1,000,000 or more? A few reasons:

- Websites that display paginated data from large data set:
  - Search engine results from billions of crawled web pages
  - Product results from a very large product catalog
  - User list for a social website
- Processing every item in a collection in batches:
  - Sending emails to every registered user, 1,000 at a time

TODO

## PostgreSQL

Most relational databases suffer from some performance hit with `OFFSET`, PostgreSQL included, but it's not nearly as bad as MySQL.

If we create a similar table and fill it with similar data:

```sql
CREATE TABLE messages
(
    id      SERIAL PRIMARY KEY,
    message TEXT
);

INSERT INTO messages (message)
SELECT 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer aliquam ornare velit, auctor tempus erat ultrices ut. Phasellus ac nibh ante. Morbi consectetur, lorem in pulvinar tincidunt, augue est cursus ipsum, sed dapibus neque sapien id libero. Donec id felis sem. Morbi quis mi turpis. Nam viverra felis ac ex convallis, in congue nunc ultrices. Curabitur rutrum, lorem sit amet vulputate ultricies, velit odio ultrices dui, sed volutpat lorem felis vitae nibh. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Aenean orci mi, consectetur sed turpis sed, consequat tempor nisi. Cras id venenatis mi. Sed cursus in eros sit amet interdum.'
FROM generate_series(1, 10000000);
```

And then use `psql` with timing on, we can see the 1,000,000 row offset isn't great, but

```shell
postgres=# \timing
Timing is on.

postgres=# SELECT id FROM messages LIMIT 10;
 id
----
  1
  2
  3
  4
  5
  6
  7
  8
  9
 10
(10 rows)

Time: 2.835 ms

postgres=# SELECT id FROM messages LIMIT 10 OFFSET 1000000;
   id
---------
 1000001
 1000002
 1000003
 1000004
 1000005
 1000006
 1000007
 1000008
 1000009
 1000010
(10 rows)

Time: 418.463 ms
```
