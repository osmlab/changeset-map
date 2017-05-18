import babel from 'rollup-plugin-babel';
import replace from 'rollup-plugin-replace';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';
import eslint from 'rollup-plugin-eslint';
import sizes from 'rollup-plugin-sizes';

export default {
    entry: 'lib/index.js',
    dest: 'dist/bundle.js',
    format: 'cjs',
    sourceMap: true,
    plugins: [
        eslint({
            exclude: ['src/styles/**']
        }),
        replace({
            'process.env.NODE_ENV': JSON.stringify('production')
        }),
        builtins(),
        nodeResolve({
            jsnext: false,
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
        babel({
            exclude: 'node_modules/**'
        }),
        globals(),

        sizes()
    ]
};
