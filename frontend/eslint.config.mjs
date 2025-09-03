import globals from 'globals';
import pluginReact from 'eslint-plugin-react';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    ignores: [
      // Build output
      '.next/**',
      'out/**',
      'dist/**',
      'build/**',

      // Dependencies
      'node_modules/**',

      // Cache
      '.cache/**',
      '.eslintcache',
      '.npm/**',
      '.temp/**',

      // Environment files
      '.env*',
      '!.env.example',

      // Config files
      'next.config.mjs',
      'postcss.config.mjs',
      'tailwind.config.js',

      // Generated files
      '**/*.generated.*',
      'public/_next/**',

      // Misc
      '.DS_Store',
      '*.log',
      'coverage/**',
      '.vercel/**'
    ]
  },
  {
    files: ['**/*.{js,mjs,cjs,jsx}'],
    plugins: { react: pluginReact },
    languageOptions: {
      globals: {
        ...globals.browser
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    settings: {
      react: {
        version: 'detect'
      }
    },
    rules: {
      // React specific rules
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',

      // General rules
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      'no-var': ['error'],
      'prefer-const': ['error']
    }
  }
]);
