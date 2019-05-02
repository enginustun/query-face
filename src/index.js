import { isFunction } from './utils/function';
import {
  SUPPORTED_QUERIES,
  RETURN_QUERIES_BY_TYPE,
  DEFAULT_QUERY_TYPE,
} from './constants';
/**
 * This is the front-end focused ORM-like query language.
 * @class QueryFace
 * @example
 * import QueryFace from 'query-face';
 * new QueryFace();
 * QueryFace(); // shortened
 * // -----
 * const qf = QueryFace();
 * qf.select('*').from('users');
 */
export default function QueryFace() {
  if (!new.target) {
    return new QueryFace(...arguments);
  }

  /**
   * This is the hidden/private argument to specify instance type.
   * Object instance methods will be calculated based on this type.
   * @memberof QueryFace
   * @private
   * @inner
   * @argument
   */
  let type = arguments[0];

  /**
   * This is the hidden/private argument to specify instance is created by inner query.
   * @memberof QueryFace
   * @private
   * @inner
   * @argument
   * @example
   * qf.where((queryBuilder)=> {
   *  // an inner query instance is created because of this function.
   *  // queryBuilder is new innerQuery instance of QueryFace class.
   * })
   */
  let isInnerQuery = arguments[1];

  if (!RETURN_QUERIES_BY_TYPE[type]) {
    type = DEFAULT_QUERY_TYPE;
  }

  this.getQuery = getQuery;

  /**
   * Query stack that will be filled through class's orm functions
   * @memberof QueryFace
   * @private
   * @inner
   * @constant
   */
  const queryStack = [];

  /**
   * Returns current queryStack array
   * @memberof QueryFace#
   * @function
   * @returns {Array<QueryInfo>}
   */
  function getQuery() {
    return queryStack;
  }

  /**
   * Adds called query to queryStack array as a query information object
   * @memberof QueryFace
   * @private
   * @inner
   * @param {string} $op Current operation
   * @param {Array<any>} $params Operation parameters
   * @param {bool} isInnerOperation Is this operation inner or not
   */
  function extendQuery($op, $params, isInnerOperation) {
    queryStack.push({
      $op,
      ...(isInnerOperation ? { $inner: $params } : { $params }),
    });
  }

  function where() {
    const [queryType, arg1, arg2, arg3] = [...arguments];
    let key, op, value;
    if (arguments.length === 2) {
      if (isFunction(arg1)) {
        extendQuery(
          queryType,
          arg1
            .call(null, new QueryFace(SUPPORTED_QUERIES.__INNER_WHERE, true))
            .getQuery(),
          true
        );
      } else {
        throw new Error(`Parameter must be function`);
      }
    } else if (arguments.length === 3) {
      key = arg1;
      op = '=';
      value = arg2;
      extendQuery(queryType, [key, op, value]);
    } else if (arguments.length === 4) {
      key = arg1;
      op = arg2;
      value = arg3;
      extendQuery(queryType, [key, op, value]);
    }
    return getQueriesByType(queryType);
  }

  const queries = {
    /**
     * Prepares select query informations
     * @memberof QueryFace#
     * @function select
     * @param {...string} columnNames - one or more column names to include result object
     * @returns {QueryFace} instance of this class
     * @example
     * qf.select('*');
     * qf.select('id', 'name');
     */
    [SUPPORTED_QUERIES.SELECT]: function() {
      extendQuery(SUPPORTED_QUERIES.SELECT, [...arguments]);
      return getQueriesByType(SUPPORTED_QUERIES.SELECT);
    },

    /**
     * Prepares select query informations
     * @memberof QueryFace#
     * @function from
     * @param {string} tableName - table name to query
     * @returns {QueryFace} instance of this class
     * @example
     * qf.select('*').from('users');
     */
    [SUPPORTED_QUERIES.FROM]: function(tableName) {
      extendQuery(SUPPORTED_QUERIES.FROM, [tableName]);
      return getQueriesByType(SUPPORTED_QUERIES.FROM);
    },

    /**
     * Prepares select query informations.
     * Parameters can be:
     * <pre>
     * (key, value)
     * (key, operator, value)
     * (innerQueryFunction)
     * </pre>
     * @memberof QueryFace#
     * @function where
     * @param {function()|string} keyOrInnerQueryFunction
     * @param {string} [operatorOrValue==]
     * @param {string|number} [value]
     * @returns {QueryFace} instance of this class
     * @example
     * // function parameter
     * qf.select('*').from('users').where((queryBuilder) => queryBuilder.where('name', 'engin').orWhere('age', '>', 18));
     *
     * // two parameters
     * qf.select('*').from('users').where('name', 'engin'); // equals .where('name', '=', 'engin');
     *
     * //three parameters
     * qf.select('*').from('users').where('age', '>', 18);
     */
    [SUPPORTED_QUERIES.WHERE]: function(key, op, value) {
      return where(SUPPORTED_QUERIES.WHERE, ...arguments);
    },
    [SUPPORTED_QUERIES.AND_WHERE]: function(key, op, value) {
      return where(SUPPORTED_QUERIES.AND_WHERE, ...arguments);
    },
    [SUPPORTED_QUERIES.OR_WHERE]: function(key, op, value) {
      return where(SUPPORTED_QUERIES.OR_WHERE, ...arguments);
    },

    [SUPPORTED_QUERIES.RUN]: () => {
      console.log(getQuery());
    },
  };

  /**
   * Calculates and returns next queries based on last executed query.
   * @memberof QueryFace
   * @private
   * @inner
   * @param {string} type name of current query
   * @returns {QueryFace} instance of QueryFace
   */
  const getQueriesByType = type => {
    // prevent concurrent function calls to avoid break the chain
    Object.keys(SUPPORTED_QUERIES).forEach(
      key => delete this[SUPPORTED_QUERIES[key]]
    );
    (RETURN_QUERIES_BY_TYPE[type] || []).forEach(qType => {
      this[qType] = queries[qType];
    });
    isInnerQuery && delete this[SUPPORTED_QUERIES.RUN];
    return this;
  };

  return getQueriesByType(type);
}
