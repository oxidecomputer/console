/**
 * @type {import("eslint").Linter.Config}
 */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    warnOnUnsupportedTypeScriptVersion: false,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/strict',
    'plugin:@typescript-eslint/stylistic',
    'plugin:jsx-a11y/recommended',
    'plugin:react/recommended',
    'prettier',
    'plugin:react-hook-form/recommended',
    'plugin:import/recommended',
  ],
  plugins: [
    '@typescript-eslint',
    'react-hooks',
    'prettier',
    'jsx-a11y',
    'react-hook-form',
    'import',
  ],
  settings: {
    react: {
      version: 'detect',
    },
  },
  env: {
    node: true,
  },
  rules: {
    '@typescript-eslint/array-type': 'off',
    '@typescript-eslint/consistent-type-definitions': 'off',
    '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    eqeqeq: ['error', 'always', { null: 'ignore' }],
    'import/no-default-export': 'error',
    'import/no-unresolved': 'off', // plugin doesn't know anything
    'jsx-a11y/label-has-associated-control': [2, { controlComponents: ['button'] }],
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
    'react-hooks/exhaustive-deps': 'error',
    'react-hooks/rules-of-hooks': 'error',
    'react/jsx-boolean-value': 'error',
    'react/display-name': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
  },
  ignorePatterns: ['dist/'],
  overrides: [
    {
      // default export is needed in config files
      files: ['*.config.ts'],
      rules: { 'import/no-default-export': 'off' },
    },
    {
      files: ['*.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
    {
      files: ['*.e2e.ts'],
      extends: ['plugin:playwright/playwright-test'],
      rules: {
        'playwright/expect-expect': [
          'warn',
          { assertFunctionNames: ['expectVisible', 'expectRowVisible'] },
        ],
      },
    },
  ],
}
