---

title: Tunneling a Database Connection with Docker Compose
imageCredit: 'Photo by <a href="https://unsplash.com/@danieljerez">Daniel Jerez</a> on <a href="https://unsplash.com/photos/CD4WHrWio6Q">Unsplash</a>'
date: 2019-08-07T23:57:00

---

I recently had the need to tunnel a database connection from a local Docker container to a remote MySQL server. The AWS RDS instance is inside the same VPC as a bastion host that runs the SSH server. Rather than open the tunnel on the host machine and have the container connect through `host.docker.internal` I thought I'd configure it all in one place with [Docker Compose](https://docs.docker.com/compose/).

## First Option: Tunnel from the Host

Because containers are [intended to be ephemeral](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/#create-ephemeral-containers) an obvious solution is to open a long-running tunnel on the host machine:

```bash
ssh -nNT -L 3306:dev-mysql.abcd1234.us-east-1.rds.amazonaws.com:3306 ubuntu@52.0.0.0
```

And connect to it from within the container:

```bash
MYSQL_PWD=poorpassword mysql --host=host.docker.internal --port=3306 --user=dev --execute "SELECT 1"
```

But I'm a big fan of running fewer commands to achieve the same result.

## Better Option: Docker Compose

We can open the tunnel in a second container in the same network as our application container automatically with Docker Compose.

`docker-compose.yml` config file:

```yaml
version: '3'

services:
  mysql:
    image: alpine:latest
    command: sh -c "apk update && apk add openssh-client && while true; do ssh -i ~/.ssh/secretkey.pem -nNT -L *:3306:dev-mysql.abcd1234.us-east-1.rds.amazonaws.com:3306 ubuntu@52.0.0.0; done"
    volumes:
      - ~/.ssh:/root/.ssh:ro
    expose:
      - 3306

  app:
    image: alpine:latest
    command: sh -c "apk update && apk add mysql-client && MYSQL_PWD=poorpassword --host=mysql --port=3306 --user=dev --execute 'SELECT 1'"
    depends_on:
      - mysql
```

With the command:

```bash
docker-compose up --build
```

I'm using Alpine Linux as the base image for the tunnel because of its small download size (and likeliness you have it cached), but you could choose another base such as Debian.

### SSH Options

Let's break down the options used in the SSH command.

`-i ~/.ssh/secretkey.pem` means we're using the `secretkey.pem` private key file for authentication, and because of the volume mount defined in `docker-compose.yml` it refers to a file of the same location on the host machine.

`-n` redirects stdin from `/dev/null` because we're not running this interactively.

`-N` prevents executing a remote command because we're only forwarding ports.

`-T` disables pseudo-terminal allocation because stdin won't be a terminal in the container.

The connection string `*:3306:dev-mysql.abcd1234.us-east-1.rds.amazonaws.com:3306` follows the [ssh(1)](https://linux.die.net/man/1/ssh) pattern of `[bind_address:]port:host:hostport`:

- `bind_address = *` means allow connections on all network interfaces. Without it you may get an error similar to `ERROR 2002 (HY000): Can't connect to MySQL server on 'mysql' (115)` in the app container.
- `port = 3306` means listen on local port 3306 for connections to forward.
- `host = dev-mysql.abcd1234.us-east-1.rds.amazonaws.com` is the remote RDS instance we want to connect to.
- `hostport = 3306` is the remote port we want to connect to.

And then `ubuntu@52.0.0.0` is the username and IP of the bastion host running an SSH server.

### Other Remote Services

This same solution should work just fine for other services hosted on different ports:

- Postgres (5432)
- MongoDB (27017)
- Redis (6379)
- Memcached (11211)

and so on.
