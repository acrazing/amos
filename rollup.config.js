/*
 * @since 2020-11-03 13:16:07
 * @author acrazing <joking.young@gmail.com>
 */

import commonjs from '@rollup/plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import sourceMaps from 'rollup-plugin-sourcemaps';
import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';
import replace from '@rollup/plugin-replace';

const packageJson = require('./package.json');

const deps = Object.keys(packageJson.dependencies).concat(Object.keys(packageJson.devDependencies));

const name = packageJson.name.split('/').pop();
const top = name.replace(/(?:^|-)(.)/g, ($0, $1) => $1.toUpperCase());

const options = (format) => ({
  input: 'src/index.ts',
  output: {
    file: `dist/${name}-alter.${format}.js`,
    format,
    sourcemap: true,
    name: top,
    globals: packageJson.umdExternals,
    plugins: format === 'umd' ? [terser({ format: { comments: false } })] : [],
  },
  external: format === 'umd' ? Object.keys(packageJson.umdExternals) : deps,
  plugins: [
    typescript({
      tsconfigOverride: {
        compilerOptions: { module: 'esnext' },
        exclude: ['src/**/*.spec.ts', 'src/**/*.spec.tsx'],
      },
    }),
    replace({
      __VERSION__: packageJson.version,
    }),
    commonjs(),
    resolve({ preferBuiltins: true }),
    sourceMaps(),
  ],
});

export default [options('cjs'), options('es'), options('umd')];
