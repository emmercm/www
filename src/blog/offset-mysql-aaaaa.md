---

title: The Dangers of OFFSET With MySQL
date: 2030-01-01
tags:
- databases
- mysql

---

Large limit offsets degrade the performance of most databases, but it is especially egregious in MySQL.

## The problem, with a clustered index

To illustrate the problem, let's create a simple table and fill it with 1,000,000 rows of non-trivial size:

```sql
CREATE TABLE messages
(
    id      SERIAL PRIMARY KEY,
    message TEXT NOT NULL
);

INSERT INTO messages (message)
SELECT 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer aliquam ornare velit, auctor tempus erat ultrices ut. Phasellus ac nibh ante. Morbi consectetur, lorem in pulvinar tincidunt, augue est cursus ipsum, sed dapibus neque sapien id libero. Donec id felis sem. Morbi quis mi turpis. Nam viverra felis ac ex convallis, in congue nunc ultrices. Curabitur rutrum, lorem sit amet vulputate ultricies, velit odio ultrices dui, sed volutpat lorem felis vitae nibh. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Aenean orci mi, consectetur sed turpis sed, consequat tempor nisi. Cras id venenatis mi. Sed cursus in eros sit amet interdum.'
FROM (SELECT 1
      FROM (SELECT 0 AS n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) a
         , (SELECT 0 AS n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) b
         , (SELECT 0 AS n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) c
         , (SELECT 0 AS n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) d
         , (SELECT 0 AS n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) e
         , (SELECT 0 AS n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) f) temp;
```

Because `id` is the primary key, it becomes the InnoDB table's [clustered index](https://dev.mysql.com/doc/refman/8.0/en/innodb-index-types.html). In general, the clustered index controls the physical ordering of rows on disk, and querying against it can provide some disk I/O optimization.

The table ended up with about 760MB of data:

```shell
mysql> SELECT round((data_length + index_length) / 1024 / 1024) AS `Size (MB)`
FROM information_schema.tables
WHERE table_name = 'messages';

+-----------+
| Size (MB) |
+-----------+
|       760 |
+-----------+
1 row in set (0.00 sec)
```

_Note: we need a table of some significant size like this in order to illustrate the performance degradation of `OFFSET`. Having a table with only a single numeric primary key column won't highlight the issues as well._

Now let's measure how long it takes to select a single row at a time at various offsets:

```shell
mysql> SELECT * FROM messages ORDER BY id LIMIT 1;
1 row in set (0.00 sec)

mysql> SELECT * FROM messages ORDER BY id LIMIT 1 OFFSET 10;
1 row in set (0.00 sec)

mysql> SELECT * FROM messages ORDER BY id LIMIT 1 OFFSET 100;
1 row in set (0.00 sec)

mysql> SELECT * FROM messages ORDER BY id LIMIT 1 OFFSET 1000;
1 row in set (0.01 sec)

mysql> SELECT * FROM messages ORDER BY id LIMIT 1 OFFSET 10000;
1 row in set (0.06 sec)

mysql> SELECT * FROM messages ORDER BY id LIMIT 1 OFFSET 100000;
1 row in set (0.67 sec)

mysql> SELECT * FROM messages ORDER BY id LIMIT 1 OFFSET 999999;
1 row in set (6.49 sec)
```

```vega-lite
{
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "data": {
    "values": [
      {"x":0, "y":0},
      {"x":10, "y":0},
      {"x":100, "y":0},
      {"x":1000, "y":0.03},
      {"x":10000, "y":0.25},
      {"x":100000, "y":10.41},
      {"x":999999, "y":13.70}
    ]
  },
  "mark": "line",
  "encoding": {
    "x": {"field": "x"},
    "y": {"field": "y", "type":"temporal"}
  }
}
```

_Note: your timings may vary, but they should have a similar exponential growth. As of writing, all modern versions of MySQL exhibit this behavior._

The difference in query time with offsets up through 10,000 is negligible, but once we get close to 100,000 the performance penalty becomes clear.

## The problem, with a secondary index

But what happens if we create that same table with an extra column that has a secondary index, and then fill that column with random numbers that won't match the clustered index's ordering:

```sql
CREATE TABLE messages
(
    id      SERIAL PRIMARY KEY,
    message TEXT NOT NULL,
    weight  INT  NOT NULL,
    INDEX (weight)
);

INSERT INTO messages (message, weight)
SELECT 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer aliquam ornare velit, auctor tempus erat ultrices ut. Phasellus ac nibh ante. Morbi consectetur, lorem in pulvinar tincidunt, augue est cursus ipsum, sed dapibus neque sapien id libero. Donec id felis sem. Morbi quis mi turpis. Nam viverra felis ac ex convallis, in congue nunc ultrices. Curabitur rutrum, lorem sit amet vulputate ultricies, velit odio ultrices dui, sed volutpat lorem felis vitae nibh. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Aenean orci mi, consectetur sed turpis sed, consequat tempor nisi. Cras id venenatis mi. Sed cursus in eros sit amet interdum.'
     , rand() * 2147483647
FROM (SELECT 1
      FROM (SELECT 0 AS n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) a
         , (SELECT 0 AS n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) b
         , (SELECT 0 AS n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) c
         , (SELECT 0 AS n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) d
         , (SELECT 0 AS n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) e
         , (SELECT 0 AS n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) f) temp;
```

And then run those same performance tests when ordering by the secondary index:

```shell
mysql> SELECT * FROM messages ORDER BY weight LIMIT 1;
1 row in set (0.00 sec)

mysql> SELECT * FROM messages ORDER BY weight LIMIT 1 OFFSET 10;
1 row in set (0.00 sec)

mysql> SELECT * FROM messages ORDER BY weight LIMIT 1 OFFSET 100;
1 row in set (0.00 sec)

mysql> SELECT * FROM messages ORDER BY weight LIMIT 1 OFFSET 1000;
1 row in set (0.03 sec)

mysql> SELECT * FROM messages ORDER BY weight LIMIT 1 OFFSET 10000;
1 row in set (0.25 sec)

mysql> SELECT * FROM messages ORDER BY weight LIMIT 1 OFFSET 100000;
1 row in set (10.41 sec)

mysql> SELECT * FROM messages ORDER BY weight LIMIT 1 OFFSET 999999;
1 row in set (13.70 sec)
```

```vega-lite
{
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "mark": "line",
  "data": {
    "values": [
      {"x":0, "y":0},
      {"x":10, "y":0},
      {"x":100, "y":0},
      {"x":1000, "y":30},
      {"x":10000, "y":250},
      {"x":100000, "y":10410},
      {"x":999999, "y":13700}
    ],
    "format": {
      "parse": {
        "y": "number"
      }
    }
  },
  "encoding": {
    "x": {
      "field": "x",
      "title": "OFFSET",
      "type": "quantitative"
    },
    "y": {
      "field": "y",
      "title": "Time (sec)",
      "type": "temporal",
      "timeUnit": "secondsmilliseconds",
      "axis": {
        "tickCount": "second",
        "tickMinStep": 400,
        "format": "%S"
      }
    }
  }
}
```

The performance hit is even worse. Finding the last row in the table takes more than double the time when compared to the clustered index.

## The explanation

MySQL's official documentation doesn't have much on the topic, but MariaDB's page on [Pagination Optimization](https://mariadb.com/kb/en/pagination-optimization/) has a little:

> MariaDB has to find all \[OFFSET+LIMIT\] rows, step over the first \[OFFSET\], then deliver the \[LIMIT\] for that distant page.

> The goal is to touch only the relevant rows, not all the rows leading up to the desired rows.

TODO

## The use cases

This begs the question, though: why would you ever query with an offset of 100,000 or more? Here are a few use cases:

**Websites that allow paginating of a large data set:**

- Search engine results from billions of crawled web pages
- Product search results from a very large product catalog
- Displaying a list of some users for a social website, ordered by some ranking

**Processing every item in a large set in batches:**

- Sending emails to every registered user, 1,000 at a time
- TODO

And most of those use cases are probably ordering by a secondary index and not the clustered index.

None of these query patterns pose problems when first getting started with an empty database, they only become a problem when the data set becomes large. But the available solutions aren't difficult, so you should think about them from the start.

## The solutions

"cursor-based pagination" id>10, id>20, etc - requires unique column

"seek method" or "keyset pagination" , where you do `(created_on, id) < ('2019-10-02 21:00:00.0', 4951)` - can you in MySQL, or just Postgres? [https://vladmihalcea.com/sql-seek-keyset-pagination/](https://vladmihalcea.com/sql-seek-keyset-pagination/)

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
FROM generate_series(1, 1000000);
```

We can see the 1,000,000 row offset isn't great, but it's far better than MySQL:

```shell
postgres=# \timing
Timing is on.

postgres=# SELECT * FROM messages LIMIT 1;
Time: 0.801 ms

postgres=# SELECT * FROM messages LIMIT 1 OFFSET 10000;
Time: 3.086 ms

postgres=# SELECT * FROM messages LIMIT 1 OFFSET 999999;
Time: 235.581 ms
```
