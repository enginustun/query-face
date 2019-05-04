import { isFunction } from './utils/function';
import { isObject } from './utils/object';
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
 *
 * // Suggested Usage
 * import qf from 'query-face';
 * qf().select('*').from('users'); // Creates QueryFace instance
 * qf().insert({ name: 'engin', age: 28 }).into('users'); // Creates a new QueryFace instance
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
   * qf().where((queryBuilder)=> {
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
   * @example
   * qf()
   *   .select('*')
   *   .from('users')
   *   .where('user_id', 2)
   *   .getQuery();
   *
   * @example
   * // output
   * [
   *   { "$op": "select", "$params": ["*"] },
   *   { "$op": "from", "$params": ["users"] },
   *   { "$op": "where", "$params": ["user_id", "=", 2] }
   * ]
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
     * Prepares "select" query informations
     * @memberof QueryFace#
     * @function select
     * @param {...string} columnNames - one or more column names to include result object
     * @returns {QueryFace} instance of this class
     * @example
     * qf().select('*');
     * qf().select('id', 'name');
     */
    [SUPPORTED_QUERIES.SELECT]: function() {
      extendQuery(SUPPORTED_QUERIES.SELECT, [...arguments]);
      return getQueriesByType(SUPPORTED_QUERIES.SELECT);
    },

    /**
     * Prepares "select" query informations
     * @memberof QueryFace#
     * @function from
     * @param {string} tableName - table name to query
     * @returns {QueryFace} instance of this class
     * @example
     * qf().select('*').from('users');
     */
    [SUPPORTED_QUERIES.FROM]: function(tableName) {
      extendQuery(SUPPORTED_QUERIES.FROM, [tableName]);
      return getQueriesByType(SUPPORTED_QUERIES.FROM);
    },

    /**
     * Prepares "select" query informations.
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
     * qf().select('*').from('users').where((queryBuilder) => queryBuilder.where('name', 'engin').orWhere('age', '>', 18));
     *
     * // two parameters
     * qf().select('*').from('users').where('name', 'engin'); // equals .where('name', '=', 'engin');
     *
     * //three parameters
     * qf().select('*').from('users').where('age', '>', 18);
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

    /**
     * Prepares "insert" query informations
     * @memberof QueryFace#
     * @function insert
     * @param {Object|Array<Object>} values - values to insert table - { key: value, key: value, ... } | [{ key: value, key: value, ... }, { key: value, key: value, ... }, ...]
     * @returns {QueryFace} instance of this class
     * @example
     * qf().insert({ name: 'engin', age: 28 });
     * qf().insert([{ name: 'engin', age: 28 }, { name: 'jon', age: 30 }]); // bulk insert
     */
    [SUPPORTED_QUERIES.INSERT]: function(values) {
      extendQuery(SUPPORTED_QUERIES.INSERT, [values]);
      return getQueriesByType(SUPPORTED_QUERIES.INSERT, ...arguments);
    },

    /**
     * Prepares "into" query informations
     * @memberof QueryFace#
     * @function into
     * @param {string} tableName - table name to insert values to
     * @returns {QueryFace} instance of this class
     * @example
     * qf().insert({ name: 'engin', age: 28 }).into('users');
     */
    [SUPPORTED_QUERIES.INTO]: function(tableName) {
      extendQuery(SUPPORTED_QUERIES.INTO, [tableName]);
      return getQueriesByType(SUPPORTED_QUERIES.INTO);
    },

    /**
     * Prepares "update" query informations
     * @memberof QueryFace#
     * @function update
     * @param {string} tableName - table name to update values
     * @returns {QueryFace} instance of this class
     * @example
     * qf().update('users');
     */
    [SUPPORTED_QUERIES.UPDATE]: function(tableName) {
      if (typeof tableName !== 'string') {
        throw new Error(
          'tableName parameter must be string for .update(tableName) function'
        );
      }
      extendQuery(SUPPORTED_QUERIES.UPDATE, [tableName]);
      return getQueriesByType(SUPPORTED_QUERIES.UPDATE);
    },

    /**
     * Prepares "set" query informations
     * <pre>
     * (key, value)
     * ({ name: 'engin', age: 28, ... })
     * </pre>
     * <div class="doc-warning">
     *  set() query cannot be directly run because of security reasons. Updating all records is restricted.
     *  <div>
     *    <s>.set('name', 'engin').run()</s>
     *  </div>
     * </div>
     * @memberof QueryFace#
     * @function set
     * @param {string|Object} keyOrData - string key or data object
     * @param {string|number|boolean} [value] - if first parameter is string key, this is required value parameter
     * @returns {QueryFace} instance of this class
     * @example
     * qf().update('users').set('name', 'engin').where(...);
     * qf().update('users').set({ name: 'engin', age: 29 }).where(...);
     */
    [SUPPORTED_QUERIES.SET]: function() {
      if (arguments.length === 1) {
        if (!isObject(arguments[0])) {
          throw new Error(
            'When you pass single parameter to .set(object) function, it must be an object.'
          );
        }
      } else if (arguments.length === 2) {
        if (typeof arguments[0] !== 'string') {
          throw new Error(
            'When you pass two parameters to .set(key, value) function, first parameter must be a string.'
          );
        }
      }
      extendQuery(SUPPORTED_QUERIES.SET, [...arguments]);
      return getQueriesByType(SUPPORTED_QUERIES.SET, ...arguments);
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
