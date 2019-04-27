export const isObject = val =>
  Object.prototype.toString.call(val) === '[object Object]';
