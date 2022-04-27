---

title: Calculating Table Size in PostgreSQL
date: 2021-11-26T23:17:00
tags:
- databases
- postgres

---

Knowing how much disk space individual tables take up is important for DB maintenance and debugging, and it can be accomplished with a single query in PostgreSQL.

First the query, then we'll explain parts of it:

```sql
SELECT n.nspname                                     AS schema_name
     , c.relname                                     AS table_name
     , pg_size_pretty(pg_total_relation_size(c.oid)) AS total_size
     , pg_size_pretty(pg_table_size(c.oid))          AS table_size
     , pg_size_pretty(pg_indexes_size(c.oid))        AS index_size
FROM pg_class c
         INNER JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind IN ('r', 'm')
  AND n.nspname NOT IN ('pg_catalog', 'information_schema')
  AND n.nspname NOT LIKE 'pg_toast%'
ORDER BY 1, 2;
```

Column explanations:

- `total_size` is the total disk space used by the table, including its [TOAST](https://www.postgresql.org/docs/current/storage-toast.html) data and indexes
- `table_size` is the disk space used by the table and its [TOAST](https://www.postgresql.org/docs/current/storage-toast.html) data
- `index_size` is the disk space used by the table's indexes

Tables used (from the [`pg_catalog`](https://www.postgresql.org/docs/current/catalogs-overview.html) schema):

- [`pg_class`](https://www.postgresql.org/docs/current/catalog-pg-class.html): catalogs tables and table-like objects (indexes, sequences, views, materialized views, composite types, and TOAST tables)
  - `pg_class.relkind`: `r` is ordinary tables and `m` is materialized views - this excludes indexes (`i`), sequences (`S`), views (`v`), composite types (`c`), TOAST tables (`t`), and foreign tables (`f`)
- [`pg_namespace`](https://www.postgresql.org/docs/current/catalog-pg-namespace.html): catalogs namespaces (schemas)

## Finding the largest tables

It's fairly easy to modify the above query to order by the largest total size:

```sql
SELECT n.nspname                                     AS schema_name
     , c.relname                                     AS table_name
     , pg_size_pretty(pg_total_relation_size(c.oid)) AS total_size
     , pg_size_pretty(pg_table_size(c.oid))          AS table_size
     , pg_size_pretty(pg_indexes_size(c.oid))        AS index_size
FROM pg_class c
         INNER JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind IN ('r', 'm')
  AND n.nspname NOT IN ('pg_catalog', 'information_schema')
  AND n.nspname NOT LIKE 'pg_toast%'
ORDER BY pg_total_relation_size(c.oid) DESC
LIMIT 10;
```

This could be used to help debug a DB running out of space, or similar administrative tasks.
