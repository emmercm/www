---

title: Finding Long-Running Queries in MySQL
date: 2021-12-22T20:40:00
updated: 2022-06-18T04:08:00
tags:
- databases
- mysql

---

Poorly optimized queries and excessive connections can cause problems in MySQL, here's a quick way to identify and kill them.

First the query, then we'll explain parts of it:

```sql
SELECT *
     , concat('KILL ', processlist_id, ';')                 AS kill_command
     , concat('CALL mysql.rds_kill(', processlist_id, ');') AS rds_kill_command
FROM performance_schema.threads
WHERE type = 'FOREGROUND'
  AND processlist_command != 'Sleep'
  and processlist_command != 'Daemon'
  AND processlist_id != connection_id()
ORDER BY processlist_time DESC;
```

The [`performance_schema.threads`](https://dev.mysql.com/doc/refman/8.0/en/performance-schema-threads-table.html) table will return one row per server thread, and each row will have information about the thread ID, user, query, and more.

Some important columns to pay attention to:

- `processlist_user`: what user is executing the query, this might be helpful with identifying a culprit in a monolithic database
- `processlist_time`: the time in seconds that the thread has been in its current state
- `processlist_state`: the [thread state](https://dev.mysql.com/doc/refman/8.0/en/general-thread-states.html)
- `processlist_info`: the statement the thread is executing

And an explanation of the `WHERE` conditions:

- `type = 'FOREGROUND'` will filter to only user connection threads and will exclude internal server activity
- `processlist_command != 'Sleep'` will filter out threads that aren't executing anything - you might want to include these if you're debugging connection issues
- `processlist_command != 'Daemon'` will filter out the MySQL daemon thread
- `processlist_id != connection_id()` will filter out this `performance_schema.threads` query from the results

_Note: your user will need the [`PROCESS`](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_process) privilege to access this table._

_See "[Finding Long-Running Queries in PostgreSQL](/blog/finding-long-running-queries-in-postgresql)" for the PostgreSQL version of this query._

If you find yourself with an unexpectedly large amount of threads, you may need to [investigate locks](/blog/investigating-locks-in-mysql) happening in your database.

## Why not `processlist`?

These two statements are equivalent, the only difference is the length of data returned in the `info` column:

```sql
-- `info` returns up to 64KB
SELECT *
FROM information_schema.processlist;

-- `info` returns up to `max_allowed_packet` characters
SHOW FULL PROCESSLIST;
```

_Note: your user will need the [`PROCESS`](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_process) privilege to see threads for other users._

But in MySQL versions before [v8.0.22 (2020)](https://dev.mysql.com/doc/relnotes/mysql/8.0/en/news-8-0-22.html#mysqld-8-0-22-performance-schema), as well as v8.0 servers running without the [`performance_schema_show_processlist`](https://dev.mysql.com/doc/refman/8.0/en/performance-schema-system-variables.html#sysvar_performance_schema_show_processlist) system variable enabled, these are locking operations.

From the documentation on the [`performance_schema_show_processlist`](https://dev.mysql.com/doc/refman/8.0/en/performance-schema-system-variables.html#sysvar_performance_schema_show_processlist) system variable:

> The default implementation \[of the `SHOW PROCESS` statement\] iterates across active threads from within the thread manager while holding a global mutex. This has negative performance consequences, particularly on busy systems.

This global mutex means no threads can be added or removed while the statement is executing. For that reason it's recommended to use `performance_schema.threads`.

## Killing a single connection

The [`KILL`](https://dev.mysql.com/doc/refman/8.0/en/kill.html) statement can be used to either kill a connection (default) or just kill a query, given a `processlist_id`:

```sql
-- Kill the connection for 1234
KILL 1234;

-- Kill the connection for 1234
KILL CONNECTION 1234;

-- Kill only the query for 1234
KILL QUERY 1234;
```

The `performance_schema.threads` query above builds this statement per row.

_Note: your user will need either the [`CONNECTION_ADMIN`](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_connection-admin) or the [`SUPER`](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_super) (deprecated) privilege to execute these statements._

## Killing every query & connection

There isn't a way to kill multiple connections with one statement in MySQL, but we can use the individual `KILL` statements returned by the `performance_schema.threads` query above and execute them sequentially:

```sql
KILL 1234;
KILL 3456;
KILL 5678;
```

## Killing a single Amazon RDS connection

Amazon RDS doesn't provide shell access to MySQL instances, and it restricts access to certain system procedures such as `KILL`. Here are the alternative statements Amazon provides:

```sql
-- Kill the connection for 1234
CALL mysql.rds_kill(1234);

-- Kill only the query for 1234
CALL mysql.rds_kill_query(1234);
```

The `performance_schema.threads` query above builds this statement per row.
