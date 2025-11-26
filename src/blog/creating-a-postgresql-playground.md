---

title: Creating a PostgreSQL REPL Playground in Docker
date: 2022-04-27T22:30:00
permalink: blog/creating-a-postgresql-playground
tags:
- databases
- docker
- postgres

---

It's helpful to have local throwaway environments for rapid development, especially with databases, and creating one for PostgreSQL is a snap with Docker.

REPL is an acronym for "[read-eval-print loop](https://en.wikipedia.org/wiki/Read%E2%80%93eval%E2%80%93print_loop)," a type of interactive shell where users get fast feedback from commands executing one a time.

The two commands you'll need to start a [PostgreSQL](https://www.postgresql.org/) server and then open a console to it are:

```shell
$ docker run --name local-postgres --env POSTGRES_PASSWORD=mysecretpassword --detach postgres:latest
2454844de22b4b6394fdf96aea3eca1dfdd926184f1a7a3c0d6463a46e8aebeb

$ docker exec --interactive --tty local-postgres psql --username postgres
psql (14.2 (Debian 14.2-1.pgdg110+1))
Type "help" for help.

postgres=#
```

The first command will start a server named `local-postgres` in a "detached" mode, meaning it will continue running in the background after the command finishes.

The second command will open an interactive [`psql`](https://www.postgresql.org/docs/current/app-psql.html) console that you can exit from at any time with the `exit` command.

_My recommendation is to change the [`postgres` tag](https://hub.docker.com/_/postgres?tab=tags) from `latest` to whatever version you're running in production, such as `postgres:11.13`._

To stop the `local-postgres` server and delete its data, run the two commands:

```shell
$ docker stop local-postgres
local-postgres

$ docker rm --volumes local-postgres
local-postgres
```

## In one command

I don't trust myself to remember to stop and remove detached Docker containers when I'm done, so here is a single command that will start and stop everything:

```shell
$ bash
CONTAINER_ID=$(docker run --env POSTGRES_PASSWORD=mysecretpassword --detach postgres:latest) &&
    until docker exec "${CONTAINER_ID}" pg_isready ; do sleep 1 ; done &&
    docker exec --interactive --tty "${CONTAINER_ID}" psql --username postgres &&
    docker rm --force --volumes "${CONTAINER_ID}" > /dev/null
```

This starts the server without a name and instead uses the SHA-256-like container ID to:

- Wait for the server to start and be ready to accept connections
- Open an interactive [`psql`](https://www.postgresql.org/docs/current/app-psql.html) console which won't exit until the `exit` command is issued like normal
- Forcefully remove the container and its volumes

## Testing the server

We can run some queries against the [system catalogs](https://www.postgresql.org/docs/current/catalogs.html) to see what kind of default data has been created:

```shell
postgres=# SELECT * FROM pg_catalog.pg_user;
 usename  | usesysid | usecreatedb | usesuper | userepl | usebypassrls |  passwd  | valuntil | useconfig
----------+----------+-------------+----------+---------+--------------+----------+----------+-----------
 postgres |       10 | t           | t        | t       | t            | ******** |          |
(1 row)

postgres=# SELECT * FROM pg_catalog.pg_database;
  oid  |  datname  | datdba | encoding | datcollate |  datctype  | datistemplate | datallowconn | datconnlimit | datlastsysoid | datfrozenxid | datminmxid | dattablespace |               datacl
-------+-----------+--------+----------+------------+------------+---------------+--------------+--------------+---------------+--------------+------------+---------------+-------------------------------------
 13757 | postgres  |     10 |        6 | en_US.utf8 | en_US.utf8 | f             | t            |           -1 |         13756 |          727 |          1 |          1663 |
     1 | template1 |     10 |        6 | en_US.utf8 | en_US.utf8 | t             | t            |           -1 |         13756 |          727 |          1 |          1663 | {=c/postgres,postgres=CTc/postgres}
 13756 | template0 |     10 |        6 | en_US.utf8 | en_US.utf8 | t             | f            |           -1 |         13756 |          727 |          1 |          1663 | {=c/postgres,postgres=CTc/postgres}
(3 rows)

postgres=# SELECT * FROM pg_catalog.pg_namespace;
  oid  |      nspname       | nspowner |               nspacl
-------+--------------------+----------+-------------------------------------
    99 | pg_toast           |       10 |
    11 | pg_catalog         |       10 | {postgres=UC/postgres,=U/postgres}
  2200 | public             |       10 | {postgres=UC/postgres,=UC/postgres}
 13391 | information_schema |       10 | {postgres=UC/postgres,=U/postgres}
(4 rows)
```

And we can add some data ourselves:

```shell
postgres=# CREATE TABLE users (id SERIAL PRIMARY KEY, name VARCHAR NOT NULL);
CREATE TABLE

postgres=# INSERT INTO users (name) VALUES ('Lynette'), ('Ray'), ('Mindy');
INSERT 0 3

postgres=# SELECT * FROM users;
 id |  name
----+---------
  1 | Lynette
  2 | Ray
  3 | Mindy
(3 rows)
```
<!--stackedit_data:
eyJoaXN0b3J5IjpbNzYwMDkxNzQ5XX0=
-->