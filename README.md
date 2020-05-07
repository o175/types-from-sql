Works only with Postgres. It reads pg connection options from enviroment variables

Usage:

```
PGPASSWORD=1 PGUSER=1 PGDATABASE=1 PGHOST=1.1.1.1 PGPORT=5432 npx types-from-sql 'select * from table'
```

`-f`  specify glob instead of query, `-fn` to set interface name to filename:

```
PGPASSWORD=1 PGUSER=1 PGDATABASE=1 PGHOST=1.1.1.1 PGPORT=5432 npx types-from-sql -f ./test/*.sql
```

also interface name can be set with directive `@InterfaceName` in comment on top of sql: 

```
 -- @InterfaceName: INotification
select * from table

```

redirect output to interface file with `>` operator:

```
PGPASSWORD=1 PGUSER=1 PGDATABASE=1 PGHOST=1.1.1.1 PGPORT=5432 npx types-from-sql -fn ./test/*.sql
```

See also sql builder with typecheck: https://github.com/xialvjun/ts-sql-plugin#readme

