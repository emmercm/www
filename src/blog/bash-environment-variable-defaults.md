---

title: Bash Environment Variable Defaults
date: 2023-04-05T21:21:00
tags:
- shell

---

Bash scripts can set defaults for environment variables that are optionally supplied at execution time.

I was first tipped off to this syntax by [Temporal's](https://temporal.io/) server container [entrypoint](https://github.com/temporalio/docker-builds/blob/7cf2767979265936592641260be57f1b994dfd25/docker/auto-setup.sh). Rather than use CLI arguments that would have to be parsed, the script gets its config from environment variables. This is because it's much easier to configure and read environment variables than CLI arguments with Docker.

But there is still a lot of value with setting variable defaults even when not using Docker.

## Syntax for env vars

Here is a Bash script with two variables, `$GREETING` and `$NAME`, that each have a default value:

```bash
#!/usr/bin/env bash
set -euo pipefail

: "${GREETING:=Hello,}"
: "${NAME:=user}"

echo "${GREETING} ${NAME}"
```

You can probably guess what the expected output will be when we run the script:

```shell
$ ./greeting.sh
Hello, user
```

## Explanation

Let's break down what those two lines are doing.

[`: [arguments]`](https://www.gnu.org/savannah-checkouts/gnu/bash/manual/bash.html#Bourne-Shell-Builtins) is a "do nothing" Bash builtin command that performs argument expansion and always succeeds. Here are some examples:

```shell
$ : echo hello!
(no output because the `echo` command wasn't run)

$ : VAR=foobar
(no output because no command was run)

$ echo $VAR
(empty output because the variable assignment didn't happen)
```

[`${parameter:=word}`](https://www.gnu.org/savannah-checkouts/gnu/bash/manual/bash.html#index-parameter-expansion) is a "shell parameter expansion" that will assign a variable a value if that variable is either unset or null. Here are some examples:

```shell
$ echo $VAR
(empty output because the variable isn't set)

$ echo ${VAR:=default}
default

$ echo $VAR
default

$ VAR=""
($VAR is now set but null)

$ echo ${VAR:=override}
override

$ echo $VAR
override
```

Because the `:` Bash builtin processes parameter expansions, it can be used to default variables:

```shell
$ echo $FOO
(empty output because the variable isn't set)

$ : ${FOO:=default}
(no output)

$ echo $FOO
default
```

## Comparison with `${parameter:-word}`

[`${parameter:-word}`](https://www.gnu.org/savannah-checkouts/gnu/bash/manual/bash.html#index-parameter-expansion) is another shell parameter expansion that could be used to default values. These two commands produce the same result:

```bash
: ${FOO:=default}
```

```bash
FOO="${FOO:-default}"
```

But it's more common to use `${parameter:-word}` without variable assignment like this:

```bash
# Merge the base Git branch into the current branch
git merge --no-edit origin/${GIT_TRUNK:-main}
```

Even though the two expansions can be used to accomplish a lot of the same goals, you probably want to prefer `${parameter:=word}` for a few reasons:

- If you reference the same variable multiple times, you only have to default the value once, avoiding error-prone situations such as:

  ```bash
  #!/usr/bin/env bash
  set -euo pipefail

  docker run --name local-mysql \
    --env MYSQL_ROOT_PASSWORD=mysecretpassword \
    --env MYSQL_DATABASE=${MYSQL_DATABASE:-main} \
    --publish 3306:3306 --detach \
    mysql:latest

  # Helper to make the below commands shorter
  # @param {string} $1 DB name
  # @param {string} $2 Query
  mysql() {
    command mysql --host=127.0.0.1 --port=3306 \
      --user=root --password=mysecretpassword "$1" \
      --execute "$2"
  }

  mysql ${MYSQL_DATABASE:-main} "CREATE TABLE users (id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL);"
  mysql ${MYSQL_DATABASE:-main} "INSERT INTO users (name) VALUES ('Meredith'), ('Henry'), ('Lola');"
  mysql ${MYSQL_DATABASE:-main} "SELECT * FROM users;"
  ```

- Grouping all variable defaults at the top of a Bash script helps increase its readability.

## Examples

Start a Node.js [Express](https://expressjs.com/) server with a local configuration:

```bash
#!/usr/bin/env bash
set -euo pipefail

: "${NODE_ENV:=local}"
: "${DEBUG:=*}"

NODE_ENV="${NODE_ENV}" DEBUG="${DEBUG}" node app.js
```

Start a PostgreSQL server in a Docker container:

```bash
#!/usr/bin/env bash
set -euo pipefail

: "${POSTGRES_USER:=postgres}
: "${POSTGRES_PASSWORD:=postgres}
: "${POSTGRES_DB:=$POSTGRES_USER}"

docker run --name local-postgres \
  --env POSTGRES_USER="${POSTGRES_USER}" \
  --env POSTGRES_PASSWORD="${POSTGRES_PASSWORD}" \
  --env POSTGRES_DB="${POSTGRES_DB}" \
  --publish 5432:5432 --detach \
  postgres:latest
```
