# query-face

ORM-like query language to get rid of static endpoints.

```
import qf from 'query-face';

qf()
  .select('*')
  .from('posts')
  .where('user_id', 2)
  .run();
```
output query object which will be sent to server you desire:
```json
[
  { "$op": "select", "$params": ["*"] },
  { "$op": "from", "$params": ["posts"] },
  { "$op": "where", "$params": ["user_id", "=", 2] }
]
```

## Documentation

  - [x] [API documentation](https://enginustun.github.io/query-face/)
  - [ ] Tutorials (not started)

## Contributing

Any contributions are welcome.

```
git clone git@github.com:enginustun/query-face.git
npm ci
```

Your development must include:

- Requirement codes
- Test codes

All tests must be passed.

```
npm run test
```

Finish your development and open a PR.

## Roadmap

- [x] Query Generation Core  
chainable query structure is ready.
- Queries
  - [x] select
  - [x] insert
  - [x] update
  - [x] delete
  - [x] from
  -----------------------------------------------
  - [x] where / andWhere / orWhere
  - [x] whereNot / andWhereNot / orWhereNot
  - [x] whereIn / andWhereIn / orWhereIn
  - [x] whereNotIn / andWhereNotIn / orWhereNotIn
  - [x] whereNull / orWhereNull
  - [x] whereNotNull / orWhereNotNull
  - [ ] whereExists / orWhereExists
  - [ ] whereNotExists / orWhereNotExists
  - [ ] whereBetween / orWhereBetween
  - [ ] whereNotBetween / orWhereNotBetween
  - [ ] whereRaw
  -----------------------------------------------
  - [ ] innerJoin
  - [ ] leftJoin
  - [ ] leftOuterJoin
  - [ ] rightJoin
  - [ ] rightOuterJoin
  - [ ] fullOuterJoin
  - [ ] crossJoin
  - [ ] joinRaw
  -----------------------------------------------
  - [ ] onIn
  - [ ] onNotIn
  - [ ] onNull
  - [ ] onNotNull
  - [ ] onExists
  - [ ] onNotExists
  - [ ] onBetween
  - [ ] onNotBetween
  -----------------------------------------------
  - [ ] having
  - [ ] havingIn
  - [ ] havingNotIn
  - [ ] havingNull
  - [ ] havingNotNull
  - [ ] havingExists
  - [ ] havingNotExists
  - [ ] havingBetween
  - [ ] havingNotBetween
  -----------------------------------------------
  - [ ] distinct
  - [ ] groupBy
  - [ ] groupByRaw
  - [ ] orderBy
  - [ ] orderByRaw
  - [ ] offset
  - [ ] limit
  - [ ] returning
  - [ ] count
  - [ ] min
  - [ ] max
  - [ ] sum
  - [ ] avg
  - [ ] increment
  - [ ] decrement
  - [ ] truncate
  - [ ] pluck
  - [ ] first
  - [ ] columnInfo
  - [ ] raw?
- [x] run  
this is the function that sends query to server.