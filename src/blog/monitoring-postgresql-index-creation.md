---

title: Monitoring PostgreSQL Index Creation
date: 2026-05-09T15:43:00
tags:
- databases
- postgres

---

PostgreSQL has the ability to monitor the progress of index creation, which is very helpful for long-running queries.

PostgreSQL added the ability to monitor the progress of index creation in [v12.0 (2019)](https://www.postgresql.org/docs/release/12.0/) by querying the [`pg_stat_progress_create_index` view](https://www.postgresql.org/docs/current/progress-reporting.html#CREATE-INDEX-PROGRESS-REPORTING). It requires the [statistics collector](https://www.postgresql.org/docs/current/monitoring-stats.html) to be enabled (which it is by default). Superusers and users with the [`pg_read_all_stats` role](https://www.postgresql.org/docs/current/predefined-roles.html#PREDEFINED-ROLE-PG-MONITOR) can query the progress of every index being created, and all other users will be restricted to only seeing the progress of indexes they are creating.

Index creation is broken down into "phases" or steps, and the number increases if you use the `CONCURRENTLY` option. Different phases process different entities (lockers, tuples, and blocks), so the `pg_stat_progress_create_index` view breaks these out into different columns. See the [progress reporting docs](https://www.postgresql.org/docs/current/progress-reporting.html#CREATE-INDEX-PROGRESS-REPORTING) for information about what entity is relevant when.

Here is a query that shows the progress of phases and the progress within each phase during index creation:

```sql
SELECT p.pid
     , now() - a.query_start      AS duration
     , n.nspname                  AS schema_name
     , c.relname                  AS table_name
     , (
		       SELECT relname
		       FROM pg_class
		       WHERE oid = p.index_relid
       )                          AS index_name
     , '(' || CASE
              WHEN p.phase = 'initializing' THEN '1'
              WHEN p.phase = 'waiting for writers before build' THEN '2'
              WHEN p.phase = 'building index: scanning table' THEN (CASE WHEN p.command LIKE '%CONCURRENTLY%' THEN '2' ELSE '3' END)
              WHEN p.phase = 'building index: sorting live tuples' THEN '4'
              WHEN p.phase = 'building index: sorting dead tuples' THEN '5'
              WHEN p.phase = 'building index: loading tuples in tree' THEN '6'
              WHEN p.phase = 'waiting for writers before validation' THEN '7'
              WHEN p.phase = 'index validation: scanning index' THEN '8'
              WHEN p.phase = 'index validation: sorting tuples' THEN '9'
              WHEN p.phase = 'index validation: scanning table' THEN '10'
              WHEN p.phase = 'waiting for old snapshots' THEN '11'
              WHEN p.phase = 'waiting for readers before marking dead' THEN '12'
              WHEN p.phase = 'waiting for readers before dropping' THEN '13'
              ELSE '?'
       END || '/' || CASE
		                 WHEN p.command LIKE '%REINDEX CONCURRENTLY%' THEN '13'
		                 WHEN p.command LIKE '%CONCURRENTLY%' THEN '11'
		                 ELSE '5'
       END || ') ' || p.phase AS phase_progress
     , format('%s%% (%s/%s)',
              coalesce(round(100.0 * p.blocks_done / nullif(p.blocks_total, 0), 2)::TEXT, '0'),
              p.blocks_done,
              p.blocks_total
       )                          AS blocks_progress
     , format('%s%% (%s/%s)',
              coalesce(round(100.0 * p.tuples_done / nullif(p.tuples_total, 0), 2)::TEXT, '0'),
              p.tuples_done,
              p.tuples_total
       )                          AS tuples_progress
     , a.query
FROM pg_stat_progress_create_index p
JOIN pg_stat_activity a
     ON p.pid = a.pid
JOIN pg_class c
     ON p.relid = c.oid
JOIN pg_namespace n
     ON c.relnamespace = n.oid;
```
