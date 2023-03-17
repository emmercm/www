---

title: Investigating Locks in MySQL
date: 2022-06-18T04:43:00
updated: 2022-06-18T20:54:00
tags:
- databases
- mysql

---

Locking is an important part of an ACID-compliant database, but excessive locks can lead to performance degradation.  Here are some strategies for investigating locks in MySQL.

A major cause of [long-running queries](/blog/finding-long-running-queries-in-mysql) that might lead to timeouts or other issues are various types of locks. After finding that you have a large number of threads, or threads that are lasting longer than expected, the next thing to investigate is locks.

## A crash course on locks

MySQL (and most relational databases) have a few different types of locks to limit concurrent access from different sessions, protecting schema and data integrity. In MySQL, specifically:

- **Table locks** on either base tables or views limit what sessions can read from or write to the table.
- **Row locks** on individual rows limit what sessions can read or update those rows.  If a row has a _read_ or a "shared" lock then no session can modify the row until the lock is released, but any session can read the row. If a row has a _write_ or an "exclusive" lock then only the session holding the lock can modify the row.

    Standard `SELECT ... FROM` statements do not need to obtain row read locks unless the transaction isolation level is set to `SERIALIZABLE`. That means a row write lock won't prevent row reads from other sessions.

    If a statement that modifies rows (e.g. `UPDATE` or `DELETE`) has no suitable index, then InnoDB will obtain a write lock on _every_ row in the table.

- **Metadata locks** on objects (schemas, tables, triggers, etc.) limit what sessions can alter the metadata of the database object.

This is not an exhaustive list, but it gives us enough information for the sections below.

## InnoDB table and row locks

It's highly likely that you're using InnoDB as the engine for your tables as it has been the default since [MySQL v5.5.5 (2010)](https://web.archive.org/web/20190123090733/https://dev.mysql.com/doc/refman/5.5/en/storage-engine-setting.html).

You can see what engine each of your tables is using with this query:

```sql
SELECT table_schema
     , table_name
     , engine
FROM information_schema.tables
WHERE table_type = 'BASE TABLE'
  AND table_schema NOT IN ('information_schema', 'performance_schema', 'mysql')
ORDER BY table_schema, table_name;
```

Here is a query to see both requested locks and locks held by InnoDB transactions:

```sql
-- MySQL <8.0.1 (2017)
SELECT l.lock_type
     , l.lock_table
     , l.lock_index
     , CASE
           WHEN l.lock_mode = 'S' THEN 'SHARED'
           WHEN l.lock_mode = 'X' THEN 'EXCLUSIVE'
           WHEN l.lock_mode = 'IS' THEN 'INTENTION_SHARED'
           WHEN l.lock_mode = 'IX' THEN 'INTENTION_EXCLUSIVE'
           ELSE l.lock_mode END                               AS lock_mode
     , time_to_sec(timediff(now(), trx.trx_started))          AS trx_length_sec
     , trx.*
     , concat('KILL ', t.processlist_id, ';')                 AS kill_command
     , concat('CALL mysql.rds_kill(', t.processlist_id, ');') AS rds_kill_command
FROM information_schema.innodb_locks l
INNER JOIN information_schema.innodb_trx trx ON trx.trx_id = l.lock_trx_id
INNER JOIN performance_schema.threads t ON t.thread_id = trx.trx_mysql_thread_id
ORDER BY trx.trx_wait_started IS NOT NULL
       , trx.trx_wait_started
       , trx_length_sec DESC;
```

_Note: your user will need the [`PROCESS`](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_process) privilege to access `information_schema.innodb_*` tables, and to see threads for other users._

Some important columns to pay attention to:

- **`lock_type`**: the type of the lock: `RECORD` (row) or `TABLE`
- **`lock_table`**: the table that is locked, or the table that contains the locked rows
- **`lock_index`**: the name of the index if `lock_type = 'RECORD'`
- **`lock_mode`**: the mode(s) of the lock: `S`/`SHARED`, `X`/`EXCLUSIVE`, `IS`/`INTENTION_SHARED`, `IX`/`INTENTION_EXCLUSIVE`, `GAP`, `AUTO_INC`, and `UNKNOWN`
- **`trx_length_sec`**: how long since the transaction started
- **`trx_state`**: the state of the transaction: `RUNNING`, `LOCK WAIT`, `ROLLING BACK`, and `COMMITTING`
- **`trx_wait_started`**: when the transaction started waiting on a lock
- **`trx_query`**: the statement the transaction is executing

Some key things to look for:

- Long-running statements likely indicate resource contention. If a lock is held too long, any other transaction that needs to lock the same items will risk timing out. The default [`innodb_lock_wait_timeout`](https://dev.mysql.com/doc/refman/8.0/en/innodb-parameters.html#sysvar_innodb_lock_wait_timeout) variable value is 50 seconds, but you can check it with this query:

    ```sql
    SHOW VARIABLES WHERE variable_name = 'innodb_lock_wait_timeout';
    ```

- A buildup of many concurrent writes to the same tables might indicate a buildup of write locks needed by your transaction isolation level. For example, gap and next-key locks in `REPEATABLE READ` and above.

If `trx_wait_started IS NOT NULL` then that transaction is being blocked by locks held by other transactions. Here is a query to see what queries are blocking others:

```sql
-- MySQL <8.0.1 (2017)
SELECT block.trx_id                                            AS blocking_trx_id
     , block.trx_query                                         AS blocking_trx_query
     , time_to_sec(timediff(now(), req.trx_wait_started))      AS requesting_trx_wait_sec
     , req.trx_id                                              AS requesting_trx_id
     , req.trx_query                                           AS requesting_trx_query
     , concat('KILL ', bt.processlist_id, ';')                 AS kill_command
     , concat('CALL mysql.rds_kill(', bt.processlist_id, ');') AS rds_kill_command
FROM information_schema.innodb_lock_waits lw
INNER JOIN information_schema.innodb_trx block ON block.trx_id = lw.blocking_trx_id
INNER JOIN performance_schema.threads bt ON bt.thread_id = block.trx_mysql_thread_id
INNER JOIN information_schema.innodb_trx req ON req.trx_id = lw.requesting_trx_id
ORDER BY requesting_trx_wait_sec DESC
       , block.trx_id
       , req.trx_id;
```

## InnoDB deadlocks

From the [MySQL documentation](https://dev.mysql.com/doc/refman/8.0/en/innodb-deadlocks.html):

> A deadlock is a situation where different transactions are unable to proceed because each holds a lock that the other needs. Because both transactions are waiting for a resource to become available, neither ever release the locks it holds.

By default, InnoDB can detect deadlocks and will automatically roll back transactions to break the deadlock. InnoDB prefers rolling back small transactions, determined by number of rows affected.

This command will dump a very long status of the entire InnoDB engine which includes information about the last two deadlocks detected, but it only shows the last statement in the two transactions:

```sql
SHOW ENGINE INNODB STATUS;
```

_Note: your user will need the [`PROCESS`](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_process) privilege to execute this statement._

To see the other statements in the transaction, find the thread ID and query the [`performance_schema.events_statements_history`](https://dev.mysql.com/doc/refman/8.0/en/performance-schema-events-statements-history-table.html) table. The table is typically auto-sized, so it has a limit to how many statements are kept.

```sql
SELECT *
FROM performance_schema.events_statements_history
WHERE thread_id = :threadId
ORDER BY thread_id, event_id;
```

A small amount of deadlocks usually isn't dangerous and is somewhat expected in high-throughput databases. Applications should be written to retry transactions that were rolled back due to a deadlock.

**Deadlocks become dangerous when they happen so frequently that certain transactions can't execute at all.**

See this MySQL documentation page on [minimizing and handling deadlocks](https://dev.mysql.com/doc/refman/8.0/en/innodb-deadlocks-handling.html).

## Metadata locks

Metadata locks are primarily used to enqueue metadata changes (schema changes, object renames, etc.) after active transactions complete.

From the MySQL documentation on [metadata locking](https://dev.mysql.com/doc/refman/8.0/en/metadata-locking.html):

> To ensure transaction serializability, the server must not permit one session to perform a data definition language (DDL) statement on a table that is used in an uncompleted explicitly or implicitly started transaction in another session. The server achieves this by acquiring metadata locks on tables used within a transaction and deferring release of those locks until the transaction ends. A metadata lock on a table prevents changes to the table's structure.

> Metadata locking applies not just to tables, but also to schemas, stored programs (procedures, functions, triggers, scheduled events), tablespaces, user locks, and locks acquired with the locking service.

Starting with [MySQL v5.5.3 (2010)](https://web.archive.org/web/20190201033750/https://dev.mysql.com/doc/relnotes/mysql/5.5/en/news-5-5-3.html) metadata locks are held until the end of the transaction, rather than just for the length of the statement. [From Percona](https://www.percona.com/blog/2013/02/01/implications-of-metadata-locking-changes-in-mysql-5-5/):

> Prior to MySQL 5.5.3 a statement that opened a table only held meta data locks till the end of the statement and not the end of the transaction. This meant that transaction was not really isolated, because the same query could return different results if executed twice and if a DDL was executed between the query invocations.

And starting with [MySQL v8.0.3 (2017)](https://dev.mysql.com/doc/relnotes/mysql/8.0/en/news-8-0-3.html#mysqld-8-0-3-feature) metadata locks are obtained on sibling tables related by foreign keys:

> MySQL now extends metadata locks, as necessary, to tables that are related by a foreign key constraint. Extending metadata locks prevents conflicting DML and DDL operations from executing concurrently on related tables.

Here is a query to see metadata locks and the queries that cause them:

```sql
SELECT ml.object_type
     , ml.object_schema
     , ml.object_name
     , ml.lock_type
     , ml.lock_duration
     , ml.lock_status
     , t.*
     , concat('KILL ', t.processlist_id, ';')                 AS kill_command
     , concat('CALL mysql.rds_kill(', t.processlist_id, ');') AS rds_kill_command
FROM performance_schema.metadata_locks ml
INNER JOIN performance_schema.threads t ON t.thread_id = ml.owner_thread_id
WHERE t.type = 'FOREGROUND'
  AND t.processlist_command != 'Sleep'
  AND t.processlist_command != 'Daemon'
  AND t.processlist_id != connection_id()
ORDER BY t.processlist_time DESC;
```

_Note: your user will need the [`PROCESS`](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_process) privilege to see threads for other users._

It's normal to see a lot of metadata locks, that's not necessarily indicative of any issue. It's also normal to see multiple metadata locks per thread ID where the lock type or locked objects are different.

**Metadata locks can become a problem when write locks (which are [higher priority than read locks](https://dev.mysql.com/doc/refman/8.0/en/metadata-locking.html)) cause normally parallelized reads to wait.**

Consider this priority order:

1. An excessively long `SELECT ... FROM` has a metadata read lock (e.g. `SHARED_READ`) on a table
2. A schema change is waiting to acquire a write lock (e.g. `INTENTION_EXCLUSIVE`) on the table
3. Some number of other `SELECT ... FROM` queries on the table, possibly short ones, are all waiting for the schema change to complete first
