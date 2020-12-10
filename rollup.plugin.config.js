import babel from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import globals from 'rollup-plugin-node-globals';
import eslint from 'rollup-plugin-eslint';
import json from '@rollup/plugin-json';
import nodePolyfills from 'rollup-plugin-node-polyfills';

export default {
  input: 'lib/index.js',
  output: {
    file: 'dist/bundle.js',
    format: 'es',
    sourcemap: false
  },
  plugins: [
    eslint({
      exclude: ['src/styles/**']
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    nodePolyfills(),
    nodeResolve({
      mainFields: ['browser', 'main'],
      modulesOnly: true
    }),
    commonjs({
      include: ['node_modules/**'],
      exclude: ['node_modules/process-es6/**'],
      namedExports: {
        'node_modules/react/react.js': [
          'Children',
          'Component',
          'PropTypes',
          'createElement',
          'createBbox'
        ],
        'node_modules/react-dom/index.js': ['render']
      }
    }),
    json({ indent: '' }),
    babel(),
    globals()
  ]
};
