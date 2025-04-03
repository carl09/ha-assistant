import typescript from '@rollup/plugin-typescript';
import { lezer } from '@lezer/generator/rollup';
// const { lezer } = require('@lezer/generator/rollup');

export default [
  {
    input: 'src/simple.grammar',
    external: ['@lezer/lr', '@lezer/highlight'],
    output: [
      { file: 'dist/index.cjs', format: 'cjs' },
      // { dir: './src', format: 'es' },
    ],
    plugins: [lezer()],
  },

  {
    input: 'src/index.ts',
    // external: (id) => id != 'tslib' && !/^(\.?\/|\w:)/.test(id),
    output: [
      { file: 'dist/index.cjs', format: 'cjs' },
      { dir: './dist', format: 'es' },
    ],
    plugins: [typescript(), lezer()],
  },
];
