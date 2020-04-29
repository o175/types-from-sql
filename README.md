it reads pg connection options from enviroment variables


```
PGPASSWORD=1 PGUSER=1 PGDATABASE=1 PGHOST=1.1.1.1 PGPORT=5432 npx types-from-sql 'select * from table'
```

`-f`  specify glob instead of query:


```
PGPASSWORD=1 PGUSER=1 PGDATABASE=1 PGHOST=1.1.1.1 PGPORT=5432 npx types-from-sql -f ./test/*.sql
```


