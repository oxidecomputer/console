module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    warnOnUnsupportedTypeScriptVersion: false,
    project: true,
    tsconfigRootDir: __dirname,
  },
  extends: [
    'eslint:recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'plugin:react-hook-form/recommended',
  ],
  plugins: ['@typescript-eslint', 'react-hooks', 'prettier', 'jsx-a11y', 'react-hook-form'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  env: {
    node: true,
  },
  rules: {
    '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/strict-boolean-expressions': ["error", {
      allowNullableString: true, allowNullableBoolean: true
    }],
    eqeqeq: ['error', 'always', { null: 'ignore' }],
    'no-param-reassign': 'error',
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
  ignorePatterns: ['dist/', ".eslintrc.cjs", "tools/deno"],
  overrides: [
    {
      files: ['*.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
    {
      files: ['*.e2e.ts'],
      extends: ['plugin:playwright/playwright-test'],
    },
  ],
}
