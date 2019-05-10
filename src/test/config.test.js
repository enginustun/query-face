const Config = require('../index').Config;
const configData = {
  endpoint: 'https://github.com',
  headers: {
    'Content-Type': 'application/json',
  },
};

describe('config', () => {
  it('is loaded', () => {
    expect(Config).not.toBeNull();
  });
  it('has correct methods [set, get]', () => {
    expect(Config).toHaveProperty('set');
    expect(Config).toHaveProperty('get');
  });
  it('methods are working properly with initial config object', () => {
    Config.set(configData);
    expect(Config.get('headers')).toEqual(configData.headers);
    expect(Config.get('headers.Content-Type')).toEqual(
      configData.headers['Content-Type']
    );
    expect(Config.get('endpoint')).toEqual(configData.endpoint);
  });
  it('write and read properly with single level string key and string value', () => {
    Config.set('testKey', 'testValue');
    expect(Config.get('testKey')).toBe('testValue');
  });
  it('string value cannot be overriden multi level key and any value', () => {
    expect(() => {
      Config.set('testKey.inner', 'innerValue');
    }).toThrowError();
    expect(() => {
      Config.set('testKey.inner', { inner: 'innerValue' });
    }).toThrowError();
  });
  it('string value can be overriden single level key and object value', () => {
    const innerObject = { inner: 'innerValue' };
    expect(() => {
      Config.set('testKey', innerObject);
    }).not.toThrowError();
    expect(Config.get('testKey')).toEqual(innerObject);
    expect(Config.get('testKey.inner')).toEqual(innerObject.inner);
  });
  it('multi level key creates an object', () => {
    Config.set('user.name', 'engin');
    Config.set('user.email', 'enginustun@outlook.com');
    expect(Config.get('user')).toEqual({
      name: 'engin',
      email: 'enginustun@outlook.com',
    });
  });
  it('overriden by object value', () => {
    Config.set({ endpoint: 'https://enginustun.com' });
    expect(Config.get('endpoint')).toBe('https://enginustun.com');
    expect(Config.get('headers')).toEqual(configData.headers);
  });
});
