---

title: Calculating Table Size in MySQL
date: 2022-09-15T22:01:00
tags:
- databases
- mysql

---

Knowing how much disk space individual tables take up is important for DB maintenance and debugging, and it can be accomplished with a single query in MySQL.

First the query, then we'll explain parts of it:

```sql
SELECT table_schema
     , table_name
     , concat(round((data_length + index_length) / (1024 * 1024 * 1024)), ' GB') AS total_size
     , concat(round(data_length / (1024 * 1024 * 1024)), ' GB')                  AS table_size
     , concat(round(index_length / (1024 * 1024 * 1024)), ' GB')                 AS index_size
FROM information_schema.tables
WHERE table_type = 'BASE TABLE'
  AND table_schema NOT IN ('information_schema', 'performance_schema', 'mysql');
```

Column explanations:

- `total_size` is the total disk space used by the table and its indexes
- `table_size` is the disk space used by the table
- `index_size` is the disk space used by the table's indexes

The [`information_schema.tables`](https://dev.mysql.com/doc/refman/8.0/en/information-schema-tables-table.html) table catalogs information about tables and views.

By default, table stats have a cache of 24 hours, but they updated with the [`ANALYZE TABLE ...`](https://dev.mysql.com/doc/refman/8.0/en/analyze-table.html) statement.

_See "[Calculating Table Size in PostgreSQL](/blog/calculating-table-size-in-postgresql)" for the PostgreSQL version of this query._

## Finding the largest tables

It's fairly easy to modify the above query to order by the largest total size:

```sql
SELECT table_schema
     , table_name
     , concat(round((data_length + index_length) / (1024 * 1024 * 1024)), ' GB') AS total_size
     , concat(round(data_length / (1024 * 1024 * 1024)), ' GB')                  AS table_size
     , concat(round(index_length / (1024 * 1024 * 1024)), ' GB')                 AS index_size
FROM information_schema.tables
WHERE table_type = 'BASE TABLE'
  AND table_schema NOT IN ('information_schema', 'performance_schema', 'mysql')
ORDER BY data_length + index_length DESC
LIMIT 10;
```

This could be used to help debug a DB running out of space, or similar administrative tasks.

## Finding the largest schemas

If you aggregate by `table_schema` you can find which schemas are the largest:

```sql
SELECT table_schema
     , concat(round(sum((data_length + index_length) / (1024 * 1024 * 1024))), ' GB') AS total_size
     , concat(round(sum(data_length / (1024 * 1024 * 1024))), ' GB')                  AS table_size
     , concat(round(sum(index_length / (1024 * 1024 * 1024))), ' GB')                 AS index_size
FROM information_schema.tables
WHERE table_type = 'BASE TABLE'
  AND table_schema NOT IN ('information_schema', 'performance_schema', 'mysql')
GROUP BY table_schema
ORDER BY sum((data_length + index_length) / (1024 * 1024 * 1024)) DESC
LIMIT 10;
```
