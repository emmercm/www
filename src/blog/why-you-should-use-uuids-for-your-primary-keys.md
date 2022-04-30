---

title: Why You Should Use UUIDs for Your Primary Keys
date: 2020-01-31T05:03:00
tags:
- databases

---

[Universally unique identifiers (UUIDs)](https://en.wikipedia.org/wiki/Universally_unique_identifier) are 128-bit (16-byte) numbers that are designed to be globally unique, and as a result they make for great primary keys.

## Background

UUIDs are 128-bit numbers, but they're usually represented as 32 hexadecimal digits displayed in 5 groups separated by hyphens in the form `8-4-4-4-12`.

Here's some example v1 UUIDs:

- `162c4158-43b8-11ea-b77f-2e728ce88125`
- `42516948-43b8-11ea-b77f-2e728ce88125`
- `8327262e-43b8-11ea-b77f-2e728ce88125`

You can tell they're v1 from the leading "1" in the `11ea` group.

## Database support

Most common relational databases (ignoring SQLite) have support for UUIDs:

- MySQL:
  - v4.1.2 (2004) introduced `UUID()` to generate v1 UUID strings (see "[Generating v4 UUIDs in MySQL](/blog/generating-v4-uuids-in-mysql)" for v4 UUIDs)
  - v5.1.20 (2007) introduced `UUID_SHORT()` to generate v1 UUID integers
  - v8.0.0 (2016) introduced `UUID_TO_BIN()`, `BIN_TO_UUID()`, and `IS_UUID()`
- MariaDB:
  - The earliest version of MariaDB is v5.1.38 (2010) which is based on MySQL v5.1.38 which supported `UUID()` and `UUID_SHORT()`
- PostgreSQL:
  - v8.3.0 (2008) added support for `UUID` data type
  - v8.3.0 (2008) introduced the `uuid-ossp` module and its functions such as `uuid_generate_v1()` and `uuid_generate_v4()`
- Oracle:
  - v10.1 (2003) added support for `SYS_GUID()` which is close enough

## Reasons to use UUIDs for primary keys

1. **UUIDs are unique across tables and databases.**

    There's a lot of value in having an identifier refer to only one entity. Having an auto-incrementing ID such as "1234" isn't meaningful on its own, especially in a database with dozens of tables.

2. **UUIDs can be generated before insert time.**

    When inserting multiple related entities to database at the same time it's easier to generate IDs ahead of time instead of needing to: start a transaction, insert the parent entity, return the last inserted row ID, then insert all the other entities.

3. **UUIDs are more portable.**

    Auto-incrementing IDs are only unique to the database and table that they came from. If that data ever needed to be migrated somewhere else, or combined with other data, you're likely to run into collision issues.

4. **Auto-incrementing IDs expose internal information.**

    If you're designing a database for something like e-commerce, using an auto-incrementing ID could accidentally expose things like: how many orders exist in the system, at what rate orders are made, and so on. The same thinking could be applied to user accounts which is even more dangerous. And if that database is supporting a RESTful web service you are likely to end up with endpoints like `/users/:id` that someone might be able to brute force.

    "But primary keys shouldn't be exposed to the front-end!" But you need some kind of ID for the front-end to interact with, so what are you going to use?

5. **Auto-incrementing IDs are difficult in a multi-master system.**

    First, please don't run a multi-master system. But if you do, and you use auto-incrementing IDs, you'll have to contend with sequence generation that doesn't produce collisions.

## Reasons to not use UUIDs for primary keys

UUIDs aren't a magic bullet, there are trade-offs, and it's important to understand them.

1. **UUIDs are larger.**

    16-byte UUIDs are larger than 4-byte integers or 8-byte big integers. There's a storage cost to the primary key, its index, any foreign keys, and any of their indexes. Those larger indexes could have performance implications such as longer time to search and more memory needed to cache.

2. **Many UUIDs aren't ordered.**

    There might be a reason why you need to know what order rows were inserted in, preferably in a way that doesn't change. You could accomplish this with a `created_at` or similar date & time column, but that isn't ideal, and many rows may share the same value.

    Another issue is if your UUID primary key is clustered (InnoDB) there's cost with row re-ordering when inserting random UUIDs.

3. **UUIDs might sort slower.**

    If your UUIDs are being stored as strings they are likely to sort much slower than auto-incrementing IDs.

## Conclusion

Personally I believe the benefits of using UUIDs for primary keys outweigh the costs, but it really depends on the database you're using, the size of your data, and its access patterns.
