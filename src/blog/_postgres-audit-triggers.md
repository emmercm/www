---

title: Keeping a Row Modification Log Using PostgreSQL Triggers
draft: true
tags:
- databases
- postgres

---

You can create an audit log of changes to a table's rows by using functions, triggers, and a second table.

It is exceptionally difficult to reconstruct data from a point-in-time unless you design around the need from the start. Some reasons you may want to create an audit trail of changes to a DB are:

- To debug or troubleshoot a problem, especially involving user-submitted data
- To identify what Postgres user caused a specific change
- To create a regulatory compliance trail, depending on your company needs

## Example scenario

Let's start with an example table:

```sql
CREATE TABLE IF NOT EXISTS crons
(
    id       BIGSERIAL PRIMARY KEY,
    schedule TEXT  NOT NULL,
    config   jsonb NOT NULL
);
```

This table holds information about cron jobs that execute on some schedule, using some de-normalized config. The job config is updated by human action, such as through a web UI, and changes will take effect on the next job execution.

Let's say this flexible design has been working great for months and there hasn't been any need to change it. But then a bug ticket comes in that says a specific job wasn't working, or was producing unexpected results a week ago. You investigate the job and see it has been running fine for the last few days. Because you don't have any way to know what the job configuration was a week ago you reject the bug ticket and frustrate your customer.

There's nothing we can do for that customer, we don't have any audit trail of changes previously made. But we can start creating one going forward!

## Considerations

There are four key pieces of data we need to create an audit trail:

- What the action was (i.e. a row `INSERT`, `UPDATE`, or `DELETE`)
- When the action occurred
- What or who caused the action
- What the change was

We can log these in a separate "audit" table in the same DB.

## Solution

We can make a generic solution for our DB if we adhere to some rules:

- Every audit table is always named predictably, e.g. `<base_table>_audit`
- Every audit table contains the same audit columns
- Every audit table contains every column from its base table—which will require the audit table to be altered any time the base table is altered

Let's create a `crons_audit` table:

```sql
CREATE TABLE IF NOT EXISTS crons_audit
(
    -- Audit columns
    audit_id        BIGSERIAL PRIMARY KEY,
    audit_operation TEXT      NOT NULL,
    audit_timestamp TIMESTAMP NOT NULL,
    audit_user      TEXT      NOT NULL,
    -- Columns from `crons`, with the same types and order
    id              BIGINT    NOT NULL,
    schedule        TEXT      NOT NULL,
    config          jsonb     NOT NULL
);

CREATE INDEX IF NOT EXISTS crons_audit_id ON crons_audit (id);
```

Note that other than the slight type change for the `crons_audit.id` column, `crons_audit` is a perfect superset of the columns in `crons`.

We need to create a function for table triggers to execute, and we want to create it in a way that it can be re-used by multiple tables:

```sql
CREATE OR REPLACE FUNCTION audit_trigger()
    RETURNS TRIGGER
AS
$func$
BEGIN
    IF (tg_op = 'DELETE') THEN
        EXECUTE 'INSERT INTO ' || quote_ident(tg_table_schema) || '.' || quote_ident(tg_table_name || '_audit') ||
                ' SELECT nextval(pg_get_serial_sequence(''' || quote_ident(tg_table_schema) || '.' ||
                quote_ident(tg_table_name || '_audit') || ''', ''audit_id'')), ' ||
                '''' || tg_op || ''', now(), user, $1.*' USING old;
    ELSE
        EXECUTE 'INSERT INTO ' || quote_ident(tg_table_schema) || '.' || quote_ident(tg_table_name || '_audit') ||
                ' SELECT nextval(pg_get_serial_sequence(''' || quote_ident(tg_table_schema) || '.' ||
                quote_ident(tg_table_name || '_audit') || ''', ''audit_id'')), ' ||
                '''' || tg_op || ''', now(), user, $1.*' USING new;
    END IF;
    RETURN NULL;
END;
$func$ LANGUAGE plpgsql;
```

This function will insert a new row into `crons_audit` for every row changed in `crons` like this:

- On `INSERT INTO crons`: the new `crons_audit` row will contain the values being inserted into `crons`
- On `UPDATE crons`: the new `crons_audit` row will contain the values from _after_ the update to `crons`
- On `DELETE FROM crons`: the new `crons_audit` row will contain the values from _before_ the delete from `crons`

The `INSERT INTO crons_audit` queries will use the same transaction that is making changes to `crons`—which means the changes will either succeed together or fail together. This requires extra care when making alterations to base tables, discussed below.

String concatenation makes the function hard to read, but it is necessary in order to create a function that can be used for many tables. Other drawbacks of this are discussed below.

Lastly, we need a trigger on the base table which will execute the function on every change:

```sql
CREATE OR REPLACE TRIGGER crons_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE
    ON crons
    FOR EACH ROW
EXECUTE FUNCTION audit_trigger();
```

## Usage

Let's add some cron jobs and then modify them. Inserting one row at a time:

```shell
postgres=# INSERT INTO crons (schedule, config)
           VALUES ('0 * * * *', '{"action": "refresh_stats"}');
INSERT 0 1

postgres=# SELECT * FROM crons_audit;
 audit_id | audit_operation |      audit_timestamp       | audit_user | id | schedule  |           config            
----------+-----------------+----------------------------+------------+----+-----------+-----------------------------
        1 | INSERT          | 2024-12-02 20:08:53.791243 | postgres   |  1 | 0 * * * * | {"action": "refresh_stats"}
(1 row)
```

Inserting multiple rows at a time (note the identitcal `crons_audit.audit_timestamp`s):

```shell
postgres=# INSERT INTO crons (schedule, config)
           VALUES ('0 0 * * *', '{"action": "refresh_billing"}')
                , ('0 0 1 * *', '{"action": "finalize_billing"}');
INSERT 0 2

postgres=# SELECT * FROM crons_audit;
 audit_id | audit_operation |      audit_timestamp       | audit_user | id | schedule  |             config             
----------+-----------------+----------------------------+------------+----+-----------+--------------------------------
        1 | INSERT          | 2024-12-02 20:08:53.791243 | postgres   |  1 | 0 * * * * | {"action": "refresh_stats"}
        2 | INSERT          | 2024-12-02 20:10:07.429602 | postgres   |  2 | 0 0 * * * | {"action": "refresh_billing"}
        3 | INSERT          | 2024-12-02 20:10:07.429602 | postgres   |  3 | 0 0 1 * * | {"action": "finalize_billing"}
(3 rows)
```

Updating a single row:

```shell
postgres=# UPDATE crons SET schedule = '10 * * * *'
           WHERE config->>'action' = 'refresh_stats';
UPDATE 1

postgres=# SELECT * FROM crons_audit;
 audit_id | audit_operation |      audit_timestamp       | audit_user | id |  schedule  |             config             
----------+-----------------+----------------------------+------------+----+------------+--------------------------------
        1 | INSERT          | 2024-12-02 20:08:53.791243 | postgres   |  1 | 0 * * * *  | {"action": "refresh_stats"}
        2 | INSERT          | 2024-12-02 20:10:07.429602 | postgres   |  2 | 0 0 * * *  | {"action": "refresh_billing"}
        3 | INSERT          | 2024-12-02 20:10:07.429602 | postgres   |  3 | 0 0 1 * *  | {"action": "finalize_billing"}
        4 | UPDATE          | 2024-12-02 20:13:24.592229 | postgres   |  1 | 10 * * * * | {"action": "refresh_stats"}
(4 rows)
```

Deleting a row:

```shell
postgres=# DELETE FROM crons
           WHERE config->>'action' = 'refresh_stats';
DELETE 1

postgres=# SELECT * FROM crons_audit;
 audit_id | audit_operation |      audit_timestamp       | audit_user | id |  schedule  |             config             
----------+-----------------+----------------------------+------------+----+------------+--------------------------------
        1 | INSERT          | 2024-12-02 20:08:53.791243 | postgres   |  1 | 0 * * * *  | {"action": "refresh_stats"}
        2 | INSERT          | 2024-12-02 20:10:07.429602 | postgres   |  2 | 0 0 * * *  | {"action": "refresh_billing"}
        3 | INSERT          | 2024-12-02 20:10:07.429602 | postgres   |  3 | 0 0 1 * *  | {"action": "finalize_billing"}
        4 | UPDATE          | 2024-12-02 20:13:24.592229 | postgres   |  1 | 10 * * * * | {"action": "refresh_stats"}
        5 | DELETE          | 2024-12-02 20:15:23.977359 | postgres   |  1 | 10 * * * * | {"action": "refresh_stats"}
(5 rows)
```

## Drawbacks

**Base tables and audit tables have to be altered in the same DDL transaction.**

Or the audit table needs to be altered first in a backwards-compatible way.

Otherwise, you can run into this situation, using `crons` and `crons_audit` as an example:

- We want to add a `crons.created_at` column, so we do that:

```sql

```

- General slowdown from additional queries (especially with multi-row changes?)
- Have to use EXECUTE to make it a generic function
- Have to migrate the audit table first

## Alternative
<!--stackedit_data:
eyJoaXN0b3J5IjpbNzI1NDI5NjcsLTU3MzY5Nzg3LDczODQzOT
c5NSwtMjcyODc0MDAwLC0xODEyOTA3Njk1LC0xNjgzMjkzNzg5
LC0xNDM2MDk1ODUyLC02MzM0NTI5MTZdfQ==
-->