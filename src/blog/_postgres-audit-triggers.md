---

title: Keeping a Row Modification Log Using Postgres Triggers
draft: true
tags:
- databases
- postgres

---

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
eyJoaXN0b3J5IjpbLTE3MTYwMjc3NzRdfQ==
-->