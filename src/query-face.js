import { isFunction } from './utils/function';
import { isObject } from './utils/object';
import { isNotString } from './utils/string';
import {
  SUPPORTED_QUERIES,
  RETURN_QUERIES_BY_TYPE,
  DEFAULT_QUERY_TYPE,
  CONST_PREFIX,
} from './constants';
import Config from './config';

Config.set({
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  mode: 'cors', // no-cors, cors, *same-origin
  cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
  credentials: 'same-origin', // include, *same-origin, omit
  redirect: 'follow', // manual, *follow, error
  referrer: 'no-referrer', // no-referrer, *client
});

/**
 * @typedef {Object} QueryFaceOptions
 * @property {string} dbName - database name or alias you want to run your query on
 * @property {string} queryName - unique name of query to compare with template on backend
 */

/**
 * This is the base class of query-face library that you can use to create ORM queries for backend with chainable methods.
 * @class QueryFace
 * @param {QueryFaceOptions} options - initial settings of query
 * @example
 * import QueryFace from 'query-face';
 * new QueryFace(options);
 * QueryFace(options); // shortened
 * // -----
 * const qf = QueryFace({ queryName: 'getUsers', dbName: 'myProject' });
 * qf.select('*').from('users');
 *
 * // Suggested Usage
 * import qf from 'query-face';
 * qf({ queryName: 'getUsers', dbName: 'myProject' })
 *   .select('*')
 *   .from('users');
 *
 * qf({ queryName: 'insertUser', dbName: 'myProject' })
 *   .insert({ name: 'engin', age: 28 })
 *   .into('users');
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
   * initial configuration definition if there are any
   */
  const {
    dbName = Config.get('dbName'),
    queryName,
    transaction = false,
    dependent = false,
    responseAlias,
  } = {
    ...arguments[0],
  };

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
    return { dbName, queryName, query: queryStack, responseAlias };
  }

  /**
   * Adds called query to queryStack array as a query information object
   * @memberof QueryFace
   * @private
   * @inner
   * @param {string} $op Current operation
   * @param {Array<any>} $params Operation parameters
   * @param {function}  $callback Is this operation inner or not
   */
  function extendQuery($op, $params, $callback) {
    queryStack.push({
      $op,
      $params,
      ...($callback
        ? {
            $callback: $callback.query || [],
          }
        : {}),
    });
  }

  function where() {
    const [queryType, arg1, arg2, arg3] = [...arguments];
    let column, op, value;
    if (arguments.length === 2) {
      if (isFunction(arg1)) {
        extendQuery(
          queryType,
          [],
          arg1
            .call(null, new QueryFace(SUPPORTED_QUERIES.__CALLBACK_WHERE, true))
            .getQuery()
        );
      } else {
        throw new Error(`${queryType} -> parameter must be function`);
      }
    } else if (arguments.length === 3) {
      column = `${CONST_PREFIX}${arg1}`;
      op = `${CONST_PREFIX}=`;
      value = arg2;
      extendQuery(queryType, [column, op, value]);
    } else if (arguments.length === 4) {
      column = `${CONST_PREFIX}${arg1}`;
      op = `${CONST_PREFIX}${arg2}`;
      value = arg3;
      if (isFunction(arg3)) {
        extendQuery(
          queryType,
          [],
          arg3
            .call(null, new QueryFace(SUPPORTED_QUERIES.__CALLBACK_WHERE, true))
            .getQuery()
        );
      } else {
        extendQuery(queryType, [column, op, value]);
      }
    }
    return getQueriesByType(queryType);
  }

  function whereIn() {
    const [queryType, arg1, arg2] = [...arguments];
    let column, op, value;
    if (arguments.length === 2) {
      if (isFunction(arg1)) {
        throw new Error('whereIn does not support inner query');
      }
    } else if (arguments.length === 3) {
      column = arg1;
      op = 'in';
      value = arg2;
      return where(queryType, column, op, value);
    } else {
      throw new Error(`${queryType} -> parameter count does not match`);
    }
  }

  function whereNotIn() {
    const [queryType, arg1, arg2] = [...arguments];
    let column, op, value;
    if (arguments.length === 2) {
      if (isFunction(arg1)) {
        throw new Error('whereNotIn does not support inner query');
      }
    } else if (arguments.length === 3) {
      column = arg1;
      op = 'not in';
      value = arg2;
      return where(queryType, column, op, value);
    } else {
      throw new Error(`${queryType} -> parameter count does not match`);
    }
  }

  function whereNull() {
    const [queryType, column] = [...arguments];
    if (arguments.length === 2) {
      if (isFunction(column)) {
        throw new Error(`${queryType} does not support inner query`);
      }
      extendQuery(queryType, [`${CONST_PREFIX}${column}`]);
    } else {
      throw new Error(`${queryType} -> parameter count does not match`);
    }
    return getQueriesByType(queryType);
  }

  function whereExists() {
    const [queryType, arg1] = [...arguments];
    if (arguments.length === 2) {
      if (isFunction(arg1)) {
        extendQuery(
          queryType,
          [],
          arg1
            .call(
              null,
              new QueryFace(SUPPORTED_QUERIES.__CALLBACK_WHERE_EXISTS, true)
            )
            .getQuery()
        );
      } else {
        throw new Error(`${queryType} -> parameter must be function`);
      }
    } else {
      throw new Error(`${queryType} -> parameter count does not match`);
    }
    return getQueriesByType(queryType);
  }

  function whereBetween() {
    const [queryType, column, range] = [...arguments];
    if (arguments.length === 3) {
      if (!Array.isArray(range) || range.length !== 2) {
        throw new Error(
          `${queryType} -> second parameter must be a 2-element array: [min, max]`
        );
      }
      extendQuery(queryType, [`${CONST_PREFIX}${column}`, range]);
    } else {
      throw new Error(`${queryType} -> parameter count does not match`);
    }
    return getQueriesByType(queryType);
  }

  function whereRaw() {
    const [queryType, arg1, arg2] = [...arguments];
    let rawQuery, bindings;
    if (arguments.length === 2) {
      if (isFunction(arg1)) {
        throw new Error(`${queryType} -> does not support inner query`);
      }
      rawQuery = arg1;
      extendQuery(queryType, [rawQuery]);
    } else if (arguments.length === 3) {
      if (!Array.isArray(arg2)) {
        throw new Error(`${queryType} -> second parameter must be an array`);
      }
      rawQuery = arg1;
      bindings = arg2;
      extendQuery(queryType, [rawQuery, bindings]);
    } else {
      throw new Error(`${queryType} -> parameter count does not match`);
    }
    return getQueriesByType(queryType);
  }

  function join() {
    const [queryType, tableName, onColumn1OrCallback, onColumn2] = [
      ...arguments,
    ];
    if (arguments.length === 3) {
      if (!isFunction(onColumn1OrCallback)) {
        throw new Error(
          `${queryType} -> when you pass 2 parameters, second parameter must be callback function`
        );
      }
      extendQuery(
        queryType,
        [`${CONST_PREFIX}${tableName}`],
        onColumn1OrCallback
          .call(
            null,
            new QueryFace(SUPPORTED_QUERIES.__CALLBACK_JOIN_QUERY, true)
          )
          .getQuery()
      );
    } else if (arguments.length === 4) {
      extendQuery(queryType, [
        `${CONST_PREFIX}${tableName}`,
        `${CONST_PREFIX}${onColumn1OrCallback}`,
        `${CONST_PREFIX}${onColumn2}`,
      ]);
    } else {
      throw new Error(`${queryType} -> parameter count does not match`);
    }
    return getQueriesByType(queryType);
  }

  function on() {
    const [queryType, column1, op, column2] = [...arguments];
    if (arguments.length === 4) {
      extendQuery(queryType, [
        `${CONST_PREFIX}${column1}`,
        `${CONST_PREFIX}${op}`,
        `${CONST_PREFIX}${column2}`,
      ]);
    } else {
      throw new Error(`${queryType} -> parameter count does not match`);
    }
    return getQueriesByType(queryType);
  }

  function onIn() {
    const [queryType, column, values] = [...arguments];
    if (arguments.length === 3) {
      if (!Array.isArray(values)) {
        throw new Error(`${queryType} -> second parameter must be an array`);
      }
      extendQuery(queryType, [`${CONST_PREFIX}${column}`, values]);
    } else {
      throw new Error(`${queryType} -> parameter count does not match`);
    }
    return getQueriesByType(queryType);
  }

  function onNull() {
    const [queryType, column] = [...arguments];
    if (arguments.length === 2) {
      if (isFunction(column)) {
        throw new Error(`${queryType} does not support inner query`);
      }
      extendQuery(queryType, [`${CONST_PREFIX}${column}`]);
    } else {
      throw new Error(`${queryType} -> parameter count does not match`);
    }
    return getQueriesByType(queryType);
  }

  function orderBy() {
    const [queryType, columns, direction = 'asc'] = [...arguments];
    if (arguments.length === 2) {
      extendQuery(queryType, [columns]);
    } else if (arguments.length === 3) {
      if (isNotString(columns) || isNotString(direction)) {
        throw new Error(
          `${queryType} -> both parameters must be string when you pass 2 parameters`
        );
      }
      extendQuery(queryType, [columns, direction]);
    } else {
      throw new Error(`${queryType} -> parameter count does not match`);
    }
    return getQueriesByType(queryType);
  }

  function limitOffset() {
    const [queryType, limitOrOffset] = [...arguments];
    if (arguments.length === 2) {
      if (!Number.isInteger(limitOrOffset)) {
        throw new Error(`${queryType} -> parameter must be an integer`);
      }
      extendQuery(queryType, [limitOrOffset]);
    } else {
      throw new Error(`${queryType} -> parameter count does not match`);
    }
    return getQueriesByType(queryType);
  }

  function returning() {
    const [queryType, columns] = [...arguments];
    if (arguments.length === 2) {
      if (!Array.isArray(columns) && isNotString(columns)) {
        throw new Error(`${queryType} -> parameter must be an array or string`);
      }
      extendQuery(queryType, [columns]);
    } else {
      throw new Error(
        `${queryType} -> parameter must be a string or string array`
      );
    }
    return getQueriesByType(queryType);
  }

  function aggregate() {
    const [queryType, column] = [...arguments];
    if (arguments.length === 2) {
      if (isNotString(column)) {
        throw new Error(`${queryType} -> column parameter must be string `);
      }
      extendQuery(queryType, [`${CONST_PREFIX}${column}`]);
    } else {
      throw new Error(`${queryType} -> parameter must be a string`);
    }
    return getQueriesByType(queryType);
  }

  function withAll() {
    const [queryType, alias, callback] = [...arguments];
    if (arguments.length === 3) {
      if (isNotString(alias) || !isFunction(callback)) {
        throw new Error(
          `${queryType} -> first parameter must be string, second one must be function`
        );
      }
      extendQuery(
        queryType,
        [alias],
        callback
          .call(
            null,
            new QueryFace(SUPPORTED_QUERIES.__CALLBACK_WHERE_EXISTS, true)
          )
          .getQuery()
      );
    } else {
      throw new Error(`${queryType} -> parameter count does not match`);
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
      extendQuery(
        SUPPORTED_QUERIES.SELECT,
        [...arguments].map(arg => `${CONST_PREFIX}${arg}`)
      );
      return getQueriesByType(SUPPORTED_QUERIES.SELECT);
    },

    /**
     * Prepares "from" query informations
     * @memberof QueryFace#
     * @function from
     * @param {string} tableName - table name to query
     * @returns {QueryFace} instance of this class
     * @example
     * qf().select('*').from('users');
     */
    [SUPPORTED_QUERIES.FROM]: function(tableName) {
      extendQuery(SUPPORTED_QUERIES.FROM, [`${CONST_PREFIX}${tableName}`]);
      return getQueriesByType(SUPPORTED_QUERIES.FROM);
    },

    /**
     * Prepares "where" query informations.
     * <code>~mixed</code>
     * Parameters can be:
     * <pre>
     * (column, value)
     * (column, operator, value)
     * (innerQueryFunction)
     * </pre>
     * @memberof QueryFace#
     * @function where
     * @param {function()|string} columnOrInnerQueryFunction
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
    [SUPPORTED_QUERIES.WHERE]: function(column, op, value) {
      return where(SUPPORTED_QUERIES.WHERE, ...arguments);
    },
    [SUPPORTED_QUERIES.AND_WHERE]: function(column, op, value) {
      return where(SUPPORTED_QUERIES.AND_WHERE, ...arguments);
    },
    [SUPPORTED_QUERIES.OR_WHERE]: function(column, op, value) {
      return where(SUPPORTED_QUERIES.OR_WHERE, ...arguments);
    },

    /**
     * Prepares "whereNot" query informations.
     * Parameters can be:
     * <pre>
     * (column, value)
     * (column, operator, value)
     * (innerQueryFunction)
     * </pre>
     * @memberof QueryFace#
     * @function whereNot
     * @param {function()|string} columnOrInnerQueryFunction
     * @param {string} [operatorOrValue==]
     * @param {string|number} [value]
     * @returns {QueryFace} instance of this class
     * @example
     * // function parameter
     * qf().select('*').from('users').whereNot((queryBuilder) => queryBuilder.where('name', 'engin').orWhere('age', '>', 18));
     *
     * // two parameters
     * qf().select('*').from('users').whereNot('name', 'engin'); // equals .whereNot('name', '=', 'engin'); or .where('name', '!=', 'engin');
     *
     * //three parameters
     * qf().select('*').from('users').whereNot('age', '>', 18);
     */
    [SUPPORTED_QUERIES.WHERE_NOT]: function(column, op, value) {
      return where(SUPPORTED_QUERIES.WHERE_NOT, ...arguments);
    },
    [SUPPORTED_QUERIES.AND_WHERE_NOT]: function(column, op, value) {
      return where(SUPPORTED_QUERIES.AND_WHERE_NOT, ...arguments);
    },
    [SUPPORTED_QUERIES.OR_WHERE_NOT]: function(column, op, value) {
      return where(SUPPORTED_QUERIES.OR_WHERE_NOT, ...arguments);
    },

    /**
     * Prepares "whereIn" query informations.
     * @memberof QueryFace#
     * @function whereIn
     * @param {string} column - column name to check
     * @param {Array} value - array value to check if given column's value is in it
     * @returns {QueryFace} instance of this class
     * @example
     *
     * qf().select('*').from('users').whereIn('age', [18, 21]);
     * // equals: .where('age', 'in', [18, 21])
     * // output: select `*` from `users` where `age` in (18, 21)
     */
    [SUPPORTED_QUERIES.WHERE_IN]: function(column, value) {
      return whereIn(SUPPORTED_QUERIES.WHERE, ...arguments);
    },
    [SUPPORTED_QUERIES.AND_WHERE_IN]: function(column, value) {
      return whereIn(SUPPORTED_QUERIES.AND_WHERE, ...arguments);
    },
    [SUPPORTED_QUERIES.OR_WHERE_IN]: function(column, value) {
      return whereIn(SUPPORTED_QUERIES.OR_WHERE, ...arguments);
    },

    /**
     * Prepares "whereNotIn" query informations.
     * @memberof QueryFace#
     * @function whereNotIn
     * @param {string} column - column name to check
     * @param {Array} value - array value to check if given column's value is not in it
     * @returns {QueryFace} instance of this class
     * @example
     *
     * qf().select('*').from('users').whereNotIn('age', [18, 21]);
     * // equals: .where('age', 'not in', [18, 21])
     * // NOT EQUALS: .whereNot('age', 'in', [18, 21])
     * // output: select `*` from `users` where `age` not in (18, 21)
     */
    [SUPPORTED_QUERIES.WHERE_NOT_IN]: function(column, value) {
      return whereNotIn(SUPPORTED_QUERIES.WHERE, ...arguments);
    },
    [SUPPORTED_QUERIES.AND_WHERE_NOT_IN]: function(column, value) {
      return whereNotIn(SUPPORTED_QUERIES.AND_WHERE, ...arguments);
    },
    [SUPPORTED_QUERIES.OR_WHERE_NOT_IN]: function(column, value) {
      return whereNotIn(SUPPORTED_QUERIES.OR_WHERE, ...arguments);
    },

    /**
     * Prepares "whereNull" query informations.
     * @memberof QueryFace#
     * @function whereNull
     * @param {string} column - column name to check if it is null
     * @returns {QueryFace} instance of this class
     * @example
     *
     * qf().select('*').from('users').whereNull('age');
     * // output: select `*` from `users` where `age` is null
     */
    [SUPPORTED_QUERIES.WHERE_NULL]: function(column) {
      return whereNull(SUPPORTED_QUERIES.WHERE_NULL, ...arguments);
    },
    [SUPPORTED_QUERIES.OR_WHERE_NULL]: function(column) {
      return whereNull(SUPPORTED_QUERIES.OR_WHERE_NULL, ...arguments);
    },

    /**
     * Prepares "whereNotNull" query informations.
     * @memberof QueryFace#
     * @function whereNotNull
     * @param {string} column - column name to check if it is not null
     * @returns {QueryFace} instance of this class
     * @example
     *
     * qf().select('*').from('users').whereNotNull('age');
     * // output: select `*` from `users` where `age` is not null
     */
    [SUPPORTED_QUERIES.WHERE_NOT_NULL]: function(column) {
      return whereNull(SUPPORTED_QUERIES.WHERE_NOT_NULL, ...arguments);
    },
    [SUPPORTED_QUERIES.OR_WHERE_NOT_NULL]: function(column) {
      return whereNull(SUPPORTED_QUERIES.OR_WHERE_NOT_NULL, ...arguments);
    },

    /**
     * Prepares "whereExists" query informations.
     * @memberof QueryFace#
     * @function whereExists
     * @param {function} callback - callback to check if exists
     * @returns {QueryFace} instance of this class
     * @example
     *
     * qf().select('*').from('users').whereExists(queryBuilder =>
     *   queryBuilder.from('tokens').whereRaw('users.id = tokens.user_id')
     * );
     * // output: select `*` from `users` where exists (select * from `tokens` where `users`.`id` = `tokens`.`user_id`)
     */
    [SUPPORTED_QUERIES.WHERE_EXISTS]: function(callback) {
      return whereExists(SUPPORTED_QUERIES.WHERE_EXISTS, ...arguments);
    },
    [SUPPORTED_QUERIES.OR_WHERE_EXISTS]: function(callback) {
      return whereExists(SUPPORTED_QUERIES.OR_WHERE_EXISTS, ...arguments);
    },

    /**
     * Prepares "whereNotExists" query informations.
     * @memberof QueryFace#
     * @function whereNotExists
     * @param {function} callback - callback to check if not exists
     * @returns {QueryFace} instance of this class
     * @example
     *
     * qf().select('*').from('users').whereNotExists(queryBuilder =>
     *   queryBuilder.from('tokens').whereRaw('users.id = tokens.user_id')
     * );
     * // output: select `*` from `users` where not exists (select * from `tokens` where `users`.`id` = `tokens`.`user_id`)
     */
    [SUPPORTED_QUERIES.WHERE_NOT_EXISTS]: function(callback) {
      return whereExists(SUPPORTED_QUERIES.WHERE_NOT_EXISTS, ...arguments);
    },
    [SUPPORTED_QUERIES.OR_WHERE_NOT_EXISTS]: function(callback) {
      return whereExists(SUPPORTED_QUERIES.OR_WHERE_NOT_EXISTS, ...arguments);
    },

    /**
     * Prepares "whereBetween" query informations.
     * @memberof QueryFace#
     * @function whereBetween
     * @param {string} column - column name to check if it is between range
     * @param {Array} range - min and max values to check if given column's value is between them
     * @returns {QueryFace} instance of this class
     * @example
     *
     * qf().select('*').from('users').whereBetween('age', [18, 25]);
     */
    [SUPPORTED_QUERIES.WHERE_BETWEEN]: function(column, range) {
      return whereBetween(SUPPORTED_QUERIES.WHERE_BETWEEN, ...arguments);
    },
    [SUPPORTED_QUERIES.OR_WHERE_BETWEEN]: function(column, range) {
      return whereBetween(SUPPORTED_QUERIES.OR_WHERE_BETWEEN, ...arguments);
    },

    /**
     * Prepares "whereNotBetween" query informations.
     * @memberof QueryFace#
     * @function whereNotBetween
     * @param {string} column - column name to check if it is not between range
     * @param {Array} range - min and max values to check if given column's value is not between them
     * @returns {QueryFace} instance of this class
     * @example
     *
     * qf().select('*').from('users').whereNotBetween('age', [18, 25]);
     */
    [SUPPORTED_QUERIES.WHERE_NOT_BETWEEN]: function(column, range) {
      return whereBetween(SUPPORTED_QUERIES.WHERE_NOT_BETWEEN, ...arguments);
    },
    [SUPPORTED_QUERIES.OR_WHERE_NOT_BETWEEN]: function(column, range) {
      return whereBetween(SUPPORTED_QUERIES.OR_WHERE_NOT_BETWEEN, ...arguments);
    },

    /**
     * Prepares "whereRaw" query informations.
     * @memberof QueryFace#
     * @function whereRaw
     * @param {string} rawQuery - raw query
     * @param {Array} [bindings] - array of parameter values you used in raw query
     * @returns {QueryFace} instance of this class
     * @example
     *
     * qf().select('*').from('users').whereRaw('age = 28');
     * qf().select('*').from('users').whereRaw('age < 25');
     * qf().select('*').from('users').whereRaw('age < ?', [25]);
     * qf().select('*').from('users').whereRaw('age in (18, 27)');
     */
    [SUPPORTED_QUERIES.WHERE_RAW]: function(rawQuery, bindings) {
      return whereRaw(SUPPORTED_QUERIES.WHERE_RAW, ...arguments);
    },

    /**
     * Prepares "innerJoin" query informations.
     * @memberof QueryFace#
     * @function innerJoin
     * @param {string} tableName - table name to perform join operation
     * @param {string|function} onColumn1OrCallback - column name to compare another one or callback function
     * @param {string} [onColumn2] - column name and required if column1 is string column name
     * @returns {QueryFace} instance of this class
     * @example
     *
     * qf().select('*').from('users').innerJoin('tokens', 'users.id', 'tokens.user_id');
     * qf().select('*').from('users').innerJoin('tokens', queryBuilder =>
     *   queryBuilder
     *     .on('users.id', '=', 'tokens.user_id')
     *     .andOn('users.id', '=', 'tokens.creator_id')
     *     .orOn('users.id', '=', 'tokens.owner_id')
     * )
     */
    [SUPPORTED_QUERIES.INNER_JOIN]: function(
      tableName,
      onColumn1OrCallback,
      onColumn2
    ) {
      return join(SUPPORTED_QUERIES.INNER_JOIN, ...arguments);
    },

    /**
     * Prepares "leftJoin" query informations.
     * @memberof QueryFace#
     * @function leftJoin
     * @param {string} tableName - table name to perform join operation
     * @param {string|function} onColumn1OrCallback - column name to compare another one or callback function
     * @param {string} [onColumn2] - column name and required if column1 is string column name
     * @returns {QueryFace} instance of this class
     * @example
     *
     * qf().select('*').from('users').leftJoin('tokens', 'users.id', 'tokens.user_id');
     * qf().select('*').from('users').leftJoin('tokens', queryBuilder =>
     *   queryBuilder
     *     .on('users.id', '=', 'tokens.user_id')
     *     .andOn('users.id', '=', 'tokens.creator_id')
     *     .orOn('users.id', '=', 'tokens.owner_id')
     * )
     */
    [SUPPORTED_QUERIES.LEFT_JOIN]: function(
      tableName,
      onColumn1OrCallback,
      onColumn2
    ) {
      return join(SUPPORTED_QUERIES.LEFT_JOIN, ...arguments);
    },

    /**
     * Prepares "leftOuterJoin" query informations.
     * @memberof QueryFace#
     * @function leftOuterJoin
     * @param {string} tableName - table name to perform join operation
     * @param {string|function} onColumn1OrCallback - column name to compare another one or callback function
     * @param {string} [onColumn2] - column name and required if column1 is string column name
     * @returns {QueryFace} instance of this class
     * @example
     *
     * qf().select('*').from('users').leftOuterJoin('tokens', 'users.id', 'tokens.user_id');
     * qf().select('*').from('users').leftOuterJoin('tokens', queryBuilder =>
     *   queryBuilder
     *     .on('users.id', '=', 'tokens.user_id')
     *     .andOn('users.id', '=', 'tokens.creator_id')
     *     .orOn('users.id', '=', 'tokens.owner_id')
     * )
     */
    [SUPPORTED_QUERIES.LEFT_OUTER_JOIN]: function(
      tableName,
      onColumn1OrCallback,
      onColumn2
    ) {
      return join(SUPPORTED_QUERIES.LEFT_OUTER_JOIN, ...arguments);
    },

    /**
     * Prepares "rightJoin" query informations.
     * @memberof QueryFace#
     * @function rightJoin
     * @param {string} tableName - table name to perform join operation
     * @param {string|function} onColumn1OrCallback - column name to compare another one or callback function
     * @param {string} [onColumn2] - column name and required if column1 is string column name
     * @returns {QueryFace} instance of this class
     * @example
     *
     * qf().select('*').from('users').rightJoin('tokens', 'users.id', 'tokens.user_id');
     * qf().select('*').from('users').rightJoin('tokens', queryBuilder =>
     *   queryBuilder
     *     .on('users.id', '=', 'tokens.user_id')
     *     .andOn('users.id', '=', 'tokens.creator_id')
     *     .orOn('users.id', '=', 'tokens.owner_id')
     * )
     */
    [SUPPORTED_QUERIES.RIGHT_JOIN]: function(
      tableName,
      onColumn1OrCallback,
      onColumn2
    ) {
      return join(SUPPORTED_QUERIES.RIGHT_JOIN, ...arguments);
    },

    /**
     * Prepares "rightOuterJoin" query informations.
     * @memberof QueryFace#
     * @function rightOuterJoin
     * @param {string} tableName - table name to perform join operation
     * @param {string|function} onColumn1OrCallback - column name to compare another one or callback function
     * @param {string} [onColumn2] - column name and required if column1 is string column name
     * @returns {QueryFace} instance of this class
     * @example
     *
     * qf().select('*').from('users').rightOuterJoin('tokens', 'users.id', 'tokens.user_id');
     * qf().select('*').from('users').rightOuterJoin('tokens', queryBuilder =>
     *   queryBuilder
     *     .on('users.id', '=', 'tokens.user_id')
     *     .andOn('users.id', '=', 'tokens.creator_id')
     *     .orOn('users.id', '=', 'tokens.owner_id')
     * )
     */
    [SUPPORTED_QUERIES.RIGHT_OUTER_JOIN]: function(
      tableName,
      onColumn1OrCallback,
      onColumn2
    ) {
      return join(SUPPORTED_QUERIES.RIGHT_OUTER_JOIN, ...arguments);
    },

    /**
     * Prepares "fullOuterJoin" query informations.
     * @memberof QueryFace#
     * @function fullOuterJoin
     * @param {string} tableName - table name to perform join operation
     * @param {string|function} onColumn1OrCallback - column name to compare another one or callback function
     * @param {string} [onColumn2] - column name and required if column1 is string column name
     * @returns {QueryFace} instance of this class
     * @example
     *
     * qf().select('*').from('users').fullOuterJoin('tokens', 'users.id', 'tokens.user_id');
     * qf().select('*').from('users').fullOuterJoin('tokens', queryBuilder =>
     *   queryBuilder
     *     .on('users.id', '=', 'tokens.user_id')
     *     .andOn('users.id', '=', 'tokens.creator_id')
     *     .orOn('users.id', '=', 'tokens.owner_id')
     * )
     */
    [SUPPORTED_QUERIES.FULL_OUTER_JOIN]: function(
      tableName,
      onColumn1OrCallback,
      onColumn2
    ) {
      return join(SUPPORTED_QUERIES.FULL_OUTER_JOIN, ...arguments);
    },

    /**
     * Prepares "crossJoin" query informations.
     * @memberof QueryFace#
     * @function crossJoin
     * @param {string} tableName - table name to perform join operation
     * @param {string|function} onColumn1OrCallback - column name to compare another one or callback function
     * @param {string} [onColumn2] - column name and required if column1 is string column name
     * @returns {QueryFace} instance of this class
     * @example
     *
     * qf().select('*').from('users').crossJoin('tokens', 'users.id', 'tokens.user_id');
     * qf().select('*').from('users').crossJoin('tokens', queryBuilder =>
     *   queryBuilder
     *     .on('users.id', '=', 'tokens.user_id')
     *     .andOn('users.id', '=', 'tokens.creator_id')
     *     .orOn('users.id', '=', 'tokens.owner_id')
     * )
     */
    [SUPPORTED_QUERIES.CROSS_JOIN]: function(
      tableName,
      onColumn1OrCallback,
      onColumn2
    ) {
      return join(SUPPORTED_QUERIES.CROSS_JOIN, ...arguments);
    },

    /**
     * Prepares "on" query informations.
     * @memberof QueryFace#
     * @function on
     * @param {string} column1 - column name to compare another one
     * @param {string} op - comparasion operator
     * @param {string} column2 - column name to compare another one
     * @returns {QueryFace} instance of this class
     * @example
     *
     * qf().select('*').from('users').innerJoin('tokens', 'users.id', 'tokens.user_id');
     * qf().select('*').from('users').innerJoin('tokens', queryBuilder =>
     *   queryBuilder
     *     .on('users.id', '=', 'tokens.user_id')
     *     .andOn('users.id', '=', 'tokens.creator_id')
     *     .orOn('users.id', '=', 'tokens.owner_id')
     * )
     */
    [SUPPORTED_QUERIES.ON]: function(column1, op, column2) {
      return on(SUPPORTED_QUERIES.ON, ...arguments);
    },
    [SUPPORTED_QUERIES.AND_ON]: function(column1, op, column2) {
      return on(SUPPORTED_QUERIES.AND_ON, ...arguments);
    },
    [SUPPORTED_QUERIES.OR_ON]: function(column1, op, column2) {
      return on(SUPPORTED_QUERIES.OR_ON, ...arguments);
    },

    /**
     * Prepares "onIn" query informations.
     * @memberof QueryFace#
     * @function onIn
     * @param {string} column - column name to compare
     * @param {string} values -  array of values to check if given column's value is in it
     * @returns {QueryFace} instance of this class
     * @example
     *
     * qf().select('*').from('users').innerJoin('tokens', queryBuilder =>
     *   queryBuilder
     *     .onIn('tokens.id', [3, 4])
     *     .andOnIn('users.id', [1, 2])
     * )
     */
    [SUPPORTED_QUERIES.ON_IN]: function(column, values) {
      return onIn(SUPPORTED_QUERIES.ON_IN, ...arguments);
    },
    [SUPPORTED_QUERIES.AND_ON_IN]: function(column, values) {
      return onIn(SUPPORTED_QUERIES.AND_ON_IN, ...arguments);
    },
    [SUPPORTED_QUERIES.OR_ON_IN]: function(column, values) {
      return onIn(SUPPORTED_QUERIES.OR_ON_IN, ...arguments);
    },

    /**
     * Prepares "onNotIn" query informations.
     * @memberof QueryFace#
     * @function onNotIn
     * @param {string} column - column name to compare
     * @param {string} values -  array of values to check if given column's value is in it
     * @returns {QueryFace} instance of this class
     * @example
     *
     * qf().select('*').from('users').innerJoin('tokens', queryBuilder =>
     *   queryBuilder
     *     .onNotIn('tokens.id', [3, 4])
     *     .andOnNotIn('users.id', [1, 2])
     * )
     */
    [SUPPORTED_QUERIES.ON_NOT_IN]: function(column, values) {
      return onIn(SUPPORTED_QUERIES.ON_NOT_IN, ...arguments);
    },
    [SUPPORTED_QUERIES.AND_ON_NOT_IN]: function(column, values) {
      return onIn(SUPPORTED_QUERIES.AND_ON_NOT_IN, ...arguments);
    },
    [SUPPORTED_QUERIES.OR_ON_NOT_IN]: function(column, values) {
      return onIn(SUPPORTED_QUERIES.OR_ON_NOT_IN, ...arguments);
    },

    /**
     * Prepares "onNull" query informations.
     * @memberof QueryFace#
     * @function onNull
     * @param {string} column - column name to check if null
     * @returns {QueryFace} instance of this class
     * @example
     *
     * qf().select('*').from('users').innerJoin('tokens', queryBuilder =>
     *   queryBuilder
     *     .onNull('tokens.id')
     *     .orOnNull('users.id')
     * )
     */
    [SUPPORTED_QUERIES.ON_NULL]: function(column) {
      return onNull(SUPPORTED_QUERIES.ON_NULL, ...arguments);
    },
    [SUPPORTED_QUERIES.AND_ON_NULL]: function(column) {
      return onNull(SUPPORTED_QUERIES.AND_ON_NULL, ...arguments);
    },
    [SUPPORTED_QUERIES.OR_ON_NULL]: function(column) {
      return onNull(SUPPORTED_QUERIES.OR_ON_NULL, ...arguments);
    },

    /**
     * Prepares "onNotNull" query informations.
     * @memberof QueryFace#
     * @function onNotNull
     * @param {string} column - column name to check if null
     * @returns {QueryFace} instance of this class
     * @example
     *
     * qf().select('*').from('users').innerJoin('tokens', queryBuilder =>
     *   queryBuilder
     *     .onNotNull('tokens.id')
     *     .orOnNotNull('users.id')
     * )
     */
    [SUPPORTED_QUERIES.ON_NOT_NULL]: function(column) {
      return onNull(SUPPORTED_QUERIES.ON_NOT_NULL, ...arguments);
    },
    [SUPPORTED_QUERIES.AND_ON_NOT_NULL]: function(column) {
      return onNull(SUPPORTED_QUERIES.AND_ON_NOT_NULL, ...arguments);
    },
    [SUPPORTED_QUERIES.OR_ON_NOT_NULL]: function(column) {
      return onNull(SUPPORTED_QUERIES.OR_ON_NOT_NULL, ...arguments);
    },

    /**
     * Prepares "onExists" query informations.
     * @memberof QueryFace#
     * @function onExists
     * @param {string} callback - callback to check on exists
     * @returns {QueryFace} instance of this class
     * @example
     *
     * qf()
     *   .select('*')
     *   .from('users')
     *   .innerJoin('tokens', joinQueryBuilder =>
     *     joinQueryBuilder.onExists(queryBuilder =>
     *       queryBuilder.from('tokens').whereRaw('users.id = tokens.user_id')
     *     )
     *   );
     */
    [SUPPORTED_QUERIES.ON_EXISTS]: function(callback) {
      return whereExists(SUPPORTED_QUERIES.ON_EXISTS, ...arguments);
    },
    [SUPPORTED_QUERIES.AND_ON_EXISTS]: function(callback) {
      return whereExists(SUPPORTED_QUERIES.AND_ON_EXISTS, ...arguments);
    },
    [SUPPORTED_QUERIES.OR_ON_EXISTS]: function(callback) {
      return whereExists(SUPPORTED_QUERIES.OR_ON_EXISTS, ...arguments);
    },

    /**
     * Prepares "onNotExists" query informations.
     * @memberof QueryFace#
     * @function onNotExists
     * @param {string} callback - callback to check on not exists
     * @returns {QueryFace} instance of this class
     * @example
     *
     * qf()
     *   .select('*')
     *   .from('users')
     *   .innerJoin('tokens', joinQueryBuilder =>
     *     joinQueryBuilder.onNotExists(queryBuilder =>
     *       queryBuilder.from('tokens').whereRaw('users.id = tokens.user_id')
     *     )
     *   );
     */
    [SUPPORTED_QUERIES.ON_NOT_EXISTS]: function(callback) {
      return whereExists(SUPPORTED_QUERIES.ON_NOT_EXISTS, ...arguments);
    },
    [SUPPORTED_QUERIES.AND_ON_NOT_EXISTS]: function(callback) {
      return whereExists(SUPPORTED_QUERIES.AND_ON_NOT_EXISTS, ...arguments);
    },
    [SUPPORTED_QUERIES.OR_ON_NOT_EXISTS]: function(callback) {
      return whereExists(SUPPORTED_QUERIES.OR_ON_NOT_EXISTS, ...arguments);
    },

    /**
     * Prepares "onBetween" query informations.
     * @memberof QueryFace#
     * @function onBetween
     * @param {string} column - column name to check if it is between range
     * @param {Array} range - min and max values to check if given column's value is between them
     * @returns {QueryFace} instance of this class
     * @example
     *
     * qf().select('*').from('users').innerJoin('tokens', queryBuilder =>
     *   queryBuilder
     *     .onBetween('users.id', [2, 8])
     * )
     */
    [SUPPORTED_QUERIES.ON_BETWEEN]: function(column, range) {
      return whereBetween(SUPPORTED_QUERIES.ON_BETWEEN, ...arguments);
    },
    [SUPPORTED_QUERIES.AND_ON_BETWEEN]: function(column, range) {
      return whereBetween(SUPPORTED_QUERIES.AND_ON_BETWEEN, ...arguments);
    },
    [SUPPORTED_QUERIES.OR_ON_BETWEEN]: function(column, range) {
      return whereBetween(SUPPORTED_QUERIES.OR_ON_BETWEEN, ...arguments);
    },

    /**
     * Prepares "onNotBetween" query informations.
     * @memberof QueryFace#
     * @function onNotBetween
     * @param {string} column - column name to check if it is not between range
     * @param {Array} range - min and max values to check if given column's value is not between them
     * @returns {QueryFace} instance of this class
     * @example
     *
     * qf().select('*').from('users').innerJoin('tokens', queryBuilder =>
     *   queryBuilder
     *     .onNotBetween('users.id', [2, 8])
     * )
     */
    [SUPPORTED_QUERIES.ON_NOT_BETWEEN]: function(column, range) {
      return whereBetween(SUPPORTED_QUERIES.ON_NOT_BETWEEN, ...arguments);
    },
    [SUPPORTED_QUERIES.AND_ON_NOT_BETWEEN]: function(column, range) {
      return whereBetween(SUPPORTED_QUERIES.AND_ON_NOT_BETWEEN, ...arguments);
    },
    [SUPPORTED_QUERIES.OR_ON_NOT_BETWEEN]: function(column, range) {
      return whereBetween(SUPPORTED_QUERIES.OR_ON_NOT_BETWEEN, ...arguments);
    },

    /**
     * Prepares "having" query informations.
     * @memberof QueryFace#
     * @function having
     * @param {string} column1 - column name to compare another one
     * @param {string} op - comparasion operator
     * @param {string} column2 - column name to compare another one
     * @returns {QueryFace} instance of this class
     * @example
     *
     * qf()
     *   .select('age')
     *   .from('users')
     *   .groupBy('age')
     *   .having('age', '>', 5);
     */
    [SUPPORTED_QUERIES.HAVING]: function(column1, op, column2) {
      return on(SUPPORTED_QUERIES.HAVING, ...arguments);
    },
    [SUPPORTED_QUERIES.AND_HAVING]: function(column1, op, column2) {
      return on(SUPPORTED_QUERIES.AND_HAVING, ...arguments);
    },
    [SUPPORTED_QUERIES.OR_HAVING]: function(column1, op, column2) {
      return on(SUPPORTED_QUERIES.OR_HAVING, ...arguments);
    },

    /**
     * Prepares "havingIn" query informations.
     * @memberof QueryFace#
     * @function havingIn
     * @param {string} column - column name to compare
     * @param {string} values -  array of values to check if given column's value is in it
     * @returns {QueryFace} instance of this class
     * @example
     *
     * qf()
     *   .select('age')
     *   .from('users')
     *   .groupBy('age')
     *   .havingIn('age', [5, 25]);
     */
    [SUPPORTED_QUERIES.HAVING_IN]: function(column, values) {
      return onIn(SUPPORTED_QUERIES.HAVING_IN, ...arguments);
    },
    [SUPPORTED_QUERIES.AND_HAVING_IN]: function(column, values) {
      return onIn(SUPPORTED_QUERIES.AND_HAVING_IN, ...arguments);
    },
    [SUPPORTED_QUERIES.OR_HAVING_IN]: function(column, values) {
      return onIn(SUPPORTED_QUERIES.OR_HAVING_IN, ...arguments);
    },

    /**
     * Prepares "havingNotIn" query informations.
     * @memberof QueryFace#
     * @function havingNotIn
     * @param {string} column - column name to compare
     * @param {string} values -  array of values to check if given column's value is in it
     * @returns {QueryFace} instance of this class
     * @example
     *
     * qf()
     *   .select('age')
     *   .from('users')
     *   .groupBy('age')
     *   .havingNotIn('age', [5, 25]);
     */
    [SUPPORTED_QUERIES.HAVING_NOT_IN]: function(column, values) {
      return onIn(SUPPORTED_QUERIES.HAVING_NOT_IN, ...arguments);
    },
    [SUPPORTED_QUERIES.AND_HAVING_NOT_IN]: function(column, values) {
      return onIn(SUPPORTED_QUERIES.AND_HAVING_NOT_IN, ...arguments);
    },
    [SUPPORTED_QUERIES.OR_HAVING_NOT_IN]: function(column, values) {
      return onIn(SUPPORTED_QUERIES.OR_HAVING_NOT_IN, ...arguments);
    },

    /**
     * Prepares "havingNull" query informations.
     * @memberof QueryFace#
     * @function havingNull
     * @param {string} column - column name to check if null
     * @returns {QueryFace} instance of this class
     * @example
     *
     * qf()
     *   .select('age')
     *   .from('users')
     *   .groupBy('age')
     *   .havingNull('age');
     */
    [SUPPORTED_QUERIES.HAVING_NULL]: function(column) {
      return onNull(SUPPORTED_QUERIES.HAVING_NULL, ...arguments);
    },
    [SUPPORTED_QUERIES.AND_HAVING_NULL]: function(column) {
      return onNull(SUPPORTED_QUERIES.AND_HAVING_NULL, ...arguments);
    },
    [SUPPORTED_QUERIES.OR_HAVING_NULL]: function(column) {
      return onNull(SUPPORTED_QUERIES.OR_HAVING_NULL, ...arguments);
    },

    /**
     * Prepares "havingNotNull" query informations.
     * @memberof QueryFace#
     * @function havingNotNull
     * @param {string} column - column name to check if null
     * @returns {QueryFace} instance of this class
     * @example
     *
     * qf()
     *   .select('age')
     *   .from('users')
     *   .groupBy('age')
     *   .havingNotNull('age');
     */
    [SUPPORTED_QUERIES.HAVING_NOT_NULL]: function(column) {
      return onNull(SUPPORTED_QUERIES.HAVING_NOT_NULL, ...arguments);
    },
    [SUPPORTED_QUERIES.AND_HAVING_NOT_NULL]: function(column) {
      return onNull(SUPPORTED_QUERIES.AND_HAVING_NOT_NULL, ...arguments);
    },
    [SUPPORTED_QUERIES.OR_HAVING_NOT_NULL]: function(column) {
      return onNull(SUPPORTED_QUERIES.OR_HAVING_NOT_NULL, ...arguments);
    },

    /**
     * Prepares "havingExists" query informations.
     * @memberof QueryFace#
     * @function havingExists
     * @param {string} callback - callback to check on exists
     * @returns {QueryFace} instance of this class
     * @example
     *
     * qf()
     *   .select('age')
     *   .from('users')
     *   .groupBy('age')
     *   .havingExists(qb =>
     *     qb.select('*').from('users').whereRaw('age > 10')
     *   );
     */
    [SUPPORTED_QUERIES.HAVING_EXISTS]: function(callback) {
      return whereExists(SUPPORTED_QUERIES.HAVING_EXISTS, ...arguments);
    },
    [SUPPORTED_QUERIES.AND_HAVING_EXISTS]: function(callback) {
      return whereExists(SUPPORTED_QUERIES.AND_HAVING_EXISTS, ...arguments);
    },
    [SUPPORTED_QUERIES.OR_HAVING_EXISTS]: function(callback) {
      return whereExists(SUPPORTED_QUERIES.OR_HAVING_EXISTS, ...arguments);
    },

    /**
     * Prepares "havingNotExists" query informations.
     * @memberof QueryFace#
     * @function havingNotExists
     * @param {string} callback - callback to check on not exists
     * @returns {QueryFace} instance of this class
     * @example
     *
     * qf()
     *   .select('age')
     *   .from('users')
     *   .groupBy('age')
     *   .havingNotExists(qb =>
     *     qb.select('*').from('users').whereRaw('age > 10')
     *   );
     */
    [SUPPORTED_QUERIES.HAVING_NOT_EXISTS]: function(callback) {
      return whereExists(SUPPORTED_QUERIES.HAVING_NOT_EXISTS, ...arguments);
    },
    [SUPPORTED_QUERIES.AND_HAVING_NOT_EXISTS]: function(callback) {
      return whereExists(SUPPORTED_QUERIES.AND_HAVING_NOT_EXISTS, ...arguments);
    },
    [SUPPORTED_QUERIES.OR_HAVING_NOT_EXISTS]: function(callback) {
      return whereExists(SUPPORTED_QUERIES.OR_HAVING_NOT_EXISTS, ...arguments);
    },

    /**
     * Prepares "havingBetween" query informations.
     * @memberof QueryFace#
     * @function havingBetween
     * @param {string} column - column name to check if it is between range
     * @param {Array} range - min and max values to check if given column's value is between them
     * @returns {QueryFace} instance of this class
     * @example
     *
     * qf()
     *   .select('age')
     *   .from('users')
     *   .groupBy('age')
     *   .havingBetween('age', [5, 25]);
     */
    [SUPPORTED_QUERIES.HAVING_BETWEEN]: function(column, range) {
      return whereBetween(SUPPORTED_QUERIES.HAVING_BETWEEN, ...arguments);
    },
    [SUPPORTED_QUERIES.AND_HAVING_BETWEEN]: function(column, range) {
      return whereBetween(SUPPORTED_QUERIES.AND_HAVING_BETWEEN, ...arguments);
    },
    [SUPPORTED_QUERIES.OR_HAVING_BETWEEN]: function(column, range) {
      return whereBetween(SUPPORTED_QUERIES.OR_HAVING_BETWEEN, ...arguments);
    },

    /**
     * Prepares "havingNotBetween" query informations.
     * @memberof QueryFace#
     * @function havingNotBetween
     * @param {string} column - column name to check if it is not between range
     * @param {Array} range - min and max values to check if given column's value is not between them
     * @returns {QueryFace} instance of this class
     * @example
     *
     * qf()
     *   .select('age')
     *   .from('users')
     *   .groupBy('age')
     *   .havingNotBetween('age', [5, 25]);
     */
    [SUPPORTED_QUERIES.HAVING_NOT_BETWEEN]: function(column, range) {
      return whereBetween(SUPPORTED_QUERIES.HAVING_NOT_BETWEEN, ...arguments);
    },
    [SUPPORTED_QUERIES.AND_HAVING_NOT_BETWEEN]: function(column, range) {
      return whereBetween(
        SUPPORTED_QUERIES.AND_HAVING_NOT_BETWEEN,
        ...arguments
      );
    },
    [SUPPORTED_QUERIES.OR_HAVING_NOT_BETWEEN]: function(column, range) {
      return whereBetween(
        SUPPORTED_QUERIES.OR_HAVING_NOT_BETWEEN,
        ...arguments
      );
    },

    /**
     * Prepares "distinct" query informations.
     * @memberof QueryFace#
     * @function distinct
     * @param {...string} [columnNames=*] - column names to get as unique records
     * @returns {QueryFace} instance of this class
     * @example
     *
     * qf()
     *   .distinct('age')
     *   .from('users')
     */
    [SUPPORTED_QUERIES.DISTINCT]: function() {
      extendQuery(SUPPORTED_QUERIES.DISTINCT, [
        ...(!arguments.length ? '*' : arguments),
      ]);
      return getQueriesByType(SUPPORTED_QUERIES.DISTINCT);
    },

    /**
     * Prepares "groupBy" query informations.
     * @memberof QueryFace#
     * @function groupBy
     * @param {string} column - column name to group result
     * @returns {QueryFace} instance of this class
     * @example
     *
     * qf()
     *   .select('age')
     *   .from('users')
     *   .where('age', '>', 15)
     *   .groupBy('age');
     */
    [SUPPORTED_QUERIES.GROUP_BY]: function(column) {
      return aggregate(SUPPORTED_QUERIES.GROUP_BY, ...arguments);
    },

    /**
     * Prepares "orderBy" query informations.
     * @memberof QueryFace#
     * @function orderBy
     * @param {string|Array} columnOrColumns - column name to order result list
     * @param {string} [direction=asc] - order direction
     * @returns {QueryFace} instance of this class
     * @example
     *
     * qf()
     *   .select('age')
     *   .from('users')
     *   .orderBy('age');
     *
     * // multiple column ordering
     * qf()
     *   .select('username', 'age')
     *   .from('users')
     *   .orderBy([
     *     'username', // default order: asc
     *     { column: 'age', order: 'desc' }
     *   ]);
     *
     * // multiple column ordering
     * qf()
     *   .select('username', 'age')
     *   .from('users')
     *   .orderBy([
     *     { column: 'username', order: 'desc' }
     *     { column: 'age', order: 'desc' }
     *   ]);
     */
    [SUPPORTED_QUERIES.ORDER_BY]: function(columns, direction) {
      return orderBy(SUPPORTED_QUERIES.ORDER_BY, ...arguments);
    },

    /**
     * Prepares "limit" query informations.
     * @memberof QueryFace#
     * @function limit
     * @param {number} limit - record count limit
     * @returns {QueryFace} instance of this class
     * @example
     *
     * qf()
     *   .select('*')
     *   .from('users')
     *   .where('age', '>', 15)
     *   .limit(3);
     */
    [SUPPORTED_QUERIES.LIMIT]: function(limit) {
      return limitOffset(SUPPORTED_QUERIES.LIMIT, ...arguments);
    },

    /**
     * Prepares "offset" query informations.
     * @memberof QueryFace#
     * @function offset
     * @param {number} offset - record count to pass off
     * @returns {QueryFace} instance of this class
     * @example
     *
     * qf()
     *   .select('*')
     *   .from('users')
     *   .where('age', '>', 15)
     *   .offset(3);
     *
     * qf()
     *   .select('*')
     *   .from('users')
     *   .where('age', '>', 15)
     *   .limit(2)
     *   .offset(3);
     */
    [SUPPORTED_QUERIES.OFFSET]: function(offset) {
      return limitOffset(SUPPORTED_QUERIES.OFFSET, ...arguments);
    },

    /**
     * Prepares "count" query informations.
     * Performs a count on the specified column
     * @memberof QueryFace#
     * @function count
     * @param {string} column - column name to find its count
     * @returns {QueryFace} instance of this class
     * @example
     *
     * qf()
     *   .from('users')
     *   .count('age');
     */
    [SUPPORTED_QUERIES.COUNT]: function(column) {
      return aggregate(SUPPORTED_QUERIES.COUNT, ...arguments);
    },

    /**
     * Prepares "min" query informations.
     * Performs a min on the specified column
     * @memberof QueryFace#
     * @function min
     * @param {string} column - column name to find its min
     * @returns {QueryFace} instance of this class
     * @example
     *
     * qf()
     *   .from('users')
     *   .min('age');
     */
    [SUPPORTED_QUERIES.MIN]: function(column) {
      return aggregate(SUPPORTED_QUERIES.MIN, ...arguments);
    },

    /**
     * Prepares "max" query informations.
     * Performs a max on the specified column
     * @memberof QueryFace#
     * @function max
     * @param {string} column - column name to find its max
     * @returns {QueryFace} instance of this class
     * @example
     *
     * qf()
     *   .from('users')
     *   .max('age');
     */
    [SUPPORTED_QUERIES.MAX]: function(column) {
      return aggregate(SUPPORTED_QUERIES.MAX, ...arguments);
    },

    /**
     * Prepares "sum" query informations.
     * Performs a sum on the specified column
     * @memberof QueryFace#
     * @function sum
     * @param {string} column - column name to find sum of in all records
     * @returns {QueryFace} instance of this class
     * @example
     *
     * qf()
     *   .from('users')
     *   .sum('age');
     */
    [SUPPORTED_QUERIES.SUM]: function(column) {
      return aggregate(SUPPORTED_QUERIES.SUM, ...arguments);
    },

    /**
     * Prepares "avg" query informations.
     * Performs an avg on the specified column
     * @memberof QueryFace#
     * @function avg
     * @param {string} column - column name to find average of in all records
     * @returns {QueryFace} instance of this class
     * @example
     *
     * qf()
     *   .from('users')
     *   .avg('age');
     */
    [SUPPORTED_QUERIES.AVG]: function(column) {
      return aggregate(SUPPORTED_QUERIES.AVG, ...arguments);
    },

    /**
     * Prepares "pluck" query informations.
     * Performs a pluck on the specified column
     * @memberof QueryFace#
     * @function pluck
     * @param {string} column - column name to get as an array result
     * @returns {QueryFace} instance of this class
     * @example
     *
     * qf()
     *   .from('users')
     *   .pluck('id');
     */
    [SUPPORTED_QUERIES.PLUCK]: function(column) {
      return aggregate(SUPPORTED_QUERIES.PLUCK, ...arguments);
    },

    /**
     * Prepares "first" query informations
     * @memberof QueryFace#
     * @function first
     * @returns {QueryFace} instance of this class
     * @example
     *
     * qf()
     *   .from('users')
     *   .first();
     */
    [SUPPORTED_QUERIES.FIRST]: function() {
      extendQuery(SUPPORTED_QUERIES.FIRST, []);
      return getQueriesByType(SUPPORTED_QUERIES.FIRST);
    },

    /**
     * Prepares "columnInfo" query informations.
     * Performs a columnInfo on the specified column
     * @memberof QueryFace#
     * @function columnInfo
     * @param {string} [column=*] - column name to get column info, empty or '*' parameter will return all column informations
     * @returns {QueryFace} instance of this class
     * @example
     *
     * qf()
     *   .from('users')
     *   .columnInfo('id');
     */
    [SUPPORTED_QUERIES.COLUMN_INFO]: function(column) {
      return aggregate(
        SUPPORTED_QUERIES.COLUMN_INFO,
        ...(!arguments.length ? '*' : arguments)
      );
    },

    /**
     * Prepares "union" query informations.
     * @memberof QueryFace#
     * @function union
     * @param {function} callback - callback to union with first query
     * @returns {QueryFace} instance of this class
     * @example
     *
     * qf().select('*').from('users').union(queryBuilder =>
     *   queryBuilder.from('users').where('id', '>', 10)
     * );
     */
    [SUPPORTED_QUERIES.UNION]: function(callback) {
      return whereExists(SUPPORTED_QUERIES.UNION, ...arguments);
    },

    /**
     * Prepares "unionAll" query informations.
     * @memberof QueryFace#
     * @function unionAll
     * @param {function} callback - callback to unionAll with first query
     * @returns {QueryFace} instance of this class
     * @example
     *
     * qf().select('*').from('users').unionAll(queryBuilder =>
     *   queryBuilder.from('users').where('id', '>', 10)
     * );
     */
    [SUPPORTED_QUERIES.UNION_ALL]: function(callback) {
      return whereExists(SUPPORTED_QUERIES.UNION_ALL, ...arguments);
    },

    /**
     * Prepares "with" query informations.
     * @memberof QueryFace#
     * @function with
     * @param {string} alias - alias name of with query
     * @param {function} callback - callback inner query for with operation
     * @returns {QueryFace} instance of this class
     * @example
     *
     * qf()
     *  .with('userInfo', qb => qb.select('id', 'username').from('users'))
     *  .select('*')
     *  .from('userInfo');
     */
    [SUPPORTED_QUERIES.WITH]: function(alias, callback) {
      return withAll(SUPPORTED_QUERIES.WITH, ...arguments);
    },

    /**
     * Prepares "withRecursive" query informations.
     * @memberof QueryFace#
     * @function withRecursive
     * @param {string} alias - alias name of withRecursive query
     * @param {function} callback - callback inner query for withRecursive operation
     * @returns {QueryFace} instance of this class
     * @example
     *
     * qf()
     *   .withRecursive('userInfo', qb =>
     *     qb
     *       .select('id', 'username', 'age')
     *       .from('users')
     *       .where('id', 1)
     *       .union(qb =>
     *         qb
     *           .select('u1.id', 'u1.username', 'u1.age')
     *           .from('users as u1')
     *           .innerJoin('userInfo as u2', 'u2.id', 'u1.family_id')
     *       )
     *   )
     *   .select('*')
     *   .from('userInfo');
     */
    [SUPPORTED_QUERIES.WITH_RECURSIVE]: function(alias, callback) {
      return withAll(SUPPORTED_QUERIES.WITH_RECURSIVE, ...arguments);
    },

    /**
     * Prepares "returning" query informations
     * @memberof QueryFace#
     * @function returning
     * @param {string|Array<string>} columnNames - one or more column names to include result object
     * @returns {QueryFace} instance of this class
     * @example
     *
     * qf()
     *   .returning('id')
     *   .insert({ name: 'engin', age: 28 })
     *   .into('users');
     */
    [SUPPORTED_QUERIES.RETURNING]: function() {
      return returning(SUPPORTED_QUERIES.RETURNING, ...arguments);
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
      return getQueriesByType(SUPPORTED_QUERIES.INSERT);
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
      extendQuery(SUPPORTED_QUERIES.INTO, [`${CONST_PREFIX}${tableName}`]);
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
      if (isNotString(tableName)) {
        throw new Error(
          'tableName parameter must be string for .update(tableName) function'
        );
      }
      extendQuery(SUPPORTED_QUERIES.UPDATE, [`${CONST_PREFIX}${tableName}`]);
      return getQueriesByType(SUPPORTED_QUERIES.UPDATE);
    },

    /**
     * Prepares "set" query informations
     * <pre>
     * (column, value)
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
     * @param {string|Object} columnOrData - string column or data object
     * @param {string|number|boolean} [value] - if first parameter is string column, this is required value parameter
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
        if (isNotString(arguments[0])) {
          throw new Error(
            'When you pass two parameters to .set(column, value) function, first parameter must be a string.'
          );
        }
      }
      extendQuery(SUPPORTED_QUERIES.SET, [...arguments]);
      return getQueriesByType(SUPPORTED_QUERIES.SET);
    },

    /**
     * Prepares "delete" query informations
     * @memberof QueryFace#
     * @function delete
     * @param {string} tableName - table name to delete record(s)
     * @returns {QueryFace} instance of this class
     * @example
     * qf().delete('users').where('name', 'engin');
     * qf().delete('users').where('id', 1);
     */
    [SUPPORTED_QUERIES.DELETE]: function(tableName) {
      if (isNotString(tableName)) {
        throw new Error(
          'tableName parameter must be string for .delete(tableName) function'
        );
      }
      extendQuery(SUPPORTED_QUERIES.DELETE, [`${CONST_PREFIX}${tableName}`]);
      return getQueriesByType(SUPPORTED_QUERIES.DELETE);
    },

    /**
     * Sends query to server and fetches response
     * @memberof QueryFace#
     * @function run
     * @param {string} [endpoint] - endpoint url to send request
     * @param {object} [headers] - key-value header map
     * @param {string} [method=POST] - request method
     * @param {string} [mode=cors] - request mode
     * @param {string} [cache=no-cache] - request cache
     * @param {string} [credentials=same-origin] - request credentials
     * @param {string} [redirect=follow] - request redirect
     * @param {string} [referrer=no-referrer] - request referrer
     * @returns {Promise<Response>} server's response as promise object, directly returns fetch's result
     * @example
     * const promiseResponse = qf().select('*').from('users').where('id', 1).run();
     * const users = promiseResponse.then(response => response.json());
     * // or
     * const response = await qf()
     *   .select('*')
     *   .from('users')
     *   .where('id', 1)
     *   .run();
     * const users = await response.json();
     */
    [SUPPORTED_QUERIES.RUN]: ({
      endpoint = Config.get('endpoint'),
      headers,
      method = Config.get('method'),
      mode = Config.get('mode'),
      cache = Config.get('cache'),
      credentials = Config.get('credentials'),
      redirect = Config.get('redirect'),
      referrer = Config.get('referrer'),
      queries = [this],
      beforeRun = () => true,
      afterRun = () => {},
    } = {}) => {
      if (!endpoint) {
        throw new Error('endpoint must be provided to run any query.');
      }

      const configs = {
        method,
        headers: { ...Config.get('headers'), ...headers },
        ...(method.toLowerCase() === 'post'
          ? {
              body: JSON.stringify({
                queries: queries.map(q => q.getQuery()),
                transaction,
                dependent,
              }),
            }
          : {}),
        mode,
        cache,
        credentials,
        redirect,
        referrer,
      };
      if (QueryFace.beforeEveryRun() === false) {
        return Promise.reject({
          blocked: true,
          message: 'request blocked by beforeEveryRun',
        });
      } else if (beforeRun() === false) {
        return Promise.reject({
          blocked: true,
          message: 'request blocked by beforeRun',
        });
      } else {
        return fetch(endpoint, configs).then(res => {
          const resJson = res.json();
          afterRun(resJson);
          QueryFace.afterEveryRun();
          return resJson;
        });
      }
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

QueryFace.beforeEveryRun = () => true;
QueryFace.afterEveryRun = () => {};
