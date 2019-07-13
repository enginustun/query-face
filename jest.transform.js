module.exports = require('babel-jest').createTransformer({
  presets: ['@babel/env'],
  plugins: [
    [
      '@babel/plugin-proposal-object-rest-spread',
      { loose: true, useBuiltIns: true },
    ],
  ],
});
