import pkg from './package.json';
const libFolder = 'lib';
// import { terser } from 'rollup-plugin-terser';
export default [
  {
    input: '.jsdoc/src/versions.js',
    output: [
      {
        file: `docs/public/scripts/versions.browser.js`,
        format: 'iife',
        name: 'versionInfo', // the global which can be used in a browser
      },
    ],
  },
  {
    input: 'src/index.js', // our source file
    output: [
      {
        file: `${libFolder}/${pkg.name}.js`,
        format: 'cjs',
        exports: 'named',
      },
      {
        file: `${libFolder}/${pkg.name}.module.js`,
        format: 'es', // the preferred format
        exports: 'named',
      },
      {
        file: `${libFolder}/${pkg.name}.browser.js`,
        format: 'iife',
        name: pkg.nameVar, // the global which can be used in a browser
        exports: 'named',
      },
      {
        file: `${libFolder}/${pkg.name}.umd.js`,
        format: 'umd',
        name: pkg.nameVar, // the global which can be used in a browser
        exports: 'named',
      },
    ],
    plugins: [],
    external: [...Object.keys(pkg.dependencies || {})],
  },
];
