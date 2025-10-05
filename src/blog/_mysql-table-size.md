---

title: Querying MySQL Row Counts the Fast Way
date: 2023-04-05T23:00:00
tags:
- databases
- mysql

---

`SELECT COUNT(*)` requires an expensive full index scan, which probably isn't what you want.

## InnoDB's persistent stats

It's highly likely that you're using InnoDB as the engine for your tables as it has been the default since [MySQL v5.5.5 (2010)](https://web.archive.org/web/20190123090733/https://dev.mysql.com/doc/refman/5.5/en/storage-engine-setting.html).

[MySQL v5.6.2 (2011)](https://downloads.mysql.com/docs/mysql-5.6-relnotes-en.pdf) added the ability to [persist optimizer statistics for InnoDB tables](https://dev.mysql.com/doc/refman/8.0/en/innodb-persistent-stats.html) across server restarts. This behavior is controlled by the [`innodb_stats_persistent`](https://dev.mysql.com/doc/refman/8.0/en/innodb-parameters.html#sysvar_innodb_stats_persistent) setting, which is "ON" by default. Individual tables can override this setting with the [`STATS_PERSISTENT`](https://dev.mysql.com/doc/refman/8.0/en/create-table.html#create-table-options) table setting.

These table stats are persisted in the `mysql.innodb_table_stats` table, and can be queried like this:

```sql
SELECT n_rows
     , last_update
FROM mysql.innodb_table_stats
WHERE database_name = :databaseName
  AND table_name = :tableName;
```

_You can also find stats about indexes in `mysql.innodb_index_stats`._

**Caveat 1: `mysql.innodb_table_stats.n_rows` is estimated based on sampling.**

InnoDB samples an [`innodb_stats_persistent_sample_pages`](https://dev.mysql.com/doc/refman/8.0/en/innodb-parameters.html#sysvar_innodb_stats_persistent_sample_pages) (default of "20") number of pages from the clustered index and then extrapolates. Individual tables can override this setting with the [`STATS_SAMPLE_PAGES`](https://dev.mysql.com/doc/refman/8.0/en/create-table.html#create-table-options) table setting.

As a table's size grows, so does the inaccuracy of `n_rows`.

**Caveat 2: a table's stats may not update often.**

A table's `mysql.innodb_table_stats` only updates in these scenarios:

- "When a table undergoes changes to more than 10% of its rows" if the [`innodb_stats_auto_recalc`](https://dev.mysql.com/doc/refman/8.0/en/innodb-parameters.html#sysvar_innodb_stats_auto_recalc) setting is "ON" (which it is by default)
- [`ANALYZE TABLE <table>`](https://dev.mysql.com/doc/refman/8.0/en/analyze-table.html) is run
- [`OPTIMIZE TABLE <table>`](https://dev.mysql.com/doc/refman/8.0/en/optimize-table.html) is run
- [`TRUNCATE TABLE <table>`](https://dev.mysql.com/doc/refman/8.0/en/truncate-table.html) is run
- A column is added or dropped
- An index is added or dropped

As a table's size grows, it will take more and more operations to hit that 10% threshold.

## Why not `SELECT COUNT(*)`?

Because it requires a full index scan. From the [official documentation](https://dev.mysql.com/doc/refman/8.0/en/aggregate-functions.html#function_count):

> `InnoDB` processes `SELECT COUNT(*)` statements by traversing the smallest available secondary index unless an index or optimizer hint directs the optimizer to use a different index. If a secondary index is not present, `InnoDB` processes `SELECT COUNT(*)` statements by scanning the clustered index.

_It's worth noting that an InnoDB table will always have a [clustered index](https://dev.mysql.com/doc/refman/8.0/en/innodb-index-types.html) because that's how it stores row data, so `SELECT COUNT(*)` won't ever cause a full table scan._

Because different InnoDB transactions can have different row counts, the only way to return an accurate count is to fully enumerate an index _within_ the current transaction:

> For transactional storage engines such as `InnoDB`, storing an exact row count is problematic. Multiple transactions may be occurring at the same time, each of which may affect the count.
>
> `InnoDB` does not keep an internal count of rows in a table because concurrent transactions might "see" different numbers of rows at the same time. Consequently, `SELECT COUNT(*)` statements only count rows visible to the current transaction.

Full index scans can be exceptionally slow. To illustrate the problem, let's create a simple table and fill it with up to 20,000,000 rows of non-trivial size:

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
         , (SELECT 0 AS n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) f
         , (SELECT 0 AS n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) g) temp;
```

You can see how the time it takes to perform a full index scan grows propotionally with the table size:

```sql
SELECT COUNT(*) FROM messages;
```

```vega-lite
{
  "data": {
    "values": [
      {"symbol":"SELECT COUNT(*)", "count":10, "seconds":0.00},
      {"symbol":"SELECT COUNT(*)", "count":100, "seconds":0.00},
      {"symbol":"SELECT COUNT(*)", "count":1000, "seconds":0.00},
      {"symbol":"SELECT COUNT(*)", "count":10000, "seconds":0.01},
      {"symbol":"SELECT COUNT(*)", "count":100000, "seconds":0.09},
      {"symbol":"SELECT COUNT(*)", "count":1000000, "seconds":0.65},
      {"symbol":"SELECT COUNT(*)", "count":5000000, "seconds":4.07},
      {"symbol":"SELECT COUNT(*)", "count":10000000, "seconds":19.93},
      {"symbol":"SELECT COUNT(*)", "count":20000000, "seconds":76.08}
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
          "field": "count",
          "type": "quantitative",
          "scale": {
            "type": "pow",
            "exponent": 0.67
          },
          "title": "Rows"
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
          "aggregate": {"argmax":"count"},
          "field": "count",
          "type": "quantitative"
        },
        "y": {
          "aggregate": {"argmax":"count"},
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

_[MySQL's `OFFSET`](/blog/the-dangers-of-offset-with-mysql) can suffer from a similar exponential cost._

**You cannot avoid a potentially slow `SELECT COUNT(*)` if you have a requirement for exact or realtime row counts.**

## `COUNT(*)` vs. `COUNT(col)`

`COUNT(col)` counts the number of non-null `col` values. If the column is indexed then it will be scanned, otherwise a full table scan will be necessary.

From the [MySQL documentation](https://dev.mysql.com/doc/refman/8.0/en/aggregate-functions.html#function_count):

> `COUNT(*)` is somewhat different in that it returns a count of the number of rows retrieved, whether or not they contain `NULL` values.

So you should only need `COUNT(col)` under very specific circumstances.

## `COUNT(*)` vs. `COUNT(1)`

From the [MySQL documentation](https://dev.mysql.com/doc/refman/8.0/en/aggregate-functions.html#function_count):

> `InnoDB` handles `SELECT COUNT(*)` and `SELECT COUNT(1)` operations in the same way. There is no performance difference.

## Why not `information_schema.tables`?

If you want to get the estimated row count from a non-InnoDB table, but still avoid `SELECT COUNT(*)`, then you have to use `information_schema.tables`:

```sql
-- Row count for every table
SELECT table_schema
     , table_name
     , table_rows
FROM information_schema.tables
WHERE table_type = 'BASE TABLE'
  AND table_schema = :databaseName
ORDER BY table_schema, table_name;
```

```sql
-- Row count for a specific table
SELECT table_schema
     , table_name
     , table_rows
FROM information_schema.tables
WHERE table_schema = :databaseName
  AND table_name = :tableName;
```

However, table statistics columns in `information_schema.tables` are cached, up to a default of 24 hours (controlled by the [`information_schema_stats_expiry`](https://dev.mysql.com/doc/refman/8.0/en/server-system-variables.html#sysvar_information_schema_stats_expiry) setting). MySQL explicitly avoids querying from the storage engine (e.g. InnoDB) frequently, even though it's fast to query `mysql.innodb_table_stats`.

A table's `information_schema.tables` statistics are updated in these scenarios:

- The column's cache has expired
- [`ANALYZE TABLE ...`](https://dev.mysql.com/doc/refman/8.0/en/analyze-table.html) is run

Setting the [` information_schema_stats_expiry`](https://dev.mysql.com/doc/refman/8.0/en/server-system-variables.html#sysvar_information_schema_stats_expiry) setting to "0" (zero) disables caching, causing queries against `information_schema.tables` to always retrieve the latest statistics from the storage engine.

## Conclusion

`SELECT COUNT(*)` and similar queries can take an exceptionally long time on large tables. You should strongly consider using the persistent stats stored in [`information_schema.tables`](https://dev.mysql.com/doc/refman/8.0/en/information-schema-tables-table.html) if possible.
<!--stackedit_data:
eyJoaXN0b3J5IjpbMTg0MDkyNTIwNCwtMTA5MzE4MzU2MiwtOD
A2OTAxNDMsMzY5NzM5NzU1LDY2ODUzOTc3OSwtMTEwNjEyMTI1
OSwtOTYwODEwNTczLDYzMjUyMjI5OCwtMTM2MjU3ODk5Nyw0NT
Q2Nzc5OTYsLTkzNzkyODQ1OSw4NzgxNDM0MjEsMTE2NDM3OTc2
MSwtMTMwMDU3MjY2NF19
-->