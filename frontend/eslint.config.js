// Flat config (ESLint 9). Base: eslint.config.js do Ponto-Front.
import storybook from 'eslint-plugin-storybook';

import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import playwright from 'eslint-plugin-playwright';
import tseslint from 'typescript-eslint';

export default tseslint.config(
   {
      ignores: [
         'dist/**',
         'node_modules/**',
         'coverage/**',
         'storybook-static/**',
         'playwright-report/**',
         'test-results/**',
         // Boilerplate de referência para copiar e renomear; nunca importado (ver mvvm-pages-components.md).
         'src/pages/_templates/**',
      ],
   },
   js.configs.recommended,
   ...tseslint.configs.recommended,
   prettierConfig,
   {
      files: ['**/*.{ts,tsx}'],
      languageOptions: {
         ecmaVersion: 2020,
         globals: globals.browser,
         parserOptions: {
            ecmaFeatures: { jsx: true },
         },
      },
      plugins: {
         react,
         'react-hooks': reactHooks,
         'react-refresh': reactRefresh,
         prettier,
      },
      settings: {
         react: { version: 'detect' },
      },
      rules: {
         ...react.configs.recommended.rules,
         ...reactHooks.configs.recommended.rules,
         'react/react-in-jsx-scope': 'off',
         'react/prop-types': 'off',
         'prettier/prettier': 'error',
         'no-unused-vars': 'off',
         '@typescript-eslint/no-unused-vars': [
            'error',
            {
               vars: 'all',
               varsIgnorePattern: '^_',
               args: 'after-used',
               argsIgnorePattern: '^_',
            },
         ],
         'padding-line-between-statements': [
            'error',
            { blankLine: 'always', prev: '*', next: 'function' },
            { blankLine: 'always', prev: 'function', next: '*' },
         ],
         'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
         'no-console': ['warn', { allow: ['warn', 'error'] }],
      },
   },
   {
      ...playwright.configs['flat/recommended'],
      files: ['tests/e2e/**/*.{ts,tsx}'],
      rules: {
         ...playwright.configs['flat/recommended'].rules,
         'react-hooks/rules-of-hooks': 'off',
      },
   },
   {
      files: ['tests/**/*.{ts,tsx}'],
      rules: {
         '@typescript-eslint/no-explicit-any': 'off',
      },
   },
   {
      files: ['src/pages/**/*.view.tsx'],
      rules: {
         'no-restricted-imports': [
            'error',
            {
               paths: [
                  {
                     name: 'react',
                     importNames: ['useState', 'useEffect', 'useCallback', 'useMemo', 'useRef'],
                     message: 'Views must not use React hooks. Move logic to *.controller.tsx.',
                  },
                  {
                     name: 'react-router-dom',
                     importNames: ['useNavigate', 'useParams', 'useLocation'],
                     message: 'Views must not use router hooks. Move logic to *.controller.tsx.',
                  },
                  {
                     name: '@store/store',
                     message: 'Views must not access Redux directly. Move logic to *.controller.tsx.',
                  },
                  { name: '@hooks/useInjection', message: 'useInjection is only allowed in container *.tsx files.' },
               ],
               patterns: [
                  {
                     group: ['**/*.controller', '**/*.controller.tsx', '**/*.controller.ts'],
                     message: 'Views must not import controllers. Receive data via props from the container.',
                  },
               ],
            },
         ],
      },
   },
   {
      files: ['src/pages/**/*.controller.tsx', 'src/pages/**/*.controller.ts'],
      rules: {
         'no-restricted-imports': [
            'error',
            {
               paths: [
                  { name: '@hooks/useInjection', message: 'Inject services via deps from the container *.tsx file.' },
                  {
                     name: 'react-router-dom',
                     importNames: ['useNavigate', 'useParams', 'useLocation', 'useSearchParams'],
                     message: 'Inject router hooks via deps from the container *.tsx file.',
                  },
                  { name: '@store/store', message: 'Inject Redux selectors/dispatch via deps from the container.' },
                  {
                     name: '@access/index',
                     importNames: ['useAccessControl'],
                     message: 'Inject access control via deps from the container.',
                  },
               ],
            },
         ],
      },
   },
   {
      files: ['business/**/*.{ts,tsx}'],
      ignores: ['business/infrastructure/logging/**'],
      rules: {
         'no-console': 'error',
      },
   },
   {
      // Único ponto autorizado a escrever no console: a implementação do logger.
      files: ['business/infrastructure/logging/**/*.{ts,tsx}'],
      rules: {
         'no-console': 'off',
      },
   },
   storybook.configs['flat/recommended'],
);
