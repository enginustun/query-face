import {
  DEFAULT_QUERY_TYPE,
  RETURN_QUERIES_BY_TYPE,
  SUPPORTED_QUERIES,
  CONST_PREFIX,
} from '../constants';
let qf;

describe('query-face', () => {
  it('is declared', () => {
    expect(qf).toBeUndefined();
  });
  it('loaded successfully', () => {
    qf = require('../index').default;
    expect(qf).not.toBeNull();
  });
  it('instance is successfully created', () => {
    expect(qf()).toBeInstanceOf(qf);
  });
  it('init instance has correct functions', () => {
    const instance = qf();
    Object.values(RETURN_QUERIES_BY_TYPE[DEFAULT_QUERY_TYPE]).forEach(
      functionName => {
        expect(instance).toHaveProperty(functionName);
      }
    );
  });
  it(`select query generated successfully`, () => {
    const instance = qf();
    instance.select('*');
    const query = instance.getQuery();
    expect(query.length).toBe(1);
    expect(query[0].$op).toBe(SUPPORTED_QUERIES.SELECT);
    expect(query[0].$params.length).toBe(1);
    expect(query[0].$params[0]).toBe(`${CONST_PREFIX}*`);
  });
});
