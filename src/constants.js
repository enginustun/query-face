/**
 * Default query type which is used to initialize query-face module.
 * @constant
 * @private
 * @type {string}
 * @default init
 */
export const DEFAULT_QUERY_TYPE = 'init';

export const SUPPORTED_QUERIES = {
  SELECT: 'select',
  INSERT: 'insert',
  UPDATE: 'update',
  DELETE: 'delete',
  FROM: 'from',
  WHERE: 'where',
  AND_WHERE: 'andWhere',
  OR_WHERE: 'orWhere',
  __INNER_WHERE: 'innerWhere',

  INTO: 'into',

  RUN: 'run',
};

/**
 * Defines which query return which available chain methods after each call.
 * @constant
 * @private
 * @type {Object}
 */
export const RETURN_QUERIES_BY_TYPE = {
  [DEFAULT_QUERY_TYPE]: [
    SUPPORTED_QUERIES.SELECT,
    SUPPORTED_QUERIES.INSERT,
    SUPPORTED_QUERIES.UPDATE,
    SUPPORTED_QUERIES.DELETE,
    SUPPORTED_QUERIES.FROM,
  ],
  [SUPPORTED_QUERIES.SELECT]: [SUPPORTED_QUERIES.FROM],
  [SUPPORTED_QUERIES.FROM]: [SUPPORTED_QUERIES.WHERE, SUPPORTED_QUERIES.RUN],
  [SUPPORTED_QUERIES.WHERE]: [
    SUPPORTED_QUERIES.AND_WHERE,
    SUPPORTED_QUERIES.OR_WHERE,
    SUPPORTED_QUERIES.RUN,
  ],
  [SUPPORTED_QUERIES.AND_WHERE]: [
    SUPPORTED_QUERIES.AND_WHERE,
    SUPPORTED_QUERIES.OR_WHERE,
    SUPPORTED_QUERIES.RUN,
  ],
  [SUPPORTED_QUERIES.OR_WHERE]: [
    SUPPORTED_QUERIES.AND_WHERE,
    SUPPORTED_QUERIES.OR_WHERE,
    SUPPORTED_QUERIES.RUN,
  ],
  [SUPPORTED_QUERIES.__INNER_WHERE]: [SUPPORTED_QUERIES.WHERE],
  [SUPPORTED_QUERIES.INSERT]: [SUPPORTED_QUERIES.INTO],
  [SUPPORTED_QUERIES.INTO]: [SUPPORTED_QUERIES.RUN],
};
