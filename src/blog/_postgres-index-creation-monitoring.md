
---  
  
title: Monitoring PostgreSQL Index Creation  
date: 2026-05-07  
tags:  
- databases  
- postgres  
  
---  
  
PostgreSQL has the ability to monitor the progress of index creation, which is very helpful for long-running queries.  
  
PostgreSQL added the ability to monitor the progress of index creation in [v12.0 (2019)](https://www.postgresql.org/docs/release/12.0/) by querying the [`pg_stat_progress_create_index` view](https://www.postgresql.org/docs/current/progress-reporting.html#CREATE-INDEX-PROGRESS-REPORTING). It requires the [statistics collector](https://www.postgresql.org/docs/current/monitoring-stats.html) to be enabled (which it is by default). Superusers and users with the [`pg_read_all_stats` role](https://www.postgresql.org/docs/current/predefined-roles.html#PREDEFINED-ROLE-PG-MONITOR) can query the progress of every index being created, and all other users will be restricted to only seeing the progress of indexes they are creating.  
  
Index creation is broken down into "phases" or steps, and the number increases if you use the `CONCURRENTLY` option. Different phases process different entities (lockers, tuples, and blocks), so the `pg_stat_progress_create_index` view breaks these out into different columns. See the [progress reporting docs](https://www.postgresql.org/docs/current/progress-reporting.html#CREATE-INDEX-PROGRESS-REPORTING) for information about what entity is relevant when.

Here is a query that shows the progress of phases and the progress within each phase during index creation:

```sql
SELECT n.nspname AS schema_name  
  , c.relname AS index_name  
     , t.relname AS table_name  
FROM pg_index i  
JOIN pg_class c  
 ON c.oid = i.indexrelid  
JOIN pg_class t  
     ON t.oid = i.indrelid  
JOIN pg_namespace n  
     ON n.oid = c.relnamespace  
WHERE i.indisvalid = FALSE;  
  
SELECT pid  
  , now() - xact_start AS duration  
     , query  
  , state  
  , wait_event_type  
FROM pg_stat_activity  
WHERE state != 'idle'  
  AND xact_start IS NOT NULL  
ORDER BY duration DESC;  
-- 2026-02-23T23:37:55Z  
-- 2026-02-23 15:37 PST  
  
  
-- Who is waiting on whom?  
SELECT a.pid AS waiting_pid  
     , a.usename AS waiting_user  
     , a.application_name  
  , a.client_addr  
  , a.state  
  , a.wait_event_type  
  , a.wait_event  
  , now() - a.query_start AS waiting_for  
     , left(a.query, 200)    AS waiting_query  
     , b.pid AS blocking_pid  
     , b.usename AS blocking_user  
     , now() - b.query_start AS blocking_for  
     , left(b.query, 200)    AS blocking_query  
FROM pg_stat_activity a  
LEFT JOIN pg_stat_activity b  
          ON b.pid = ANY (pg_blocking_pids(a.pid))  
WHERE a.pid <> pg_backend_pid()  
  AND (a.wait_event_type IS NOT NULL OR cardinality(pg_blocking_pids(a.pid)) > 0)  
ORDER BY waiting_for DESC;  
  
  
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
  , now() - a.xact_start AS duration  
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
  
  
SELECT *  
FROM pg_ls_tmpdir();  
  
  
EXPLAIN  
SELECT DISTINCT s.subscriber_id  
FROM subscriptions s  
WHERE s.company_id = :companyId  
  AND s.subscriber_id <= :idCursor  
  AND s.status != 'TERMINATED'  
ORDER BY s.subscriber_id DESC  
LIMIT :limit  
  
CREATE INDEX CONCURRENTLY IF NOT EXISTS get_subscribers_idx ON subscriptions ( channel, subscription_type, company_id );  
  
EXPLAIN  
SELECT subscriptions.id  
  , subscriptions.company_id  
  , subscriber_id  
  , subscription_type  
  , channel  
  , destination  
  , destination_token  
  , status  
  , opt_out  
  , source  
  , creative_id  
  , batch_upload_id  
  , subscriptions.created  
  , subscriptions.updated  
  , external_id  
FROM subscriptions  
INNER JOIN subscribers  
           ON subscriptions.subscriber_id = subscribers.id  
  AND subscriptions.company_id = subscribers.company_id  
WHERE exists (  
    SELECT 1  
  FROM subscriptions subs2  
    WHERE subs2.subscriber_id = subscriptions.subscriber_id  
  AND subs2.company_id = subscriptions.company_id  
  AND ((channel = 'EMAIL' AND lower(destination) IN  
  ( 'a@gmail.com', 'b@gmail.com', 'c@gmail.com', 'd@gmail.com', 'e@gmail.com',  
                                    'f@gmail.com', 'g@gmail.com', 'h@gmail.com', 'i@gmail.com' ))  
        OR (channel != 'EMAIL' AND destination IN  
  ( '+12480000000', '+12480000001', '+12480000002', '+12480000003', '+12480000004',  
                                     '+12480000005', '+12480000006', '+12480000007', '+12480000008' )))  
    )  
  
  
EXPLAIN (ANALYZE, BUFFERS)  
SELECT subscriptions.*  
     , external_id  
FROM subscriptions  
INNER JOIN subscribers  
           ON subscriptions.subscriber_id = subscribers.id  
  AND subscriptions.company_id = subscribers.company_id  
INNER JOIN (  
    SELECT DISTINCT subscriber_id  
  , company_id  
  FROM subscriptions  
    WHERE ((channel = 'EMAIL' AND lower(destination) IN  
  ( 'a@gmail.com', 'b@gmail.com', 'c@gmail.com', 'd@gmail.com', 'e@gmail.com',  
                                    'f@gmail.com', 'g@gmail.com', 'h@gmail.com', 'i@gmail.com' ))  
        OR (channel != 'EMAIL' AND destination IN  
  ( '+12480000000', '+12480000001', '+12480000002', '+12480000003', '+12480000004',  
                                     '+12480000005', '+12480000006', '+12480000007', '+12480000008' )))  
    ) exist  
           ON subscriptions.subscriber_id = exist.subscriber_id  
  AND subscriptions.company_id = exist.company_id  
WHERE subscriptions.company_id = 123  
  
CREATE INDEX CONCURRENTLY IF NOT EXISTS get_all_subscribers_by_destinations_idx ON subscriptions ( company_id, destination, subscriber_id ) WHERE channel != 'EMAIL' AND subscriber_id IS NOT NULL;  
CREATE INDEX CONCURRENTLY IF NOT EXISTS get_all_subscribers_by_destinations_email_idx ON subscriptions ( company_id, lower(destination), subscriber_id ) WHERE channel = 'EMAIL' AND subscriber_id IS NOT NULL;  
  
CREATE INDEX CONCURRENTLY IF NOT EXISTS subscribers_company_id_id_idx ON subscribers ( company_id, id );  
  
ANALYZE subscriptions;  
  
EXPLAIN (ANALYZE, BUFFERS)  
SELECT subscriptions.company_id  
  , subscriptions.subscriber_id  
  , subscriptions.channel  
  , subscriptions.destination  
  , subscriptions.destination_token  
  , subscriptions.created  
  , subscriptions.updated  
  , subscribers.external_id  
FROM subscriptions  
INNER JOIN subscribers  
           ON subscriptions.subscriber_id = subscribers.id AND subscriptions.company_id = subscribers.company_id  
WHERE subscriptions.subscriber_id = 137137745  
  AND subscriptions.company_id = 1630  
  
  
EXPLAIN (ANALYZE, BUFFERS)  
SELECT subscriptions.*  
     , external_id  
FROM subscriptions  
INNER JOIN subscribers  
           ON subscriber_id = subscribers.id  
  AND subscriptions.company_id = subscribers.company_id  
WHERE subscriptions.subscriber_id IN ( 137137745, 649739629, 649744786 )  
  
DROP INDEX CONCURRENTLY IF EXISTS subscriptions_subscriber_id_idx;  
  
CREATE INDEX CONCURRENTLY IF NOT EXISTS subscriptions_subscriber_id_company_id_idx ON subscriptions ( subscriber_id, company_id );  
DROP INDEX CONCURRENTLY IF EXISTS subscriptions_subscriber_id_idx;  
  
EXPLAIN  
SELECT subscriptions.*  
     , external_id  
FROM subscriptions  
INNER JOIN subscribers  
           ON subscriber_id = subscribers.id AND subscriptions.company_id = subscribers.company_id  
INNER JOIN (  
    SELECT DISTINCT subscriber_id  
  , company_id  
  FROM subscriptions  
    WHERE ((channel = 'EMAIL' AND lower(destination) IN  
  ( '$1@gmail.com', '$2@gmail.com', '$3@gmail.com', '$4@gmail.com', '$5@gmail.com',  
                                    '$6@gmail.com', '$7@gmail.com', '$8@gmail.com', '$9@gmail.com', '$10@gmail.com',  
                                    '$11@gmail.com', '$12@gmail.com', '$13@gmail.com', '$14@gmail.com', '$15@gmail.com',  
                                    '$16@gmail.com', '$17@gmail.com', '$18@gmail.com', '$19@gmail.com', '$20@gmail.com',  
                                    '$21@gmail.com', '$22@gmail.com', '$23@gmail.com', '$24@gmail.com', '$25@gmail.com',  
                                    '$26@gmail.com', '$27@gmail.com', '$28@gmail.com', '$29@gmail.com', '$30@gmail.com',  
                                    '$31@gmail.com', '$32@gmail.com', '$33@gmail.com', '$34@gmail.com', '$35@gmail.com',  
                                    '$36@gmail.com', '$37@gmail.com', '$38@gmail.com',  
                                    '$39@gmail.com', '$40@gmail.com', '$41@gmail.com', '$41@gmail.com' ))  
              )  
    ) exist  
           ON subscriptions.subscriber_id = exist.subscriber_id  
  AND subscriptions.company_id = exist.company_id  
WHERE subscriptions.company_id = 123;  
  
  
EXPLAIN  
SELECT subscriptions.*  
     , external_id  
FROM subscriptions  
INNER JOIN subscribers  
           ON subscriber_id = subscribers.id AND subscriptions.company_id = subscribers.company_id  
WHERE subscriptions.subscriber_id = 4286461350  
  AND subscriptions.company_id = 89735  
  
EXPLAIN (ANALYZE , BUFFERS )  
SELECT *  
FROM subscriptions  
WHERE company_id = 89735  
  AND ((channel = 'TEXT' AND destination IN ('+12480000000')) OR  
  (channel = 'EMAIL' AND lower(destination) IN ( 'a@gmail.com', 'b@gmail.com', 'c@gmail.com', 'd@gmail.com' )))  
  
EXPLAIN (ANALYZE , BUFFERS )  
SELECT *  
FROM subscriptions  
WHERE company_id = 89735  
  AND (channel = 'TEXT' AND destination IN ('+12480000000'))  
ORDER BY created DESC  
  , id DESC  
  
EXPLAIN (ANALYZE , BUFFERS )  
SELECT *  
FROM subscriptions  
WHERE company_id = 89735  
  AND (channel = 'EMAIL' AND lower(destination) IN ( 'a@gmail.com', 'b@gmail.com', 'c@gmail.com', 'd@gmail.com' ))  
  
SELECT c.relname  
  , count(*) AS buffers  
FROM pg_class c  
INNER JOIN pg_buffercache b  
           ON b.relfilenode = c.relfilenode  
INNER JOIN pg_database d  
 ON (b.reldatabase = d.oid AND d.datname = current_database())  
GROUP BY c.relname  
ORDER BY 2 DESC  
LIMIT 10;  
  
  
EXPLAIN  
SELECT subscriptions.*  
     , external_id  
FROM subscriptions  
INNER JOIN subscribers  
           ON subscriber_id = subscribers.id AND subscriptions.company_id = subscribers.company_id  
WHERE subscriptions.company_id = 89735  
  AND subscriptions.subscriber_id IN (  
    SELECT subscriber_id  
  FROM subscriptions  
    WHERE company_id = 89735  
  AND channel = 'EMAIL'  
  AND lower(destination) = lower('a@gmail.com')  
    )  
  
EXPLAIN  
SELECT subscriptions.*  
     , external_id  
FROM subscriptions  
INNER JOIN subscribers  
           ON subscriber_id = subscribers.id AND subscriptions.company_id = subscribers.company_id  
INNER JOIN (  
    SELECT DISTINCT company_id  
  , subscriber_id  
  FROM subscriptions  
    WHERE channel = 'EMAIL'  
  AND lower(destination) = lower('a@gmail.com')  
    ) exists  
 ON exists.company_id = subscribers.company_id  
  AND exists.subscriber_id = subscribers.id  
  
  
EXPLAIN (ANALYZE, BUFFERS)  
SELECT subscriptions.*  
     , external_id  
FROM subscriptions  
INNER JOIN subscribers  
           ON subscriber_id = subscribers.id  
  AND subscriptions.company_id = subscribers.company_id  
INNER JOIN (  
    SELECT DISTINCT subscriber_id  
  , company_id  
  FROM subscriptions  
    WHERE channel = 'EMAIL'  
  AND lower(destination) IN  
  ( 'tmoyer0319@gmail.com', 'pamhealy4@yahoo.com', 'noelscott1375@gmail.com', 'coreynlopez@gmail.com',  
            'teresaapple30@hotmail.com' )  
    ) exist  
           ON subscriptions.subscriber_id = exist.subscriber_id  
  AND subscriptions.company_id = exist.company_id  
WHERE subscriptions.company_id = 97468  
  
  
EXPLAIN (ANALYZE, BUFFERS)  
SELECT subscriptions.*  
     , external_id  
FROM (  
    SELECT DISTINCT subscriber_id  
  , company_id  
  FROM subscriptions  
    WHERE channel = 'EMAIL'  
  AND lower(destination) IN  
  ( 'tmoyer0319@gmail.com', 'pamhealy4@yahoo.com', 'noelscott1375@gmail.com', 'coreynlopez@gmail.com',  
            'teresaapple30@hotmail.com' )  
    ) exist  
INNER JOIN subscriptions  
           ON subscriptions.subscriber_id = exist.subscriber_id  
  AND subscriptions.company_id = exist.company_id  
INNER JOIN subscribers  
           ON exist.subscriber_id = subscribers.id  
  AND subscriptions.company_id = subscribers.company_id  
WHERE subscriptions.company_id = 97468  
  
  
EXPLAIN (ANALYZE, BUFFERS)  
SELECT subscriptions.*  
     , external_id  
FROM subscriptions  
INNER JOIN subscribers  
           ON subscriber_id = subscribers.id  
  AND subscriptions.company_id = subscribers.company_id  
INNER JOIN (  
    SELECT DISTINCT subscriber_id  
  , company_id  
  FROM subscriptions  
    WHERE channel = 'EMAIL'  
  AND lower(destination) IN  
  ( 'tmoyer0319@gmail.com', 'pamhealy4@yahoo.com', 'noelscott1375@gmail.com', 'coreynlopez@gmail.com',  
            'teresaapple30@hotmail.com' )  
    ) exist  
           ON subscriptions.subscriber_id = exist.subscriber_id  
  AND subscriptions.company_id = exist.company_id  
WHERE subscriptions.company_id = 97468  
  
  
EXPLAIN (ANALYZE, BUFFERS)  
SELECT subscriptions.*  
     , external_id  
FROM subscriptions  
INNER JOIN subscribers  
           ON subscriber_id = subscribers.id  
  AND subscriptions.company_id = subscribers.company_id  
WHERE subscriber_id IN (  
    SELECT DISTINCT subscriber_id  
  FROM subscriptions  
    WHERE channel = 'EMAIL'  
  AND lower(destination) IN  
  ( 'tmoyer0319@gmail.com', 'pamhealy4@yahoo.com', 'noelscott1375@gmail.com', 'coreynlopez@gmail.com',  
            'teresaapple30@hotmail.com' )  
      AND subscriptions.company_id = 97468  
  )  
  
  
-- Nested Loop  (cost=5355539.49..5384780.66 rows=208 width=133)  
-- Unique       (cost=4508277.08..4508308.89 rows=188 width=133)  
EXPLAIN  
SELECT subscriptions.*  
     , external_id  
FROM subscriptions  
INNER JOIN subscribers  
           ON subscriber_id = subscribers.id  
  AND subscriptions.company_id = subscribers.company_id  
INNER JOIN (  
    SELECT DISTINCT subscriber_id  
  , company_id  
  FROM subscriptions  
    WHERE channel = 'EMAIL'  
  AND lower(destination) IN  
  ( 'katy.perez17@gmail.com', 'court63824@aol.com', 'bgudbrandson1@gmail.com', 'lowitzki3@gmail.com',  
            'nate.finance@protonmail.com', 'jdcouts23@hotmail.com', 'murphy118@aol.com', 'sbilth@aol.com',  
            'staceymaska@yahoo.com', 'tyler.white007@gmail.com', 'owencarolan4@gmail.com', 'pluapn@gmail.com',  
            'rielly.troyer@proforma.com', 'allie.hutton4@gmail.com', 'fitter1mb2000@yahoo.com', 'rinkcollin@gmail.com',  
            'todd.travis@comcast.net', 'sagilk@yahoo.com', 'mranliker@gmail.com', 'mswendyrm@gmail.com',  
            'kaesynbaker2011@icloud.com', 'billyc40shy@gmail.com', 'zerellam@yahoo.com', 'tomharrisonnz@yahoo.com',  
            'smithhan63@gmail.com' )  
    ) exist  
           ON subscriptions.subscriber_id = exist.subscriber_id  
  AND subscriptions.company_id = exist.company_id  
WHERE subscriptions.company_id = 1418  
;  
  
EXPLAIN  
SELECT subscriber_id  
FROM subscriptions  
WHERE channel = 'EMAIL'  
  AND lower(destination) IN  
  ( 'katy.perez17@gmail.com', 'court63824@aol.com', 'bgudbrandson1@gmail.com', 'lowitzki3@gmail.com',  
        'nate.finance@protonmail.com', 'jdcouts23@hotmail.com', 'murphy118@aol.com', 'sbilth@aol.com',  
        'staceymaska@yahoo.com', 'tyler.white007@gmail.com', 'owencarolan4@gmail.com', 'pluapn@gmail.com',  
        'rielly.troyer@proforma.com', 'allie.hutton4@gmail.com', 'fitter1mb2000@yahoo.com', 'rinkcollin@gmail.com',  
        'todd.travis@comcast.net', 'sagilk@yahoo.com', 'mranliker@gmail.com', 'mswendyrm@gmail.com',  
        'kaesynbaker2011@icloud.com', 'billyc40shy@gmail.com', 'zerellam@yahoo.com', 'tomharrisonnz@yahoo.com',  
        'smithhan63@gmail.com' )  
  AND company_id = 1418;  
  
SELECT subscriptions.*  
     , external_id  
FROM subscriptions  
INNER JOIN subscribers  
           ON subscriber_id = subscribers.id  
  AND subscriptions.company_id = subscribers.company_id  
WHERE subscriptions.subscriber_id IN  
  ( 1616340836, 1616340836, 1616340836, 1614960939, 1614960939, 1614960939, 1615453165, 1615453165, 1615453165,  
        1615785569, 1615785569, 1615785569, 1615847209, 1615847209, 1615847209, 1615659993, 1615659993, 1615659993,  
        1615441285, 1615441285, 1615447337, 1615447337, 1615447337, 1615179549, 1615179549, 1615686870, 1615686870,  
        1615686870, 1615514236, 1615514236, 1615514236, 1616332436, 1616332436, 1616332436, 1616027224, 1616027224,  
        1616027224, 1615173864, 1615173864, 1615173864, 1615654058, 1615654058, 1615654058, 1616583810, 1616583810,  
        1616583810, 1615818295, 1615818295, 1615818295, 1614958214, 1614958214, 1614958214, 1615078522, 1615078522,  
        1615078522, 1616515525, 1616515525, 1616070801, 1616070801, 1616070801, 1783582743, 1615824273, 1615824273,  
        1615824273, 1615086266, 1615086266, 1615086266 )  
  AND subscriptions.company_id = 1418  
  
EXPLAIN  
SELECT *  
FROM subscriptions  
WHERE channel = 'EMAIL'  
  AND lower(destination) = 'court63824@aol.com'  
  
EXPLAIN (ANALYZE, BUFFERS)  
SELECT *  
FROM subscriptions  
WHERE company_id = 491  
  AND channel = 'EMAIL'  
  AND subscription_type = 'MARKETING'  
  AND destination = lower('calebwesolowskisr@gmail.com')  
  
CREATE INDEX CONCURRENTLY IF NOT EXISTS subscriptions_updated_idx ON subscriptions ( updated );  
  
UPDATE subscriptions  
SET id = :id  
WHERE id != :id  
  AND company_id = :companyId  
  AND ((channel = 'EMAIL' AND lower(destination) = lower(:destination)) OR  
  (channel != 'EMAIL' AND destination = :destination))  
  AND channel = :channel  
  AND subscription_type = :subscriptionType  
  
  
WITH rel_set AS  
  (  
             SELECT oid  
  , CASE split_part(split_part(array_to_string(reloptions, ','), 'autovacuum_vacuum_threshold=', 2),  
                                    ',', 1)  
                        WHEN '' THEN NULL  
 ELSE split_part(split_part(array_to_string(reloptions, ','), 'autovacuum_vacuum_threshold=', 2),  
                                        ',', 1)::BIGINT  
 END AS rel_av_vac_threshold  
                  , CASE split_part(split_part(array_to_string(reloptions, ','), 'autovacuum_vacuum_scale_factor=', 2),  
                                    ',', 1)  
                        WHEN '' THEN NULL  
 ELSE split_part(  
                                split_part(array_to_string(reloptions, ','), 'autovacuum_vacuum_scale_factor=', 2), ',',  
                                1)::NUMERIC  
 END AS rel_av_vac_scale_factor  
             FROM pg_class  
             )  
SELECT psut.relname  
  , to_char(psut.last_vacuum, 'YYYY-MM-DD HH24:MI')     AS last_vacuum  
     , to_char(psut.last_autovacuum, 'YYYY-MM-DD HH24:MI') AS last_autovacuum  
     , to_char(c.reltuples, '9G999G999G999')               AS n_tup  
     , to_char(psut.n_dead_tup, '9G999G999G999')           AS dead_tup  
     , to_char(coalesce(rs.rel_av_vac_threshold, current_setting('autovacuum_vacuum_threshold')::BIGINT) +  
               coalesce(rs.rel_av_vac_scale_factor, current_setting('autovacuum_vacuum_scale_factor')::NUMERIC) *  
               c.reltuples, '9G999G999G999')               AS av_threshold  
     , CASE  
 WHEN (coalesce(rs.rel_av_vac_threshold, current_setting('autovacuum_vacuum_threshold')::BIGINT) +  
                 coalesce(rs.rel_av_vac_scale_factor, current_setting('autovacuum_vacuum_scale_factor')::NUMERIC) *  
                 c.reltuples) < psut.n_dead_tup  
  THEN '*'  
  ELSE ''  
  END                                                    AS expect_av  
FROM pg_stat_all_tables psut  
JOIN pg_class c  
 ON psut.relid = c.oid  
JOIN rel_set rs  
     ON psut.relid = rs.oid  
ORDER BY c.reltuples DESC;  
  
  
EXPLAIN  
SELECT *  
FROM subscriptions  
WHERE company_id = 145  
  AND channel = 'EMAIL'  
  AND subscription_type = 'MARKETING'  
  AND destination = 'a@gmai.com'  
  
ANALYZE VERBOSE;  
  
  
  
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS subscriptions_destination_idx ON subscriptions ( destination );  
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS subscriptions_destination_email_idx ON subscriptions ( lower(destination) ) WHERE channel = 'EMAIL';  
  
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS subscriptions_company_id_channel_destination_type_uidx ON subscriptions ( company_id, channel, destination, subscription_type );  
DROP INDEX CONCURRENTLY IF EXISTS subscriptions_destination_company_id_channel_type_uidx;  
  
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS subscriptions_company_id_destination_type_email_uidx ON subscriptions ( company_id, lower(destination), subscription_type ) WHERE channel = 'EMAIL';  
DROP INDEX CONCURRENTLY IF EXISTS subscriptions_destination_company_id_type_email_uidx;  
  
CREATE INDEX CONCURRENTLY IF NOT EXISTS subscriptions_company_id_channel_destination_token_type_idx ON subscriptions ( company_id, channel, destination_token, subscription_type );  
DROP INDEX CONCURRENTLY IF EXISTS subscriptions_destination_token_company_id_channel_type_idx;  
  
SELECT count(*)  
FROM subscriptions;  
  
SELECT max(id)  
FROM subscribers; -- 4302374815  
SELECT max(id)  
FROM subscriptions; -- 11122898756  
  
SELECT nextval('subscribers_id_seq');  
  
SELECT cast(updated AS DATE)  
     , count(*)  
FROM subscriptions  
WHERE id > 11000000000  
GROUP BY 1  
ORDER BY 1;  
  
SELECT table_schema AS db  
     , table_name AS table_name  
  , column_name  
  , data_type AS column_type  
FROM information_schema.columns  
WHERE column_name = 'subscriber_id'  
  AND data_type IN ( 'smallint', 'integer', 'real', 'smallserial', 'serial' )  
  AND table_schema NOT IN ( 'information_schema', 'pg_catalog' );  
  
  
EXPLAIN  
SELECT subscriber_id  
FROM subscriptions  
WHERE channel != 'EMAIL'  
  AND destination IN  
  ( '+16023320200', '+15126897462', '+17272909052', '+19253601089', '+13363802142', '+17326091942', '+16103906470',  
        '+13372308037', '+19126143858', '+17708263858', '+17656391743', '+14092890427', '+18132153058', '+13106287552',  
        '+18587622385', '+19373610688', '+14052450579', '+13398320651', '+15016808981' )  
  AND subscriber_id IS NOT NULL  
 AND subscriptions.company_id = 6960  
  
CREATE INDEX CONCURRENTLY IF NOT EXISTS subscriptions_destination_company_id_idx ON subscriptions ( destination, company_id );  
DROP INDEX CONCURRENTLY IF EXISTS subscriptions_destination_idx;  
  
CREATE INDEX CONCURRENTLY IF NOT EXISTS subscriptions_destination_company_id_email_idx ON subscriptions ( lower(destination), company_id ) WHERE channel = 'EMAIL';  
DROP INDEX CONCURRENTLY IF EXISTS subscriptions_destination_email_idx;  
  
  
SHOW max_parallel_workers_per_gather;  
SET max_parallel_workers_per_gather = 0;  
EXPLAIN (ANALYZE, BUFFERS)  
SELECT *  
FROM subscriptions  
WHERE company_id = 82680  
  AND channel = 'EMAIL'  
  AND subscription_type = 'MARKETING'  
  AND lower(destination) = lower('delgadoluis38@gmail.com');  
  
-- create unique index subscriptions_company_id_destination_type_email_uidx  
--     on public.subscriptions (company_id, lower(destination), subscription_type)  
--     where ((channel)::text = 'EMAIL'::text);  
  
ANALYZE subscribers;  
ANALYZE subscriptions;  
  
  
  
WITH rel_set AS  
  (  
             SELECT oid  
  , CASE split_part(split_part(array_to_string(reloptions, ','), 'autovacuum_vacuum_threshold=', 2),  
                                    ',', 1)  
                        WHEN '' THEN NULL  
 ELSE split_part(split_part(array_to_string(reloptions, ','), 'autovacuum_vacuum_threshold=', 2),  
                                        ',', 1)::BIGINT  
 END AS rel_av_vac_threshold  
                  , CASE split_part(split_part(array_to_string(reloptions, ','), 'autovacuum_vacuum_scale_factor=', 2),  
                                    ',', 1)  
                        WHEN '' THEN NULL  
 ELSE split_part(  
                                split_part(array_to_string(reloptions, ','), 'autovacuum_vacuum_scale_factor=', 2), ',',  
                                1)::NUMERIC  
 END AS rel_av_vac_scale_factor  
             FROM pg_class  
             )  
SELECT psut.relname  
  , to_char(psut.last_vacuum, 'YYYY-MM-DD HH24:MI')     AS last_vacuum  
     , to_char(psut.last_autovacuum, 'YYYY-MM-DD HH24:MI') AS last_autovacuum  
     , to_char(c.reltuples, '9G999G999G999')               AS n_tup  
     , to_char(psut.n_dead_tup, '9G999G999G999')           AS dead_tup  
     , to_char(coalesce(rs.rel_av_vac_threshold, current_setting('autovacuum_vacuum_threshold')::BIGINT) +  
               coalesce(rs.rel_av_vac_scale_factor, current_setting('autovacuum_vacuum_scale_factor')::NUMERIC) *  
               c.reltuples, '9G999G999G999')               AS av_threshold  
     , CASE  
 WHEN (coalesce(rs.rel_av_vac_threshold, current_setting('autovacuum_vacuum_threshold')::BIGINT) +  
                 coalesce(rs.rel_av_vac_scale_factor, current_setting('autovacuum_vacuum_scale_factor')::NUMERIC) *  
                 c.reltuples) < psut.n_dead_tup  
  THEN '*'  
  ELSE ''  
  END                                                    AS expect_av  
FROM pg_stat_all_tables psut  
JOIN pg_class c  
 ON psut.relid = c.oid  
JOIN rel_set rs  
     ON psut.relid = rs.oid  
ORDER BY c.reltuples DESC;  
  
  
SELECT relname AS table_name  
  , n_tup_upd AS total_updates  
     , n_tup_hot_upd AS hot_updates  
     , CASE  
 WHEN n_tup_upd > 0  
  THEN round(100.0 * n_tup_hot_upd / n_tup_upd, 2)  
           ELSE 0  
  END              AS hot_ratio_percentage  
     , *  
FROM pg_stat_user_tables  
WHERE relname = 'subscriptions';  
  
SELECT pg_stat_reset_single_table_counters('subscriptions'::regclass);  
  
SELECT avg_width AS avg_row_size_bytes  
FROM pg_stats  
WHERE tablename = 'subscriptions'  
  AND schemaname = 'public'  
LIMIT 1;  
  
SELECT avg(pg_column_size(t.*)) AS avg_row_size_bytes  
FROM public.subscriptions t  
LIMIT 10000;  
  
SELECT avg(pg_column_size(s.*))  
FROM (  
    SELECT *  
    FROM subscriptions  
    LIMIT 100000  
  ) s  
  
  
-- table level autovacuum  
-- helps UPDATEs  
-- 0.2% of ~6.8bil = ~14mil dead tuples  
-- the more often this runs, the faster it will run  
ALTER TABLE subscribers  
    SET (  
        -- AUTOVACUUM when the dead tuple count is >0.1% (default is >10%), or 4.2mil/4.2bil rows  
  AUTOVACUUM_VACUUM_SCALE_FACTOR = 0.001,  
        -- Don't AUTOVACUUM when the dead tuple count is <10,000 (default is <50)  
  AUTOVACUUM_VACUUM_THRESHOLD = 10000  
  );  
  
ALTER TABLE subscriptions  
    SET (  
        -- AUTOVACUUM when the dead tuple count is >0.1% (default is >10%), or 6.8mil/6.8bil rows  
  AUTOVACUUM_VACUUM_SCALE_FACTOR = 0.001,  
        -- Don't AUTOVACUUM when the dead tuple count is <10,000 (default is <50)  
  AUTOVACUUM_VACUUM_THRESHOLD = 10000  
  );  
  
SELECT category  
  , name  
  , setting  
  , unit  
  , source  
  , min_val  
  , max_val  
  , boot_val  
FROM pg_settings  
WHERE category = 'Autovacuum';  
  
  
  
TABLE  
-LEVEL Autovacuum CONFIGURATION:  
FOR TABLES  
WITH significant UPDATE activity, consider lowering the autovacuum scale factor AND threshold AND setup TABLE LEVEL VACUUM.For example:  
    ALTER TABLE subscriptions SET (AUTOVACUUM_VACUUM_SCALE_FACTOR = 0.002, AUTOVACUUM_VACUUM_THRESHOLD = 50);  
  
This will TRIGGER  
VACUUM operations more frequently TO manage dead tuples effectively.  
  
Key Autovacuum Parameters:  
- AUTOVACUUM_VACUUM_THRESHOLD: Minimum number OF updated/deleted tuples TO TRIGGER  
VACUUM (DEFAULT : 50) - AUTOVACUUM_VACUUM_SCALE_FACTOR: Fraction OF  
TABLE size  
added TO the threshold  
  
AUTOVACUUM_VACUUM_THRESHOLD + AUTOVACUUM_VACUUM_SCALE_FACTOR * number OF tuples  
  
  
SELECT *  
FROM pg_active_session_history;  
  
SHOW MAINTENANCE_WORK_MEM;  
SET MAINTENANCE_WORK_MEM  
  
SHOW shared_buffers;  
-- 22029694  
  
SELECT schemaname  
  , relname  
  , indexrelname  
  , idx_blks_read  
  , idx_blks_hit  
  , round(100.0 * (idx_blks_hit - idx_blks_read) / idx_blks_hit, 2) AS ratio  
FROM pg_statio_user_indexes  
ORDER BY ratio DESC  
  
  
SELECT c.relname  
  , pg_size_pretty(count(*) * 8192)                                    AS buffer_size  
     , pg_size_pretty(pg_relation_size(c.oid))                            AS relation_size  
     , round(100.0 * count(*) / (  
    SELECT setting  
  FROM pg_settings  
    WHERE name = 'shared_buffers'  
  ) :: INTEGER, 2)                                                      AS buffers_percent  
     , round(count(*) * 8192 * 100 / pg_relation_size(c.oid)::NUMERIC, 2) AS relation_percent  
     , CASE  
 WHEN c.relkind = 'r' THEN 'table'  
  WHEN c.relkind = 'i' THEN 'index'  
  WHEN c.relkind = 'S' THEN 'sequence'  
  WHEN c.relkind = 't' THEN 'TOAST table'  
  WHEN c.relkind = 'v' THEN 'view'  
  WHEN c.relkind = 'm' THEN 'materialized view'  
  WHEN c.relkind = 'c' THEN 'composite type'  
  WHEN c.relkind = 'f' THEN 'foreign table'  
  WHEN c.relkind = 'p' THEN 'partitioned table'  
  WHEN c.relkind = 'I' THEN 'partitioned index'  
  ELSE 'Unexpected relkind'  
  END                                                                   AS relation_type  
FROM pg_class c  
INNER JOIN pg_buffercache b  
           ON b.relfilenode = c.relfilenode  
INNER JOIN pg_database d  
 ON (b.reldatabase = d.oid  
  AND d.datname = current_database())  
GROUP BY c.relname  
  , c.oid  
ORDER BY pg_total_relation_size(c.oid) DESC  
LIMIT 10;  
  
  
SELECT c.relname AS table_name  
  , t.relname AS toast_table_name  
     , pg_size_pretty(pg_total_relation_size(t.oid)) AS total_toast_size  
FROM pg_class c  
JOIN pg_class t  
     ON c.reltoastrelid = t.oid  
WHERE c.relkind = 'r' -- 'r' indicates a regular table  
  AND c.reltoastrelid <> 0  
  AND c.relname IN ( 'subscribers', 'subscriptions' )  
ORDER BY pg_total_relation_size(t.oid) DESC;  
  
SELECT c.relname AS table  
  , t.relname AS toast_table  
FROM pg_class c  
JOIN pg_class t  
     ON c.reltoastrelid = t.oid  
WHERE c.relname = 'subscriptions';  
  
  
SELECT attname  
  , attstorage  
FROM pg_attribute  
WHERE attrelid = 'subscriptions'::regclass  
 AND attnum > 0;  
  
  
SELECT relname  
  , toast_blks_read  
  , toast_blks_hit  
FROM pg_statio_user_tables  
WHERE toast_blks_read + toast_blks_hit > 0  
ORDER BY toast_blks_read DESC;  
  
  
-- More accurate bloat estimation  
WITH table_stats AS (  
    SELECT schemaname  
  , relname  
  , n_live_tup  
  , n_dead_tup  
  , pg_relation_size(schemaname || '.' || relname) AS table_bytes  
         , (n_live_tup + n_dead_tup)::NUMERIC             AS total_tuples  
    FROM pg_stat_user_tables  
    WHERE relname = 'user_activities'  
  )  
   , bloat_calc AS (  
    SELECT *  
         , CASE  
 WHEN total_tuples > 0 THEN  
  table_bytes / nullif(total_tuples, 0)  
               ELSE 0  
  END AS bytes_per_tuple  
         , CASE  
 WHEN n_live_tup > 0 THEN  
  table_bytes * (n_dead_tup::NUMERIC / nullif(n_live_tup + n_dead_tup, 0))  
               ELSE 0  
  END AS bloat_bytes  
    FROM table_stats  
    )  
SELECT relname  
  , pg_size_pretty(table_bytes)                          AS current_size  
     , pg_size_pretty(bloat_bytes::BIGINT)                  AS estimated_bloat  
     , round(100 * bloat_bytes / nullif(table_bytes, 0), 2) AS bloat_percent  
     , n_live_tup  
  , n_dead_tup  
FROM bloat_calc;  
  
SELECT *  
FROM pg_available_extensions;  
  
  
SELECT schemaname  
  , relname  
  , indexrelname  
  , idx_scan -- How many times the index was used for a SELECT  
  , idx_tup_read  
  , idx_tup_fetch  
FROM pg_stat_user_indexes  
WHERE relname = 'subscriptions'  
ORDER BY idx_scan ASC;  
  
ALTER TABLE subscriptions  
    SET (FILLFACTOR = 85);  
  
SELECT relname AS table_name  
  , n_tup_ins AS inserts  
     , n_tup_upd AS updates  
     , n_tup_del AS deletes -- Added for context  
  , n_live_tup AS live_rows  
FROM pg_stat_user_tables  
WHERE relname = 'subscriptions';  
  
  
  
UPDATE subscriptions  
SET destination = lower(destination)  
WHERE id BETWEEN 0 AND 0  
  AND channel = 'EMAIL'  
  AND lower(destination) != destination;  
  
  
CREATE OR REPLACE FUNCTION lowercase_email_destination()  
    RETURNS TRIGGER AS  
$$  
BEGIN  
 IF new.channel = 'EMAIL' THEN  
 new.destination = lower(new.destination);  
    END IF;  
    RETURN new;  
END;  
$$ LANGUAGE plpgsql;  
  
CREATE TRIGGER subscriptions_lowercase_email_destination_trg  
    BEFORE INSERT OR UPDATE  
 ON public.subscriptions  
    FOR EACH ROW  
EXECUTE FUNCTION lowercase_email_destination();  
  
SELECT datname  
  , datcollate  
  , datctype  
FROM pg_database;  
  
SELECT nspname  
  , collname  
  , collprovider  
  , colllocale  
FROM pg_collation c  
JOIN pg_namespace n  
     ON n.oid = c.collnamespace  
WHERE collprovider = 'i' -- 'i' stands for ICU  
  AND (colllocale LIKE 'und%' OR colllocale LIKE 'root%');  
  
SELECT lower('ŉ');  
  
  
  
SELECT current_database()  
     , schemaname  
  , tablename  
  , /*reltuples::bigint, relpages::bigint, otta,*/  
  round((CASE WHEN otta = 0 THEN 0.0 ELSE sml.relpages::FLOAT / otta END)::NUMERIC, 1)            AS "table_bloat_ratio"  
     , CASE WHEN relpages < otta THEN 0 ELSE bs * (sml.relpages - otta)::BIGINT END                 AS wastedbytes  
     , pg_size_pretty(CASE WHEN relpages < otta THEN 0 ELSE bs * (sml.relpages - otta)::BIGINT END) AS table_wasted_size  
     , iname                                                                                        AS index_nam  
     , /*ituples::bigint, ipages::bigint, iotta,*/  
  round((CASE WHEN iotta = 0 OR ipages = 0 THEN 0.0 ELSE ipages::FLOAT / iotta END)::NUMERIC,  
          1)                                                                                        AS "Index_bloat_ratio"  
     , CASE WHEN ipages < iotta THEN 0 ELSE bs * (ipages - iotta) END                               AS wastedibytes  
     , pg_size_pretty(CASE WHEN ipages < iotta THEN 0 ELSE bs * (ipages - iotta) ::BIGINT END)      AS index_wasted_size  
FROM (  
    SELECT schemaname  
  , tablename  
  , cc.reltuples  
  , cc.relpages  
  , bs  
         , ceil((cc.reltuples * ((datahdr + ma -  
                                  (CASE WHEN datahdr % ma = 0 THEN ma ELSE datahdr % ma END)) + nullhdr2 + 4)) /  
                (bs - 20::FLOAT))    AS otta  
         , coalesce(c2.relname, '?') AS iname  
         , coalesce(c2.reltuples, 0) AS ituples  
         , coalesce(c2.relpages, 0)  AS ipages  
         , coalesce(ceil((c2.reltuples * (datahdr - 12)) / (bs - 20::FLOAT)),  
                    0)               AS iotta -- very rough approximation, assumes all cols  
  FROM (  
        SELECT ma  
             , bs  
             , schemaname  
  , tablename  
  , (datawidth + (hdr + ma - (CASE WHEN hdr % ma = 0 THEN ma ELSE hdr % ma END)))::NUMERIC     AS datahdr  
             , (maxfracsum * (nullhdr + ma - (CASE WHEN nullhdr % ma = 0 THEN ma ELSE nullhdr % ma END))) AS nullhdr2  
        FROM (  
            SELECT schemaname  
  , tablename  
  , hdr  
                 , ma  
                 , bs  
                 , sum((1 - null_frac) * avg_width) AS datawidth  
                 , max(null_frac)                   AS maxfracsum  
                 , hdr + (  
                SELECT 1 + count(*) / 8  
  FROM pg_stats s2  
                WHERE null_frac <> 0  
  AND s2.schemaname = s.schemaname  
  AND s2.tablename = s.tablename  
  )                                   AS nullhdr  
            FROM pg_stats s  
  , (  
                SELECT (  
                    SELECT current_setting('block_size')::NUMERIC  
  )                                                                               AS bs  
                     , CASE WHEN substring(v, 12, 3) IN ( '8.0', '8.1', '8.2' ) THEN 27 ELSE 23 END AS hdr  
                     , CASE WHEN v ~ 'mingw32' THEN 8 ELSE 4 END                                    AS ma  
                FROM (  
                    SELECT version() AS v  
                    ) AS foo  
                ) AS constants  
            GROUP BY 1  
  , 2  
  , 3  
  , 4  
  , 5  
  ) AS foo  
        ) AS rs  
    JOIN pg_class cc  
         ON cc.relname = rs.tablename  
  JOIN pg_namespace nn  
         ON cc.relnamespace = nn.oid AND nn.nspname = rs.schemaname AND nn.nspname <> 'information_schema'  
  LEFT JOIN pg_index i  
              ON indrelid = cc.oid  
  LEFT JOIN pg_class c2  
              ON c2.oid = i.indexrelid  
  ) AS sml  
ORDER BY wastedbytes DESC;  
  
  
EXPLAIN  
UPDATE subscriptions  
SET destination = lower(destination)  
WHERE id IN (  
    SELECT id  
  FROM subscriptions  
    WHERE id >= 2970000000  
  AND id <= 3000000000  
  AND channel = 'EMAIL'  
  AND lower(destination) != destination  
  --ORDER BY id  
 --LIMIT 3000  )  
RETURNING id;  
  
  
EXPLAIN (ANALYZE, BUFFERS)  
SELECT subscriptions.*  
     , external_id  
FROM subscriptions  
INNER JOIN subscribers  
           ON subscriber_id = subscribers.id AND subscriptions.company_id = subscribers.company_id  
WHERE subscriptions.company_id = 123  
  AND subscriptions.subscriber_id IN (  
    SELECT subscriber_id  
  FROM subscriptions  
    WHERE company_id = 123  
  AND channel = 'EMAIL'  
  AND destination = lower('abc@gmail.com')  
    )
  ```

---

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
<!--stackedit_data:
eyJoaXN0b3J5IjpbLTg0NzM3NTQyMyw1NDg5MDQzNDEsMjAyNj
IzMTQxNiw2MTU0NzU5NjgsMTIwMzMzMzM3OCwtMzc0MzUxNTE2
LC0xNzgzNDkyODUwLC03Njg1NjM0NTZdfQ==
-->