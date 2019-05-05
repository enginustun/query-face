import { RETURN_QUERIES_BY_TYPE, SUPPORTED_QUERIES } from '../constants';
const qf = require('../index').default;
const fakeData = { name: 'engin', age: 29 };

describe('delete', () => {
  it('query has correct functions', () => {
    const queryBuilder = qf().delete('users');
    Object.values(RETURN_QUERIES_BY_TYPE[SUPPORTED_QUERIES.DELETE]).forEach(
      functionName => {
        expect(queryBuilder).toHaveProperty(functionName);
      }
    );
  });
  it('works well', () => {
    const queryBuilder = qf().delete('users');
    const query = queryBuilder.getQuery();
    expect(query.length).toBe(1);
    expect(query[0].$op).toBe(SUPPORTED_QUERIES.DELETE);
    expect(query[0].$params).toEqual(['users']);
  });
  it('with non-string single parameter throws error', () => {
    expect(() => {
      qf().delete(fakeData);
    }).toThrowError();
  });
});
