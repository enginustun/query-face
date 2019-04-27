export const isFunction = val =>
  Object.prototype.toString.call(val) === '[object Function]';

export const defaultFunction = () => {};
