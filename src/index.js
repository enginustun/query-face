import { isFunction } from './utils/function';
import {
  SUPPORTED_QUERIES,
  RETURN_QUERIES_BY_TYPE,
  DEFAULT_QUERY_TYPE,
} from './constants';

export default function queryFace() {
  if (!new.target) {
    return new queryFace(...arguments);
  }
  let [type, isInnerQuery] = [...arguments];
  if (!RETURN_QUERIES_BY_TYPE[type]) {
    type = DEFAULT_QUERY_TYPE;
  }
  this.getQuery = getQuery;
  const queryStack = [];

  function getQuery() {
    return queryStack;
  }

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
            .call(null, new queryFace(SUPPORTED_QUERIES.__INNER_WHERE, true))
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
    [SUPPORTED_QUERIES.SELECT]: function() {
      extendQuery(SUPPORTED_QUERIES.SELECT, [...arguments]);
      return getQueriesByType(SUPPORTED_QUERIES.SELECT);
    },
    [SUPPORTED_QUERIES.FROM]: function(tableName) {
      extendQuery(SUPPORTED_QUERIES.FROM, [tableName]);
      return getQueriesByType(SUPPORTED_QUERIES.FROM);
    },
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
