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
  WHERE_NOT: 'whereNot',
  AND_WHERE_NOT: 'andWhereNot',
  OR_WHERE_NOT: 'orWhereNot',
  WHERE_IN: 'whereIn',
  AND_WHERE_IN: 'andWhereIn',
  OR_WHERE_IN: 'orWhereIn',
  WHERE_NOT_IN: 'whereNotIn',
  AND_WHERE_NOT_IN: 'andWhereNotIn',
  OR_WHERE_NOT_IN: 'orWhereNotIn',
  WHERE_NULL: 'whereNull',
  OR_WHERE_NULL: 'orWhereNull',
  WHERE_NOT_NULL: 'whereNotNull',
  OR_WHERE_NOT_NULL: 'orWhereNotNull',
  WHERE_EXISTS: 'whereExists',
  OR_WHERE_EXISTS: 'orWhereExists',
  WHERE_NOT_EXISTS: 'whereNotExists',
  OR_WHERE_NOT_EXISTS: 'orWhereNotExists',
  WHERE_BETWEEN: 'whereBetween',
  OR_WHERE_BETWEEN: 'orWhereBetween',
  WHERE_NOT_BETWEEN: 'whereNotBetween',
  OR_WHERE_NOT_BETWEEN: 'orWhereNotBetween',
  WHERE_RAW: 'whereRaw',
  INNER_JOIN: 'innerJoin',
  LEFT_JOIN: 'leftJoin',
  LEFT_OUTER_JOIN: 'leftOuterJoin',
  RIGHT_JOIN: 'rightJoin',
  RIGHT_OUTER_JOIN: 'rightOuterJoin',
  FULL_OUTER_JOIN: 'fullOuterJoin',
  CROSS_JOIN: 'crossJoin',
  ON: 'on',
  AND_ON: 'andOn',
  OR_ON: 'orOn',
  ON_IN: 'onIn',
  AND_ON_IN: 'andOnIn',
  OR_ON_IN: 'orOnIn',
  ON_NOT_IN: 'onNotIn',
  AND_ON_NOT_IN: 'andOnNotIn',
  OR_ON_NOT_IN: 'orOnNotIn',
  ON_NULL: 'onNull',
  AND_ON_NULL: 'andOnNull',
  OR_ON_NULL: 'orOnNull',
  ON_NOT_NULL: 'onNotNull',
  AND_ON_NOT_NULL: 'andOnNotNull',
  OR_ON_NOT_NULL: 'orOnNotNull',
  ON_EXISTS: 'onExists',
  AND_ON_EXISTS: 'andOnExists',
  OR_ON_EXISTS: 'orOnExists',
  ON_NOT_EXISTS: 'onNotExists',
  AND_ON_NOT_EXISTS: 'andOnNotExists',
  OR_ON_NOT_EXISTS: 'orOnNotExists',
  ON_BETWEEN: 'onBetween',
  AND_ON_BETWEEN: 'andOnBetween',
  OR_ON_BETWEEN: 'orOnBetween',
  ON_NOT_BETWEEN: 'onNotBetween',
  AND_ON_NOT_BETWEEN: 'andOnNotBetween',
  OR_ON_NOT_BETWEEN: 'orOnNotBetween',

  __CALLBACK_WHERE: 'callbackWhere',
  __CALLBACK_WHERE_EXISTS: 'callbackWhereExists',
  __CALLBACK_JOIN_QUERY: 'callbackJoin',

  INTO: 'into',
  SET: 'set',

  RUN: 'run',
};

const WHERE_CHAIN = [
  SUPPORTED_QUERIES.AND_WHERE,
  SUPPORTED_QUERIES.OR_WHERE,
  SUPPORTED_QUERIES.AND_WHERE_NOT,
  SUPPORTED_QUERIES.OR_WHERE_NOT,
  SUPPORTED_QUERIES.AND_WHERE_IN,
  SUPPORTED_QUERIES.OR_WHERE_IN,
  SUPPORTED_QUERIES.AND_WHERE_NOT_IN,
  SUPPORTED_QUERIES.OR_WHERE_NOT_IN,
  SUPPORTED_QUERIES.OR_WHERE_NULL,
  SUPPORTED_QUERIES.OR_WHERE_NOT_NULL,
  SUPPORTED_QUERIES.OR_WHERE_EXISTS,
  SUPPORTED_QUERIES.OR_WHERE_NOT_EXISTS,
  SUPPORTED_QUERIES.OR_WHERE_BETWEEN,
  SUPPORTED_QUERIES.OR_WHERE_NOT_BETWEEN,
  SUPPORTED_QUERIES.RUN,
];

const FROM_CHAIN = [
  SUPPORTED_QUERIES.WHERE,
  SUPPORTED_QUERIES.WHERE_NOT,
  SUPPORTED_QUERIES.WHERE_IN,
  SUPPORTED_QUERIES.WHERE_NOT_IN,
  SUPPORTED_QUERIES.WHERE_NULL,
  SUPPORTED_QUERIES.WHERE_NOT_NULL,
  SUPPORTED_QUERIES.WHERE_EXISTS,
  SUPPORTED_QUERIES.WHERE_NOT_EXISTS,
  SUPPORTED_QUERIES.WHERE_BETWEEN,
  SUPPORTED_QUERIES.WHERE_NOT_BETWEEN,
  SUPPORTED_QUERIES.WHERE_RAW,
  SUPPORTED_QUERIES.INNER_JOIN,
  SUPPORTED_QUERIES.LEFT_JOIN,
  SUPPORTED_QUERIES.LEFT_OUTER_JOIN,
  SUPPORTED_QUERIES.RIGHT_JOIN,
  SUPPORTED_QUERIES.RIGHT_OUTER_JOIN,
  SUPPORTED_QUERIES.FULL_OUTER_JOIN,
  SUPPORTED_QUERIES.CROSS_JOIN,
  SUPPORTED_QUERIES.RUN,
];

const ON_CHAIN = [
  SUPPORTED_QUERIES.AND_ON,
  SUPPORTED_QUERIES.OR_ON,
  SUPPORTED_QUERIES.AND_ON_IN,
  SUPPORTED_QUERIES.OR_ON_IN,
  SUPPORTED_QUERIES.AND_ON_NOT_IN,
  SUPPORTED_QUERIES.OR_ON_NOT_IN,
  SUPPORTED_QUERIES.AND_ON_NULL,
  SUPPORTED_QUERIES.OR_ON_NULL,
  SUPPORTED_QUERIES.AND_ON_NOT_NULL,
  SUPPORTED_QUERIES.OR_ON_NOT_NULL,
  SUPPORTED_QUERIES.AND_ON_EXISTS,
  SUPPORTED_QUERIES.OR_ON_EXISTS,
  SUPPORTED_QUERIES.AND_ON_NOT_EXISTS,
  SUPPORTED_QUERIES.OR_ON_NOT_EXISTS,
  SUPPORTED_QUERIES.AND_ON_BETWEEN,
  SUPPORTED_QUERIES.OR_ON_BETWEEN,
  SUPPORTED_QUERIES.AND_ON_NOT_BETWEEN,
  SUPPORTED_QUERIES.OR_ON_NOT_BETWEEN,
];

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
  [SUPPORTED_QUERIES.FROM]: FROM_CHAIN,
  [SUPPORTED_QUERIES.WHERE]: WHERE_CHAIN,
  [SUPPORTED_QUERIES.AND_WHERE]: WHERE_CHAIN,
  [SUPPORTED_QUERIES.OR_WHERE]: WHERE_CHAIN,
  [SUPPORTED_QUERIES.WHERE_NOT]: WHERE_CHAIN,
  [SUPPORTED_QUERIES.AND_WHERE_NOT]: WHERE_CHAIN,
  [SUPPORTED_QUERIES.OR_WHERE_NOT]: WHERE_CHAIN,
  [SUPPORTED_QUERIES.WHERE_IN]: WHERE_CHAIN,
  [SUPPORTED_QUERIES.WHERE_NOT_IN]: WHERE_CHAIN,
  [SUPPORTED_QUERIES.WHERE_NULL]: WHERE_CHAIN,
  [SUPPORTED_QUERIES.OR_WHERE_NULL]: WHERE_CHAIN,
  [SUPPORTED_QUERIES.WHERE_NOT_NULL]: WHERE_CHAIN,
  [SUPPORTED_QUERIES.OR_WHERE_NOT_NULL]: WHERE_CHAIN,
  [SUPPORTED_QUERIES.WHERE_EXISTS]: WHERE_CHAIN,
  [SUPPORTED_QUERIES.OR_WHERE_EXISTS]: WHERE_CHAIN,
  [SUPPORTED_QUERIES.WHERE_NOT_EXISTS]: WHERE_CHAIN,
  [SUPPORTED_QUERIES.OR_WHERE_NOT_EXISTS]: WHERE_CHAIN,
  [SUPPORTED_QUERIES.WHERE_BETWEEN]: WHERE_CHAIN,
  [SUPPORTED_QUERIES.OR_WHERE_BETWEEN]: WHERE_CHAIN,
  [SUPPORTED_QUERIES.WHERE_NOT_BETWEEN]: WHERE_CHAIN,
  [SUPPORTED_QUERIES.OR_WHERE_NOT_BETWEEN]: WHERE_CHAIN,
  [SUPPORTED_QUERIES.WHERE_RAW]: WHERE_CHAIN,
  [SUPPORTED_QUERIES.INNER_JOIN]: FROM_CHAIN,
  [SUPPORTED_QUERIES.LEFT_JOIN]: FROM_CHAIN,
  [SUPPORTED_QUERIES.LEFT_OUTER_JOIN]: FROM_CHAIN,
  [SUPPORTED_QUERIES.RIGHT_JOIN]: FROM_CHAIN,
  [SUPPORTED_QUERIES.RIGHT_OUTER_JOIN]: FROM_CHAIN,
  [SUPPORTED_QUERIES.FULL_OUTER_JOIN]: FROM_CHAIN,
  [SUPPORTED_QUERIES.CROSS_JOIN]: FROM_CHAIN,
  [SUPPORTED_QUERIES.__CALLBACK_WHERE]: [
    SUPPORTED_QUERIES.WHERE,
    SUPPORTED_QUERIES.WHERE_NOT,
    SUPPORTED_QUERIES.WHERE_IN,
    SUPPORTED_QUERIES.WHERE_NOT_IN,
    SUPPORTED_QUERIES.WHERE_NULL,
    SUPPORTED_QUERIES.WHERE_NOT_NULL,
    SUPPORTED_QUERIES.WHERE_EXISTS,
    SUPPORTED_QUERIES.WHERE_NOT_EXISTS,
    SUPPORTED_QUERIES.WHERE_BETWEEN,
    SUPPORTED_QUERIES.WHERE_NOT_BETWEEN,
    SUPPORTED_QUERIES.WHERE_RAW,
  ],
  [SUPPORTED_QUERIES.__CALLBACK_WHERE_EXISTS]: [
    SUPPORTED_QUERIES.SELECT,
    SUPPORTED_QUERIES.FROM,
  ],
  [SUPPORTED_QUERIES.__CALLBACK_JOIN_QUERY]: [
    SUPPORTED_QUERIES.ON,
    SUPPORTED_QUERIES.ON_IN,
    SUPPORTED_QUERIES.ON_NOT_IN,
    SUPPORTED_QUERIES.ON_NULL,
    SUPPORTED_QUERIES.ON_NOT_NULL,
    SUPPORTED_QUERIES.ON_EXISTS,
    SUPPORTED_QUERIES.ON_NOT_EXISTS,
    SUPPORTED_QUERIES.ON_BETWEEN,
    SUPPORTED_QUERIES.ON_NOT_BETWEEN,
  ],
  [SUPPORTED_QUERIES.ON]: ON_CHAIN,
  [SUPPORTED_QUERIES.AND_ON]: ON_CHAIN,
  [SUPPORTED_QUERIES.OR_ON]: ON_CHAIN,
  [SUPPORTED_QUERIES.ON_IN]: ON_CHAIN,
  [SUPPORTED_QUERIES.AND_ON_IN]: ON_CHAIN,
  [SUPPORTED_QUERIES.OR_ON_IN]: ON_CHAIN,
  [SUPPORTED_QUERIES.ON_NOT_IN]: ON_CHAIN,
  [SUPPORTED_QUERIES.AND_ON_NOT_IN]: ON_CHAIN,
  [SUPPORTED_QUERIES.OR_ON_NOT_IN]: ON_CHAIN,
  [SUPPORTED_QUERIES.ON_NULL]: ON_CHAIN,
  [SUPPORTED_QUERIES.AND_ON_NULL]: ON_CHAIN,
  [SUPPORTED_QUERIES.OR_ON_NULL]: ON_CHAIN,
  [SUPPORTED_QUERIES.ON_NOT_NULL]: ON_CHAIN,
  [SUPPORTED_QUERIES.AND_ON_NOT_NULL]: ON_CHAIN,
  [SUPPORTED_QUERIES.OR_ON_NOT_NULL]: ON_CHAIN,
  [SUPPORTED_QUERIES.ON_EXISTS]: ON_CHAIN,
  [SUPPORTED_QUERIES.AND_ON_EXISTS]: ON_CHAIN,
  [SUPPORTED_QUERIES.OR_ON_EXISTS]: ON_CHAIN,
  [SUPPORTED_QUERIES.ON_NOT_EXISTS]: ON_CHAIN,
  [SUPPORTED_QUERIES.AND_ON_NOT_EXISTS]: ON_CHAIN,
  [SUPPORTED_QUERIES.OR_ON_NOT_EXISTS]: ON_CHAIN,
  [SUPPORTED_QUERIES.ON_BETWEEN]: ON_CHAIN,
  [SUPPORTED_QUERIES.AND_ON_BETWEEN]: ON_CHAIN,
  [SUPPORTED_QUERIES.OR_ON_BETWEEN]: ON_CHAIN,
  [SUPPORTED_QUERIES.ON_NOT_BETWEEN]: ON_CHAIN,
  [SUPPORTED_QUERIES.AND_ON_NOT_BETWEEN]: ON_CHAIN,
  [SUPPORTED_QUERIES.OR_ON_NOT_BETWEEN]: ON_CHAIN,
  [SUPPORTED_QUERIES.INSERT]: [SUPPORTED_QUERIES.INTO],
  [SUPPORTED_QUERIES.INTO]: [SUPPORTED_QUERIES.RUN],
  [SUPPORTED_QUERIES.UPDATE]: [SUPPORTED_QUERIES.SET],
  [SUPPORTED_QUERIES.SET]: [SUPPORTED_QUERIES.WHERE],
  [SUPPORTED_QUERIES.DELETE]: [SUPPORTED_QUERIES.WHERE],
};
