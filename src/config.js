import { isObject } from './utils/object';

let allConfigs = {};

/**
 * This is the configuration class that you can manage internal and external configurations you need.
 * <div>
 * This class and its methods are all static.
 * You cannot create instance of this class.
 * </div>
 * @class Config
 * @example
 * import QueryFace, { Config } from 'query-face';
 *
 * Config.set('user.name', 'engin');
 * Config.get('user.name');
 */
const Config = {
  /**
   * Sets configuration object based on key and value. It can set configurations deeply.
   * @memberof Config.
   * @function
   * @param {string|Object} key required key or key/value object
   * @param {string|Object} [value] optional value, when key is string the value is required. it can be a string or object
   * @example
   * // single parameter as Object, it will be useful to initialize configurations.
   * Config.set({
   *   endpoint: 'https://github.com',
   *   headers: {
   *     'Content-Type': 'application/json'
   *   }
   * });
   *
   * // single key, string value
   * Config.set('token', 'Ye4tpWyBNIjl8HVPjZF5OJnjEPAO5mIo');
   *
   * // single key, object value
   * Config.set('user', { name: 'engin', email: 'enginustun@outlook.com' });
   *
   * // nested keys, string value
   * Config.set('user.name', 'engin');
   * Config.set('user.email', 'enginustun@outlook.com');
   *
   * // nested keys, object value
   * Config.set('user.info', { age: 28, address: 'İstanbul' })
   */
  set(key = '', value = '') {
    if (isObject(key)) {
      const objectKeys = Object.keys(key);
      objectKeys.forEach(objectKey => {
        Config.set(objectKey, key[objectKey]);
      });
    } else {
      const keyParts = key.split('.');
      let configCursor = allConfigs;
      keyParts.forEach((keyPart, i) => {
        if (isObject(configCursor) && !(keyPart in configCursor)) {
          configCursor[keyPart] = {};
        }
        if (i === keyParts.length - 1) {
          if (isObject(value)) {
            if (!isObject(configCursor[keyPart])) {
              configCursor[keyPart] = {};
            }
            const objectKeys = Object.keys(value);
            objectKeys.forEach(objectKey => {
              Config.set(`${key}.${objectKey}`, value[objectKey]);
            });
          } else {
            configCursor[keyPart] = value;
          }
        }
        configCursor = configCursor[keyPart];
      });
    }
  },

  /**
   * You can get configuration value by string key.
   * @memberof Config.
   * @function
   * @param {string} key parameter to get value from configuration object
   * @returns value of given key parameter
   * @example
   * // lets assume we have user config as below
   * Config.set('user', { name: 'engin', email: 'enginustun@outlook.com' });
   * // or we can set as below
   * Config.set('user.name', 'engin');
   * Config.set('user.email', 'enginustun@outlook.com');
   *
   * @example
   * // if we want to get user config
   * Config.get('user'); // returns {name: "engin", email: "enginustun@outlook.com"}
   * Config.get('user.name'); // returns "engin"
   * Config.get('user.email'); // returns "enginustun@outlook.com"
   */
  get(key = '') {
    const keyParts = key.split('.');
    let configCursor = allConfigs;
    for (let i = 0; i < keyParts.length; i++) {
      const keyPart = keyParts[i];
      if (!isObject(configCursor) || !(keyPart in configCursor)) {
        configCursor = undefined;
        break;
      }
      configCursor = configCursor[keyPart];
    }

    // FIXME: change JSON trick with deep copy logic
    return isObject(configCursor) || Array.isArray(configCursor)
      ? JSON.parse(JSON.stringify(configCursor))
      : configCursor;
  },
};

export default Config;
