module.exports = {
  "root": true,
  "parser": "@typescript-eslint/parser",
  "extends": [
    "eslint:recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "prettier",
    "plugin:react-hook-form/recommended"
  ],
  "parserOptions": {
    "project": true,
    "tsconfigRootDir": __dirname,
  },
  "plugins": [
    "@typescript-eslint",
    "react-hooks",
    "prettier",
    "jsx-a11y",
    "react-hook-form"
  ],
  "settings": {
    "react": {
      "version": "detect"
    }
  },
  "env": {
    "node": true
  },
  "rules": {
    "@typescript-eslint/consistent-type-imports": ["error", { "prefer": "type-imports" }],
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/no-empty-interface": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "eqeqeq": ["error", "always", { "null": "ignore" }],
    "no-param-reassign": "error",
    "no-return-assign": "error",
    "no-unused-vars": "off",
    "prefer-arrow-callback": "off",
    "prettier/prettier": "error",
    "radix": "error",
    "react-hooks/exhaustive-deps": "error",
    "react-hooks/rules-of-hooks": "error",
    "react/jsx-boolean-value": "error",
    "react/display-name": "off",
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off"
  },
  "ignorePatterns": ["dist/", ".eslintrc.cjs", "tools/deno"],
  "overrides": [
    {
      "files": ["*.js"],
      "rules": {
        "@typescript-eslint/no-var-requires": "off"
      }
    }
  ]
}
