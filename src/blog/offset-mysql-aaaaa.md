---

title: The Dangers of OFFSET With MySQL
date: 2022-07-28T04:48:00
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

The table ended up with about 741MB of data:

```shell
mysql> SELECT round((data_length + index_length) / 1024 / 1024) AS `Size (MB)`
       FROM information_schema.tables
       WHERE table_name = 'messages';

+-----------+
| Size (MB) |
+-----------+
|       741 |
+-----------+
1 row in set (0.01 sec)
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
1 row in set (0.00 sec)

mysql> SELECT * FROM messages ORDER BY id LIMIT 1 OFFSET 10000;
1 row in set (0.01 sec)

mysql> SELECT * FROM messages ORDER BY id LIMIT 1 OFFSET 100000;
1 row in set (0.68 sec)

mysql> SELECT * FROM messages ORDER BY id LIMIT 1 OFFSET 500000;
1 row in set (4.01 sec)

mysql> SELECT * FROM messages ORDER BY id LIMIT 1 OFFSET 999999;
1 row in set (6.40 sec)
```

```vega-lite
{
  "data": {
    "values": [
      {"symbol":"Clustered Index", "offset":0, "seconds":0},
      {"symbol":"Clustered Index", "offset":10, "seconds":0},
      {"symbol":"Clustered Index", "offset":100, "seconds":0},
      {"symbol":"Clustered Index", "offset":1000, "seconds":0},
      {"symbol":"Clustered Index", "offset":10000, "seconds":0.01},
      {"symbol":"Clustered Index", "offset":100000, "seconds":0.68},
      {"symbol":"Clustered Index", "offset":500000, "seconds":4.01},
      {"symbol":"Clustered Index", "offset":999999, "seconds":6.40}
    ]
  },
  "encoding": {
    "detail": {"field":"symbol", "legend":null}
  },
  "layer": [
    {
      "mark": "line",
      "encoding": {
        "x": {
          "field": "offset",
          "type": "quantitative",
          "scale": {
            "type": "sqrt"
          },
          "title": "OFFSET"
        },
        "y": {
          "field": "seconds",
          "type": "quantitative",
          "title": "Time (sec)"
        }
      }
    },
    {
      "encoding": {
        "x": {
          "aggregate": {"argmax":"offset"},
          "field": "offset",
          "type": "quantitative"
        },
        "y": {
          "aggregate": {"argmax":"offset"},
          "field": "seconds",
          "type": "quantitative"
        }
      },
      "layer": [
        {"mark":{"type":"circle"}},
        {
          "mark": {"type":"text", "align":"left", "dx":10},
          "encoding": {"text":{"field":"symbol", "type":"nominal"}}
        }
      ]
    }
  ]
}
```

_Note: your timings are likely to vary, but they should have a similar exponential growth. The timings in this article are from the MySQL v8.0.29 Docker image. See "[Creating a MySQL Playground in Docker](/blog/creating-a-mysql-playground)" for instructions on using it._

The difference in query time with offsets up through 10,000 is negligible, but once we get close to 100,000 the performance penalty becomes clear.

## The problem, with a secondary index

What happens if we create that same table with an extra column that has a secondary index, and then fill that column with random numbers that won't match the clustered index's ordering:

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
1 row in set (0.01 sec)

mysql> SELECT * FROM messages ORDER BY weight LIMIT 1 OFFSET 1000;
1 row in set (0.05 sec)

mysql> SELECT * FROM messages ORDER BY weight LIMIT 1 OFFSET 10000;
1 row in set (0.34 sec)

mysql> SELECT * FROM messages ORDER BY weight LIMIT 1 OFFSET 100000;
1 row in set (10.85 sec)

mysql> SELECT * FROM messages ORDER BY weight LIMIT 1 OFFSET 500000;
1 row in set (12.00 sec)

mysql> SELECT * FROM messages ORDER BY weight LIMIT 1 OFFSET 999999;
1 row in set (13.65 sec)
```

```vega-lite
{
  "data": {
    "values": [
      {"symbol":"Secondary Index", "offset":0, "seconds":0},
      {"symbol":"Secondary Index", "offset":10, "seconds":0},
      {"symbol":"Secondary Index", "offset":100, "seconds":0.01},
      {"symbol":"Secondary Index", "offset":1000, "seconds":0.05},
      {"symbol":"Secondary Index", "offset":10000, "seconds":0.34},
      {"symbol":"Secondary Index", "offset":100000, "seconds":10.85},
      {"symbol":"Secondary Index", "offset":500000, "seconds":12.00},
      {"symbol":"Secondary Index", "offset":999999, "seconds":13.65},
      {"symbol":"Clustered Index", "offset":0, "seconds":0},
      {"symbol":"Clustered Index", "offset":10, "seconds":0},
      {"symbol":"Clustered Index", "offset":100, "seconds":0},
      {"symbol":"Clustered Index", "offset":1000, "seconds":0},
      {"symbol":"Clustered Index", "offset":10000, "seconds":0.01},
      {"symbol":"Clustered Index", "offset":100000, "seconds":0.68},
      {"symbol":"Clustered Index", "offset":500000, "seconds":4.01},
      {"symbol":"Clustered Index", "offset":999999, "seconds":6.40}
    ]
  },
  "encoding": {
    "detail": {"field":"symbol", "legend":null}
  },
  "layer": [
    {
      "mark": "line",
      "encoding": {
        "x": {
          "field": "offset",
          "type": "quantitative",
          "scale": {
            "type": "sqrt"
          },
          "title": "OFFSET"
        },
        "y": {
          "field": "seconds",
          "type": "quantitative",
          "title": "Time (sec)"
        }
      }
    },
    {
      "encoding": {
        "x": {
          "aggregate": {"argmax":"offset"},
          "field": "offset",
          "type": "quantitative"
        },
        "y": {
          "aggregate": {"argmax":"offset"},
          "field": "seconds",
          "type": "quantitative"
        }
      },
      "layer": [
        {"mark":{"type":"circle"}},
        {
          "mark": {"type":"text", "align":"left", "dx":10},
          "encoding": {"text":{"field":"symbol", "type":"nominal"}}
        }
      ]
    }
  ]
}
```

The performance hit is noticeably worse. All the offsets of 100,000 or more rows take more than double the time when compared to the clustered index.

## The explanation

MySQL's official documentation doesn't have much on the topic, but MariaDB's page on [Pagination Optimization](https://mariadb.com/kb/en/pagination-optimization/) has some:

> MariaDB has to find all \[OFFSET+LIMIT\] rows, step over the first \[OFFSET\], then deliver the \[LIMIT\] for that distant page.

> Reading the entire table, just to get a distant page, can be so much I/O that it can cause timeouts... or it can interfere with other activity, causing other things to be slow.

Most popular articles on the internet describe this process as needing to "fetch" (from disk) all rows up to and including our result set, and then discard all but our results. Given that vague explanation, it makes sense why ordering on a clustered index would perform better, rows will be near each other on disk.

## The use cases

This begs the question: why would you ever query with an offset of 100,000 or more? Here are a few use cases:

**Websites that allow paginating a large data set:**

- Search engine results from billions of crawled web pages
- Product search results from a very large product catalog
- Displaying a list of some users for a social website, ordered by some ranking

**Processing every item in a large set in batches:**

- Sending emails to every registered user, 1,000 at a time
- TODO

Most of those use cases are probably ordering by a secondary index and not the clustered index.

None of these query patterns pose problems when first getting started with an empty database, they only become a problem when the data set becomes large. But the available solutions aren't difficult, so you should think about them from the start.

_Note: it's worth stating that if you're ordering by a non-monotonically-increasing set of columns that you will have issues with inconsistent reads with `OFFSET`, regardless of the offset amount. Another reason to avoid `OFFSET` entirely._

## Solution 1: cursor-based pagination

**Cursor-based pagination / the "seek" method / keyset pagination.**

Call it what you want, the idea is that you use the results from one query to help fetch the next or previous page. With this method we lose the ability to seek to arbitrary pages in our dataset, but that's likely acceptable for the real world use cases above.

Let's query for the first page of results from the second `messages` table with the secondary index from above, but the `weight` column isn't unique, and we need to ensure deterministic ordering, so we have to have a secondary ordering by the `id` column:

```shell
mysql> SELECT id
            , weight
       FROM messages
       ORDER BY weight, id
       LIMIT 10;

+--------+--------+
| id     | weight |
+--------+--------+
| 460554 |   3278 |
| 688311 |   7084 |
| 655956 |   7238 |
|  45815 |   7282 |
|  72018 |   9218 |
| 944968 |  11198 |
| 336739 |  11440 |
| 378072 |  12188 |
| 555292 |  12584 |
| 570261 |  12628 |
+--------+--------+
10 rows in set (0.00 sec)
```

We can use the last row from the results to query the next page:

```shell
mysql> SELECT id
            , weight
       FROM messages
       WHERE weight > 12628
          OR (weight = 12628 AND id > 570261)
       ORDER BY weight, id
       LIMIT 10;

+--------+--------+
| id     | weight |
+--------+--------+
| 701828 |  12980 |
| 969784 |  13970 |
| 827037 |  16192 |
| 171493 |  17776 |
| 506882 |  19514 |
|  18733 |  20746 |
| 202076 |  23078 |
| 768782 |  31196 |
| 675765 |  33418 |
| 956891 |  34210 |
+--------+--------+
10 rows in set (0.00 sec)
```

And if we wanted to go back a page then we can use the first result from that second page:

```sql
mysql> SELECT id
            , weight
       FROM messages
       WHERE weight < 12980
          OR (weight = 12980 AND id < 701828)
       ORDER BY weight, id
       LIMIT 10;

+--------+--------+
| id     | weight |
+--------+--------+
| 460554 |   3278 |
| 688311 |   7084 |
| 655956 |   7238 |
|  45815 |   7282 |
|  72018 |   9218 |
| 944968 |  11198 |
| 336739 |  11440 |
| 378072 |  12188 |
| 555292 |  12584 |
| 570261 |  12628 |
+--------+--------+
10 rows in set (0.00 sec)
```

This method would also work well for dates, such as fetching a page of users by their registration date.

There are a few limits to this method, however:

- Your data must be able to be deterministically sorted
- You can't seek to an arbitrary page, you have to have the results from a sibling page
- You lose the ability to easily know if a next or previous page exists

MariaDB's page on [Pagination Optimization](https://mariadb.com/kb/en/pagination-optimization/) has some clever tricks on getting around some of these limits.

## Solution 2: Deferred joins

From the official MySQL documentation on [secondary indexes](https://dev.mysql.com/doc/refman/8.0/en/innodb-index-types.html):

> In InnoDB, each record in a secondary index contains the primary key columns for the row, as well as the columns specified for the secondary index. InnoDB uses this primary key value to search for the row in the clustered index.

In other words, we could say that every secondary index is a "spanning" index that includes the primary key, similar to [multiple-column indexes](https://dev.mysql.com/doc/refman/8.0/en/innodb-index-types.html).

So when we order by the `weight` secondary index, MySQL will first use that to look up the primary key, and will then use the primary key to fetch the row.

The only reason the high-offset queries above are slow is that we are requesting columns that require MySQL to fetch the entire row. If we only wanted the primary key then the lookup is much faster:

```shell
mysql> SELECT id FROM messages ORDER BY weight LIMIT 1 OFFSET 999999;
1 row in set (0.14 sec)
```

With a clever join to a subquery we can get MySQL to fetch only our result rows and _not_ all the rows preceding it:

```shell
mysql> SELECT * FROM messages ORDER BY weight LIMIT 1 OFFSET 100000;
1 row in set (10.85 sec)

mysql> SELECT *
       FROM messages
                INNER JOIN (SELECT id
                            FROM messages
                            ORDER BY weight
                            LIMIT 1 OFFSET 100000) AS tmp USING (id)
       ORDER BY weight;
1 row in set (0.02 sec)
```

This solution won't scale as well as cursor-based pagination, but it might be acceptable if your dataset won't easily support cursors.

## Comparison to PostgreSQL

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

We can see the 999,999 row offset isn't great, but it's far better than MySQL:

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
