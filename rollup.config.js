import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

const isProd = process.env.BUILD === 'production';

export default {
  input: 'src/main.ts',
  output: {
    file: 'main.js',
    format: 'cjs',
    exports: 'default',
    sourcemap: isProd ? false : 'inline',
  },
  external: ['obsidian'],
  plugins: [
    typescript({
      typescript: require('typescript'),
    }),
    nodeResolve({ browser: true }),
    commonjs(),
    isProd && terser(),
  ],
};
