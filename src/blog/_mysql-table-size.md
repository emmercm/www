---

title: Querying MySQL Row Counts the Fast Way
date: 2023-04-05T23:00:00
tags:
- databases
- mysql

---

`SELECT COUNT(*)` requires an expensive full clustered index scan, which probably isn't what you want.

## InnoDB

It's highly likely that you're using InnoDB as the engine for your tables as it has been the default since [MySQL v5.5.5 (2010)](https://web.archive.org/web/20190123090733/https://dev.mysql.com/doc/refman/5.5/en/storage-engine-setting.html).

[MySQL v5.6.2 (2011)](https://downloads.mysql.com/docs/mysql-5.6-relnotes-en.pdf) added the ability to [persist optimizer statistics for InnoDB tables](https://dev.mysql.com/doc/refman/8.0/en/innodb-persistent-stats.html) across server restarts. This behavior is controlled by the [`innodb_stats_persistent`](https://dev.mysql.com/doc/refman/8.0/en/innodb-parameters.html#sysvar_innodb_stats_persistent) setting, which is "ON" by default. Individual tables can override this setting with the [`STATS_PERSISTENT`](https://dev.mysql.com/doc/refman/8.0/en/create-table.html#create-table-options) table setting.

These table stats are persisted in the `mysql.innodb_table_stats` table.

`mysql.innodb_table_stats` is updated in any of these situations:

- "When a table undergoes changes to more than 10% of its rows" if the [`innodb_stats_auto_recalc`](https://dev.mysql.com/doc/refman/8.0/en/innodb-parameters.html#sysvar_innodb_stats_auto_recalc) setting is "ON" (which it is by default)
- [`ANALYZE TABLE ...`](https://dev.mysql.com/doc/refman/8.0/en/analyze-table.html) is run

## Why not `information_schema.tables`?

If you want to get the estimated row count from a non-InnoDB table then you'll have to use `information_schema.tables`.

However, table statistics columns in `information_schema.tables` are cached, up to to a default of 24 hours (controlled by the [`information_schema_stats_expiry`](https://dev.mysql.com/doc/refman/8.0/en/server-system-variables.html#sysvar_information_schema_stats_expiry) setting). MySQL explicitly avoids querying from the storage engine (e.g. InnoDB) frequently, even though it's fast to query `mysql.innodb_table_stats`.

`information_schema.tables` is updated in any of these situations:

- The column's cache has expired
- [`ANALYZE TABLE ...`](https://dev.mysql.com/doc/refman/8.0/en/analyze-table.html) is run
- [`OPTIMIZE TABLE ...`](https://dev.mysql.com/doc/refman/8.0/en/optimize-table.html) is run (because it causes `ANALYZE TABLE ...`)

Setting the [` information_schema_stats_expiry`](https://dev.mysql.com/doc/refman/8.0/en/server-system-variables.html#sysvar_information_schema_stats_expiry) setting to "0" (zero) disables caching, causing queries against `information_schema.tables` to always retrieve the latest statistics from the storage engine.




Here are the queries that you should use the majority of the time:

```sql
-- Row count for every table
SELECT table_schema
     , table_name
     , table_rows
FROM information_schema.tables
WHERE table_type = 'BASE TABLE'
  AND table_schema NOT IN ('information_schema', 'performance_schema', 'mysql', 'sys')
ORDER BY table_schema, table_name;
```

```sql
-- Row count for a specific table
SELECT table_schema
     , table_name
     , table_rows
FROM information_schema.tables
WHERE table_name = :tableName;
```

**The caveat is: the row count will be an approximation, and it won't be realtime.**

By default, the MySQL setting [`innodb_stats_auto_recalc`](https://dev.mysql.com/doc/refman/8.0/en/innodb-parameters.html#sysvar_innodb_stats_auto_recalc) is "ON", which means InnoDB table [persistent stats](https://dev.mysql.com/doc/refman/8.0/en/innodb-persistent-stats.html) recalculate automatically "when a table undergoes changes to more than 10% of its rows." Stats are also recalculated when an index is added or a column is added or dropped. You can also force this recalculation with the [`ANALYZE TABLE ...`](https://dev.mysql.com/doc/refman/8.0/en/analyze-table.html) statement.

You can check your persistent stats settings with this query:

```sql
SHOW VARIABLES
WHERE variable_name LIKE 'innodb_stats_%';
```

## `information_schema.tables` vs. `mysql.innodb_table_stats`

By default, the MySQL setting [`innodb_stats_auto_recalc=ON`](https://dev.mysql.com/doc/refman/8.0/en/innodb-parameters.html#sysvar_innodb_stats_auto_recalc), which means InnoDB table [persistent stats](https://dev.mysql.com/doc/refman/8.0/en/innodb-persistent-stats.html) recalculate automatically "when a table undergoes changes to more than 10% of its rows." Stats also get recalculated when an index is added or a column is added or dropped. You can also force this recalculation with the [`ANALYZE TABLE ...`](https://dev.mysql.com/doc/refman/8.0/en/analyze-table.html) statement.

_You can check your persistent stats settings with this query:_

```sql
SHOW VARIABLES WHERE variable_name LIKE 'innodb_stats_%';
```

These persisted stats get stored in the [`mysql.innodb_table_stats`](https://dev.mysql.com/doc/refman/8.0/en/innodb-persistent-stats.html#innodb-persistent-stats-tables) and [`mysql.innodb_index_stats`](https://dev.mysql.com/doc/refman/8.0/en/innodb-persistent-stats.html#innodb-persistent-stats-tables) tables.

TODO

## Why not `SELECT COUNT(*)`?

Assuming you're using InnoDB as the engine for your tables, as it has been the default since [MySQL v5.5.5 (2010)](https://web.archive.org/web/20190123090733/https://dev.mysql.com/doc/refman/5.5/en/storage-engine-setting.html), the [official documentation](https://dev.mysql.com/doc/refman/8.0/en/aggregate-functions.html#function_count) says:

> `InnoDB` processes `SELECT COUNT(*)` statements by traversing the smallest available secondary index unless an index or optimizer hint directs the optimizer to use a different index. If a secondary index is not present, `InnoDB` processes `SELECT COUNT(*)` statements by scanning the clustered index.

It's worth noting that an InnoDB table will always have a [clustered index](https://dev.mysql.com/doc/refman/8.0/en/innodb-index-types.html) because that's how it stores row data, so `SELECT COUNT(*)` won't ever cause a full table scan.

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

You can see how the time it takes to perform a full index scan grows exponentially with the table size:

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

MySQL's persistent stats are an approximation, even when a recalculation is forced with `ANALYZE TABLE ...`:

```shell
mysql> SELECT COUNT(*) FROM messages;
+----------+
| COUNT(*) |
+----------+
| 20000000 |
+----------+
1 row in set (1 min 16.08 sec)

mysql> SELECT table_rows FROM information_schema.tables WHERE table_name = 'messages';
+------------+
| TABLE_ROWS |
+------------+
|   19114131 |
+------------+
1 row in set (0.07 sec)

mysql> ANALYZE TABLE messages;
+----------------+---------+----------+----------+
| Table          | Op      | Msg_type | Msg_text |
+----------------+---------+----------+----------+
| mysql.messages | analyze | status   | OK       |
+----------------+---------+----------+----------+
1 row in set (0.05 sec)

mysql> SELECT table_rows FROM information_schema.tables WHERE table_name = 'messages';
+------------+
| TABLE_ROWS |
+------------+
|   19049840 |
+------------+
1 row in set (0.00 sec)
```

**You cannot avoid a potentially slow `SELECT COUNT(*)` if you have a requirement for exact or realtime row counts.**

## `COUNT(*)` vs. `COUNT(col)`

`COUNT(col)` counts the number of non-null `col` values. If the column is indexed then it will be scanned, otherwise a full table scan will be necessary.

From the [MySQL documentation](https://dev.mysql.com/doc/refman/8.0/en/aggregate-functions.html#function_count):

> `COUNT(*)` is somewhat different in that it returns a count of the number of rows retrieved, whether or not they contain `NULL` values.

So you should only need `COUNT(col)` under very specific circumstances.

## `COUNT(*)` vs. `COUNT(1)`

From the [MySQL documentation](https://dev.mysql.com/doc/refman/8.0/en/aggregate-functions.html#function_count):

> `InnoDB` handles `SELECT COUNT(*)` and `SELECT COUNT(1)` operations in the same way. There is no performance difference.

## Conclusion

`SELECT COUNT(*)` and similar queries can take an exceptionally long time on large tables. You should strongly consider using the persistent stats stored in [`information_schema.tables`](https://dev.mysql.com/doc/refman/8.0/en/information-schema-tables-table.html) if possible.
<!--stackedit_data:
eyJoaXN0b3J5IjpbMjAyNDY2NjUzNCwtMTEwNjEyMTI1OSwtOT
YwODEwNTczLDYzMjUyMjI5OCwtMTM2MjU3ODk5Nyw0NTQ2Nzc5
OTYsLTkzNzkyODQ1OSw4NzgxNDM0MjEsMTE2NDM3OTc2MSwtMT
MwMDU3MjY2NF19
-->