const js = require('@eslint/js')
const tsParser = require('@typescript-eslint/parser')
const prettierConfig = require('eslint-config-prettier')
const prettierPlugin = require('eslint-plugin-prettier')
const globals = require('globals')

const { FlatCompat } = require('@eslint/eslintrc')
const { fixupConfigRules } = require('@eslint/compat')

// FlatCompat needed for plugins that don't fully support flat config yet
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
})

module.exports = [
  // Ignore patterns
  {
    ignores: ['**/dist/', '**/node_modules/', 'tools/deno/'],
  },

  // Base recommended configs
  js.configs.recommended,
  ...fixupConfigRules(
    compat.extends(
      'plugin:@typescript-eslint/recommended-type-checked',
      'plugin:@typescript-eslint/strict',
      'plugin:@typescript-eslint/stylistic',
      'plugin:jsx-a11y/recommended',
      'plugin:react/recommended',
      'plugin:react-hook-form/recommended',
      'plugin:import/recommended',
      'plugin:react-hooks/recommended'
    )
  ),
  prettierConfig,

  // Main config
  {
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        warnOnUnsupportedTypeScriptVersion: false,
        // this config is needed for type aware lint rules
        project: true,
        tsconfigRootDir: __dirname,
      },
      globals: {
        ...globals.node,
      },
    },

    plugins: {
      prettier: prettierPlugin,
    },

    settings: {
      react: {
        version: 'detect',
      },
    },

    rules: {
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-empty-object-type': [
        'error',
        { allowInterfaces: 'with-single-extends' },
      ],
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-duplicate-type-constituents': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],

      // disabling the type-aware rules we don't like
      // https://typescript-eslint.io/getting-started/typed-linting/
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/only-throw-error': 'off',
      '@typescript-eslint/unbound-method': 'off',

      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'import/no-default-export': 'error',
      'import/no-unresolved': 'off', // plugin doesn't know anything
      'jsx-a11y/label-has-associated-control': [2, { controlComponents: ['button'] }],
      // only worry about console.log
      'no-console': ['error', { allow: ['warn', 'error', 'info', 'table'] }],
      'no-param-reassign': 'error',
      'no-restricted-imports': [
        'error',
        {
          paths: [
            '.', // preventing confusion due to auto-imports and barrel files
          ],
          patterns: [
            // import all CSS except index.css at top level through CSS @import statements
            // to avoid bad ordering situations. See https://github.com/oxidecomputer/console/pull/2035
            '*.css',
          ],
        },
      ],
      'no-return-assign': 'error',
      'no-unused-vars': 'off',
      'prefer-arrow-callback': 'off',
      'prettier/prettier': 'error',
      radix: 'error',

      // https://react.dev/reference/eslint-plugin-react-hooks#recommended
      'react-hooks/exhaustive-deps': 'error',
      // recommended rules that go nuts in our codebase. we should fix them eventually
      'react-hooks/incompatible-library': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',

      'react/button-has-type': 'error',
      'react/jsx-boolean-value': 'error',
      'react/display-name': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
  },

  // Default exports are needed in the route modules and the config files,
  // but we want to avoid them anywhere else
  {
    files: ['app/pages/**/*', 'app/layouts/**/*', 'app/forms/**/*', '*.config.ts'],
    rules: {
      'import/no-default-export': 'off',
    },
  },

  {
    files: ['*.js'],
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
    },
  },

  ...fixupConfigRules(
    compat.extends('plugin:playwright/recommended')
  ).map((config) => ({
    ...config,
    files: ['**/*.e2e.ts'],
  })),
  {
    files: ['**/*.e2e.ts'],
    rules: {
      'playwright/expect-expect': [
        'warn',
        {
          assertFunctionNames: [
            'expectVisible',
            'expectRowVisible',
            'expectOptions',
            'expectRowMenuStaysOpen',
          ],
        },
      ],
      'playwright/no-force-option': 'off',
    },
  },
]
