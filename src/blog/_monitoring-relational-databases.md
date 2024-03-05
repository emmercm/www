---

title: Monitoring Relational Databases
draft: true

---

- Freeable memory % too low
- Connections % too high
- CPU utilization % too high
- Free storage too low
- Read and write latency (if not IOPS provisioned?)
- Read and write IOPS (if provisioned)
- Used network bandwidth % too high
- Replica lag too high
- Postgres: transaction ID is high
- Postgres (pg_stat_user_tables): number of sequential scans vs. index scans
- Postgres (pg_stat_database): number of rows read vs. rows returned
- Postgres (pg_locks, pg_stat_database): locks, deadlocks

aaa

- [https://sysdig.com/blog/monitoring-amazon-rds/](https://sysdig.com/blog/monitoring-amazon-rds/)
- [https://www.bluematador.com/blog/how-to-monitor-amazon-rds-with-cloudwatch](https://www.bluematador.com/blog/how-to-monitor-amazon-rds-with-cloudwatch)
- [https://www.datadoghq.com/blog/aws-rds-postgresql-monitoring/](https://www.datadoghq.com/blog/aws-rds-postgresql-monitoring/)
