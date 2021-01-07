import babel from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import globals from 'rollup-plugin-node-globals';
import eslint from 'rollup-plugin-eslint';
import json from '@rollup/plugin-json';
import builtins from 'rollup-plugin-node-builtins';

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
    builtins(),
    nodeResolve({
      jsnext: true,
      main: true,
      browser: true
    }),
    commonjs({
      include: ['node_modules/**'],
      exclude: ['node_modules/process-es6/**'],
      namedExports: {
        'node_modules/react/react.js': [
          'Children',
          'Component',
          'PropTypes',
          'createElement'
        ],
        'node_modules/react-dom/index.js': ['render']
      }
    }),
    json({ indent: '' }),
    babel({
      exclude: 'node_modules/**'
    }),
    globals()
  ]
};
