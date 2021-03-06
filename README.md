# query-face &middot; [![Build Status](https://travis-ci.org/enginustun/query-face.svg?branch=master)](https://travis-ci.org/enginustun/query-face) ![npm](https://img.shields.io/npm/v/query-face) ![GitHub](https://img.shields.io/github/license/enginustun/query-face)

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
  - [x] whereExists / orWhereExists
  - [x] whereNotExists / orWhereNotExists
  - [x] whereBetween / orWhereBetween
  - [x] whereNotBetween / orWhereNotBetween
  - [x] whereRaw
  -----------------------------------------------
  - [x] innerJoin
  - [x] leftJoin
  - [x] leftOuterJoin
  - [x] rightJoin
  - [x] rightOuterJoin
  - [x] fullOuterJoin
  - [x] crossJoin
  -----------------------------------------------
  - [x] on
  - [x] onIn / andOnIn / orOnIn
  - [x] onNotIn / andOnNotIn / orOnNotIn
  - [x] onNull / andOnNull / orOnNull
  - [x] onNotNull / andOnNotNull / orOnNotNull
  - [x] onExists / andOnExists / orOnExists
  - [x] onNotExists / andOnNotExists / orOnNotExists
  - [x] onBetween / andOnBetween / orOnBetween
  - [x] onNotBetween / andOnNotBetween / orOnNotBetween
  -----------------------------------------------
  - [x] having
  - [x] havingIn
  - [x] havingNotIn
  - [x] havingNull
  - [x] havingNotNull
  - [x] havingExists
  - [x] havingNotExists
  - [x] havingBetween
  - [x] havingNotBetween
  -----------------------------------------------
  - [x] distinct
  - [x] groupBy
  - [x] orderBy
  - [x] offset
  - [x] limit
  - [x] returning
  - [x] count
  - [x] min
  - [x] max
  - [x] sum
  - [x] avg
  - [ ] truncate
  - [x] pluck
  - [x] first
  - [x] columnInfo
  - [x] union
  - [x] unionAll
  - [x] with
  - [x] withRecursive
  - [ ] withSchema
- [x] run  
this is the function that sends query to server.