import {
  RETURN_QUERIES_BY_TYPE,
  SUPPORTED_QUERIES,
  CONST_PREFIX,
} from '../constants';
const qf = require('../index').default;
const fakeData = { name: 'engin', age: 28 };
const fakeBulkData = [{ name: 'engin', age: 28 }, { name: 'jon', age: 30 }];
describe('insert', () => {
  it('query has correct functions', () => {
    const queryBuilder = qf().insert(fakeData);
    Object.values(RETURN_QUERIES_BY_TYPE[SUPPORTED_QUERIES.INSERT]).forEach(
      functionName => {
        expect(queryBuilder).toHaveProperty(functionName);
      }
    );
  });
  it('single works well', () => {
    const queryBuilder = qf().insert(fakeData);
    const { query } = queryBuilder.getQuery();
    expect(query.length).toBe(1);
    expect(query[0].$op).toBe(SUPPORTED_QUERIES.INSERT);
    expect(query[0].$params).toEqual([fakeData]);
  });
  it('bulk works well', () => {
    const queryBuilder = qf().insert(fakeBulkData);
    const { query } = queryBuilder.getQuery();
    expect(query.length).toBe(1);
    expect(query[0].$op).toBe(SUPPORTED_QUERIES.INSERT);
    expect(query[0].$params).toEqual([fakeBulkData]);
  });
  it('into works well', () => {
    const queryBuilder = qf()
      .insert(fakeData)
      .into('users');
    const { query } = queryBuilder.getQuery();
    expect(query.length).toBe(2);
    expect(query[1].$op).toBe(SUPPORTED_QUERIES.INTO);
    expect(query[1].$params.length).toBe(1);
    expect(query[1].$params[0]).toBe(`${CONST_PREFIX}users`);
  });
});
