import {
  RETURN_QUERIES_BY_TYPE,
  SUPPORTED_QUERIES,
  CONST_PREFIX,
} from '../constants';
const qf = require('../index').default;
const fakeData = { name: 'engin', age: 29 };

describe('update', () => {
  it('query has correct functions', () => {
    const queryBuilder = qf().update('users');
    Object.values(RETURN_QUERIES_BY_TYPE[SUPPORTED_QUERIES.UPDATE]).forEach(
      functionName => {
        expect(queryBuilder).toHaveProperty(functionName);
      }
    );
  });
  it('works well', () => {
    const queryBuilder = qf().update('users');
    const query = queryBuilder.getQuery();
    expect(query.length).toBe(1);
    expect(query[0].$op).toBe(SUPPORTED_QUERIES.UPDATE);
    expect(query[0].$params).toEqual([`${CONST_PREFIX}users`]);
  });
  it('with non-string single parameter throws error', () => {
    expect(() => {
      qf().update(fakeData);
    }).toThrowError();
  });
});

describe('set', () => {
  it('query has correct functions', () => {
    const queryBuilder = qf()
      .update('users')
      .set(fakeData);
    Object.values(RETURN_QUERIES_BY_TYPE[SUPPORTED_QUERIES.SET]).forEach(
      functionName => {
        expect(queryBuilder).toHaveProperty(functionName);
      }
    );
  });
  it('works well with single object parameter', () => {
    const queryBuilder = qf()
      .update('users')
      .set(fakeData);
    const query = queryBuilder.getQuery();
    expect(query.length).toBe(2);
    expect(query[1].$op).toBe(SUPPORTED_QUERIES.SET);
    expect(query[1].$params).toEqual([fakeData]);
  });
  it('works well with two parameters', () => {
    const queryBuilder = qf()
      .update('users')
      .set('name', 'engin');
    const query = queryBuilder.getQuery();
    expect(query.length).toBe(2);
    expect(query[1].$op).toBe(SUPPORTED_QUERIES.SET);
    expect(query[1].$params.length).toBe(2);
    expect(query[1].$params).toEqual(['name', 'engin']);
  });
  it('with non-object single parameter throws error', () => {
    expect(() => {
      qf()
        .update('users')
        .set('engin');
    }).toThrowError();
  });
  it('with non-string first parameter throws error for two parameters', () => {
    expect(() => {
      qf()
        .update('users')
        .set(2, 'engin');
    }).toThrowError();
  });
});
