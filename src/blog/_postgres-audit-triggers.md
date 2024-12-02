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

Let's start with an example table:

```sql
CREATE TABLE IF NOT EXISTS jobs
(
    id BIGSERIAL PRIMARY KEY,
    config jsonb NOT NULL
);
```

Let's say this table holds

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
eyJoaXN0b3J5IjpbNjk3MjgyNjcxLC02MzM0NTI5MTZdfQ==
-->