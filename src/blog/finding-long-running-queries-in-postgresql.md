---

title: Finding Long-Running Queries in PostgreSQL
date: 2021-11-27T01:55:00
tags:
- databases

---

Poorly optimized queries and excessive connections can cause problems in PostgreSQL, here's a quick way to identify and kill them.

First the query, then we'll explain parts of it:

```sql
SELECT COALESCE(now() - query_start, '0 seconds'::INTERVAL) AS duration
     , *
FROM pg_stat_activity
WHERE state != 'idle'
  AND pid != pg_backend_pid()
ORDER BY 1 DESC, backend_start;
```

The [`pg_stat_activity`](https://www.postgresql.org/docs/current/monitoring-stats.html#MONITORING-PG-STAT-ACTIVITY-VIEW) view will return one row per server process, and each row will have information about the PID, user, query, and more.

`WHERE` conditions:

- `state != 'idle'` will filter out open connections that aren't executing anything - you might want to include these if you're debugging connection issues
- `pid != pg_backend_pid()` will filter out this `pg_stat_activity` query from the results
- Optional: `datname = current_database()` will filter to only the current database, which may be the only database your active user has permissions to

## Killing a single connection

The [`pg_terminate_backend()`](https://www.postgresql.org/docs/current/functions-admin.html#FUNCTIONS-ADMIN-SIGNAL) function is used to both terminate a query and kill the connection, given a PID from the above query:

```sql
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE pid = :pid
  AND pid != pg_backend_pid();
```

## Killing every query & connection

We can use results from the [`pg_stat_activity`](https://www.postgresql.org/docs/current/monitoring-stats.html#MONITORING-PG-STAT-ACTIVITY-VIEW) view as the parameter to [`pg_terminate_backend()`](https://www.postgresql.org/docs/current/functions-admin.html#FUNCTIONS-ADMIN-SIGNAL):

```sql
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = :database_name
  AND pid != pg_backend_pid();
```
