/**
 * Default query type which is used to initialize query-face module.
 * @constant
 * @type {string}
 * @default init
 */
export const DEFAULT_QUERY_TYPE = 'init';

/**
 * Supported query types in library.
 * @constant
 * @type {Object}
 * @property {string} SELECT - select string refers sql query { value: 'select' }
 * @property {string} INSERT - insert string refers sql query { value: 'insert' }
 * @property {string} UPDATE - update string refers sql query { value: 'update' }
 * @property {string} DELETE - delete string refers sql query { value: 'delete' }
 * @property {string} FROM - from string refers sql query { value: 'from' }
 * @property {string} WHERE - where string refers sql query { value: 'where' }
 * @property {string} AND_WHERE - andWhere string refers sql query { value: 'andWhere' }
 * @property {string} OR_WHERE - orWhere string refers sql query { value: 'orWhere' }
 * @property {string} __INNER_WHERE - innerWhere string refers private sql query { value: 'innerWhere' }
 * @property {string} RUN - run string refers function that will send query to server { value: 'run' }
 * @default
 */
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
  RUN: 'run',
};

/**
 * Defines which query return which available chain methods after each call.
 * @constant
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
};
