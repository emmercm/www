---

title: Creating a MySQL Playground in Docker
date: 2022-04-27T23:26:00
permalink: blog/creating-a-mysql-playground
tags:
- databases
- docker
- mysql

---

It's helpful to have local throwaway environments for rapid development, especially with databases, and creating one for MySQL is a snap with Docker.

The two commands you'll need to start a [MySQL](https://www.mysql.com/) server and then open a console to it are:

```shell
$ docker run --name local-mysql --env MYSQL_ROOT_PASSWORD=mysecretpassword --detach mysql:latest
4c8a44ad76c2df7923238c28c1393ce91ec5b574f50b9bab62a18adac028556f

$ docker exec --interactive --tty local-mysql mysql --password=mysecretpassword
mysql: [Warning] Using a password on the command line interface can be insecure.
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 14
Server version: 8.0.28 MySQL Community Server - GPL

Copyright (c) 2000, 2022, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql>
```

The first command will start a server named `local-mysql` in a "detached" mode, meaning it will continue running in the background after the command finishes.

The second command will open an interactive [`mysql`](https://dev.mysql.com/doc/refman/8.0/en/mysql.html) console that you can exit from at any time with the `exit` command.

_My recommendation is to change the [`mysql` tag](https://hub.docker.com/_/mysql?tab=tags) from `latest` to whatever version you're running in production, such as `mysql:5.7`._

To stop the `local-mysql` server and delete its data, run the two commands:

```shell
$ docker stop local-mysql
local-mysql

$ docker rm --volumes local-mysql
local-mysql
```

## In one command

I don't trust myself to remember to stop and remove detached Docker containers when I'm done, so here is a single command that will start and stop everything:

```bash
CONTAINER_ID=$(docker run --env MYSQL_ROOT_PASSWORD=mysecretpassword --detach mysql:latest) &&
  docker exec "${CONTAINER_ID}" mysqladmin ping --wait &&
  docker exec --interactive --tty "${CONTAINER_ID}" mysql --password=mysecretpassword &&
  docker rm --force --volumes "${CONTAINER_ID}" > /dev/null
```

This starts the server without a name and instead uses the SHA-256-like container ID to:

- Wait for the server to start and be ready to accept connections
- Open an interactive [`mysql`](https://dev.mysql.com/doc/refman/8.0/en/mysql.html) console which won't exit until the `exit` command is issued like normal
- Forcefully remove the container and its volumes

## Testing the server

We can run some queries against the [grant](https://dev.mysql.com/doc/refman/8.0/en/grant-tables.html) and [metadata tables](https://dev.mysql.com/doc/refman/8.0/en/information-schema.html) to see what kind of default data has been created:

```shell
mysql> SELECT user, host, account_locked, password_expired FROM mysql.user;
+------------------+-----------+----------------+------------------+
| user             | host      | account_locked | password_expired |
+------------------+-----------+----------------+------------------+
| root             | %         | N              | N                |
| mysql.infoschema | localhost | Y              | N                |
| mysql.session    | localhost | Y              | N                |
| mysql.sys        | localhost | Y              | N                |
| root             | localhost | N              | N                |
+------------------+-----------+----------------+------------------+
5 rows in set (0.00 sec)

mysql> SELECT * FROM information_schema.schemata;
+--------------+--------------------+----------------------------+------------------------+----------+--------------------+
| CATALOG_NAME | SCHEMA_NAME        | DEFAULT_CHARACTER_SET_NAME | DEFAULT_COLLATION_NAME | SQL_PATH | DEFAULT_ENCRYPTION |
+--------------+--------------------+----------------------------+------------------------+----------+--------------------+
| def          | mysql              | utf8mb4                    | utf8mb4_0900_ai_ci     |     NULL | NO                 |
| def          | information_schema | utf8                       | utf8_general_ci        |     NULL | NO                 |
| def          | performance_schema | utf8mb4                    | utf8mb4_0900_ai_ci     |     NULL | NO                 |
| def          | sys                | utf8mb4                    | utf8mb4_0900_ai_ci     |     NULL | NO                 |
+--------------+--------------------+----------------------------+------------------------+----------+--------------------+
4 rows in set (0.02 sec)
```

And we can add some data ourselves:

```shell
mysql> use mysql;
Reading table information for completion of table and column names
You can turn off this feature to get a quicker startup with -A

Database changed

mysql> CREATE TABLE users (id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL);
Query OK, 0 rows affected, 1 warning (0.04 sec)

mysql> INSERT INTO users (name) VALUES ('Meredith'), ('Henry'), ('Lola');
Query OK, 3 rows affected (0.00 sec)
Records: 3  Duplicates: 0  Warnings: 0

mysql> SELECT * FROM users;
+----+----------+
| id | name     |
+----+----------+
|  1 | Meredith |
|  2 | Henry    |
|  3 | Lola     |
+----+----------+
3 rows in set (0.00 sec)
```
