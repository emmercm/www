---

title: Keeping a Row Modification Log Using PostgreSQL Triggers
draft: true
tags:
- databases
- postgres

---

You can create an audit log of changes to table rows using triggers and a second table.

It is exceptionally difficult to reconstruct data from a point-in-time unless you design around this need from the start. Creating yourself an audit log of changes can be

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
eyJoaXN0b3J5IjpbLTU2ODA2NTQ0M119
-->