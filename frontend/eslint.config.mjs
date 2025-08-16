import { dirname } from 'path';
import { fileURLToPath } from 'url';

import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals'),
  {
    rules: {
      quotes: ['error', 'single', { avoidEscape: true, allowTemplateLiterals: false }],
      semi: ['error', 'always'],
      'comma-dangle': ['error', 'always-multiline'],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'arrow-parens': ['error', 'always'],
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
      'space-before-blocks': ['error', 'always'],
      'keyword-spacing': ['error', { before: true, after: true }],
      'block-spacing': ['error', 'always'],
      'eol-last': ['error', 'always'],
      'no-trailing-spaces': ['error'],
      'max-len': ['warn', { code: 120, ignoreUrls: true }],
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      eqeqeq: ['error', 'always'],
      'no-var': ['error'],
      'prefer-const': ['error'],
      'no-duplicate-imports': ['error'],
      'no-empty-function': ['error'],
      'no-implicit-coercion': ['error'],
      'no-param-reassign': ['error'],
      'no-shadow': ['error'],
      'no-unneeded-ternary': ['error'],
      'no-useless-return': ['error'],
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling'],
            'index',
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
