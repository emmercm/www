---

title:

---

https://dev.to/bolajiwahab/progress-reporting-in-postgresql-1i0d

```sql
SELECT now()  
     , a.query  
  , p.phase  
  , round(100.0 * p.blocks_done / nullif(p.blocks_total, 0), 2) AS "%_blocks_done"  
     , p.blocks_done  
  , p.blocks_total  
  , round(100.0 * p.tuples_done / nullif(p.tuples_total, 0), 2) AS "%_tuples_done"  
     , p.tuples_done  
  , p.tuples_total  
  , ai.relname AS table_name  
  , ai.indexrelname AS index_name  
FROM pg_stat_progress_create_index p  
JOIN pg_stat_activity a  
     ON p.pid = a.pid  
LEFT JOIN pg_stat_all_indexes ai  
          ON ai.relid = p.relid AND ai.indexrelid = p.index_relid;  
  
-- https://dev.to/bolajiwahab/progress-reporting-in-postgresql-1i0d  
SELECT p.pid  
  , now() - a.backend_start AS duration  
     , ai.schemaname AS schema_name  
  , ai.relname AS table_name  
  , ai.indexrelname AS index_name  
     , '(' || CASE  
 WHEN p.phase = 'initializing' THEN '1'  
  WHEN p.phase = 'waiting for writers before build' THEN '2'  
  WHEN p.phase = 'building index: scanning table'  
  THEN (CASE WHEN p.command LIKE '%CONCURRENTLY%' THEN '2' ELSE '3' END)  
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
 WHEN p.command LIKE '%REINDEX CONCURRENTLY%' THEN 13  
  WHEN p.command LIKE '%CONCURRENTLY%' THEN 11  
  ELSE 5  
  END || ') ' || p.phase AS phase  
     , a.query  
  , format  
  (  
        '%s (%s/%s)',  
        coalesce(round(100.0 * p.blocks_done / nullif(p.blocks_total, 0), 2) || '%', 'N/A'),  
        p.blocks_done,  
        p.blocks_total  
  )                          AS blocks_progress  
     , format(  
        '%s (%s/%s)',  
        coalesce(round(100.0 * p.tuples_done / nullif(p.tuples_total, 0), 2) || '%', 'N/A'),  
        p.tuples_done,  
        p.tuples_total  
  )                          AS tuples_progress  
     , format(  
        '%s (%s/%s)',  
        coalesce((100 * p.lockers_done / nullif(p.lockers_total, 0)) || '%', 'N/A'),  
        p.lockers_done,  
        p.lockers_total  
  )                          AS lockers_progress  
     , format(  
        '%s (%s/%s)',  
        coalesce((100 * p.partitions_done / nullif(p.partitions_total, 0)) || '%', 'N/A'),  
        p.partitions_done,  
        p.partitions_total  
  )                          AS partitions_progress  
FROM pg_stat_progress_create_index p  
INNER JOIN pg_stat_activity a  
           ON p.pid = a.pid  
LEFT JOIN pg_stat_all_indexes ai  
          ON ai.relid = p.relid  
  AND ai.indexrelid = p.index_relid;
  ```
<!--stackedit_data:
eyJoaXN0b3J5IjpbLTc2ODU2MzQ1Nl19
-->