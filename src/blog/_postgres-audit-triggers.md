---

title: Keeping a Row Modification Log Using PostgreSQL Triggers
draft: true
tags:
- databases
- postgres

---

You can create an audit log of changes to table rows using triggers and a second table.

It is exceptionally difficult to reconstruct data from a point-in-time unless you design around this need from the start. Some reasons you may want to create an audit trail is:

- To debug or troubleshoot a problem, especially involving user-submitted data
- To identify what Postgres user caused a specific change
- To create a regulatory compliance trail, depending on your needs

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

This table holds information about cron jobs that execute on some schedule, using some de-normalized config. The config can be updated by humans, such as through a web UI, and changes will take effect on the next job execution.

Let's say this flexible design has been working great for months and there hasn't been any need to change it. But then a bug ticket comes in that says a specific job wasn't working, or was producing unexpected results a week ago. You investigate the job and see it has been running fine for the last few days. Because you don't have any way to know what the job configuration was a week ago you reject the bug ticket and frustrate your customer.

There's nothing we can do for that customer, we don't have any audit trail of changes made. But we can start creating one going forward!

## Considerations

There are four key pieces of data we need to create an audit trail:

- What the action was (i.e. a row `INSERT`, `UPDATE`, or `DELETE`)
- When the action occurred
- What or who caused the action
- What the change was

We can log these in a separate "audit" table in the same DB.

## Solution

We can make a generic solution for our DB if we adhere to some rules:

- The audit table is always named predictably, e.g. `<base_table>_audit`
- The audit table contains every column the base table does

Let's create a `crons_audit` table:

```sql
CREATE OR REPLACE FUNCTION audit_trigger()  
    RETURNS TRIGGER  
AS  
$func$  
BEGIN  
 IF (tg_op = 'DELETE') THEN  
 EXECUTE 'INSERT INTO ' || quote_ident(tg_table_schema) || '.' || quote_ident(tg_table_name || '_audit') ||  
                ' SELECT public.uuid_generate_v4(), ''' || tg_op || ''', now(), user, $1.*' USING old;  
    ELSE  
 EXECUTE 'INSERT INTO ' || quote_ident(tg_table_schema) || '.' || quote_ident(tg_table_name || '_audit') ||  
                ' SELECT public.uuid_generate_v4(), ''' || tg_op || ''', now(), user, $1.*' USING new;  
    END IF;  
    RETURN NULL;  
END;  
$func$ LANGUAGE plpgsql;
```
<!--stackedit_data:
eyJoaXN0b3J5IjpbLTE5Njg1NDkyNzUsLTYzMzQ1MjkxNl19
-->