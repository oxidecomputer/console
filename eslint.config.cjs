const {
    defineConfig,
    globalIgnores,
} = require("eslint/config");

const tsParser = require("@typescript-eslint/parser");

const {
    fixupConfigRules,
    fixupPluginRules,
} = require("@eslint/compat");

const typescriptEslint = require("@typescript-eslint/eslint-plugin");
const reactHooks = require("eslint-plugin-react-hooks");
const prettier = require("eslint-plugin-prettier");
const jsxA11Y = require("eslint-plugin-jsx-a11y");
const reactHookForm = require("eslint-plugin-react-hook-form");
const _import = require("eslint-plugin-import");
const globals = require("globals");
const js = require("@eslint/js");

const {
    FlatCompat,
} = require("@eslint/eslintrc");

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

module.exports = defineConfig([{
    languageOptions: {
        parser: tsParser,

        parserOptions: {
            warnOnUnsupportedTypeScriptVersion: false,
            project: true,
            tsconfigRootDir: __dirname,
        },

        globals: {
            ...globals.node,
        },
    },

    extends: fixupConfigRules(compat.extends(
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended-type-checked",
        "plugin:@typescript-eslint/strict",
        "plugin:@typescript-eslint/stylistic",
        "plugin:jsx-a11y/recommended",
        "plugin:react/recommended",
        "prettier",
        "plugin:react-hook-form/recommended",
        "plugin:import/recommended",
        "plugin:react-hooks/recommended",
    )),

    plugins: {
        "@typescript-eslint": fixupPluginRules(typescriptEslint),
        "react-hooks": fixupPluginRules(reactHooks),
        prettier,
        "jsx-a11y": fixupPluginRules(jsxA11Y),
        "react-hook-form": fixupPluginRules(reactHookForm),
        import: fixupPluginRules(_import),
    },

    settings: {
        react: {
            version: "detect",
        },
    },

    rules: {
        "@typescript-eslint/array-type": "off",
        "@typescript-eslint/consistent-type-definitions": "off",

        "@typescript-eslint/consistent-type-imports": ["error", {
            prefer: "type-imports",
        }],

        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/ban-ts-comment": "off",

        "@typescript-eslint/no-empty-object-type": ["error", {
            allowInterfaces: "with-single-extends",
        }],

        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/no-duplicate-type-constituents": "off",

        "@typescript-eslint/no-unused-vars": ["error", {
            argsIgnorePattern: "^_",
            varsIgnorePattern: "^_",
            caughtErrorsIgnorePattern: "^_",
        }],

        "@typescript-eslint/no-floating-promises": "off",
        "@typescript-eslint/no-misused-promises": "off",
        "@typescript-eslint/no-unsafe-argument": "off",
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/no-unsafe-call": "off",
        "@typescript-eslint/no-unsafe-member-access": "off",
        "@typescript-eslint/no-unsafe-return": "off",
        "@typescript-eslint/only-throw-error": "off",
        "@typescript-eslint/unbound-method": "off",

        eqeqeq: ["error", "always", {
            null: "ignore",
        }],

        "import/no-default-export": "error",
        "import/no-unresolved": "off",

        "jsx-a11y/label-has-associated-control": [2, {
            controlComponents: ["button"],
        }],

        "no-console": ["error", {
            allow: ["warn", "error", "info", "table"],
        }],

        "no-param-reassign": "error",

        "no-restricted-imports": ["error", {
            paths: ["."],
            patterns: ["*.css"],
        }],

        "no-return-assign": "error",
        "no-unused-vars": "off",
        "prefer-arrow-callback": "off",
        "prettier/prettier": "error",
        radix: "error",
        "react-hooks/exhaustive-deps": "error",
        "react-hooks/incompatible-library": "off",
        "react-hooks/purity": "off",
        "react-hooks/refs": "off",
        "react-hooks/set-state-in-effect": "off",
        "react/button-has-type": "error",
        "react/jsx-boolean-value": "error",
        "react/display-name": "off",
        "react/react-in-jsx-scope": "off",
        "react/prop-types": "off",
    },
}, globalIgnores(["**/dist/", "**/node_modules/", "tools/deno/"]), {
    files: ["app/pages/**/*", "app/layouts/**/*", "app/forms/**/*", "**/*.config.ts"],

    rules: {
        "import/no-default-export": "off",
    },
}, {
    files: ["**/*.js"],

    rules: {
        "@typescript-eslint/no-var-requires": "off",
    },
}, {
    files: ["**/*.e2e.ts"],
    extends: compat.extends("plugin:playwright/recommended"),

    rules: {
        "playwright/expect-expect": ["warn", {
            assertFunctionNames: [
                "expectVisible",
                "expectRowVisible",
                "expectOptions",
                "expectRowMenuStaysOpen",
            ],
        }],

        "playwright/no-force-option": "off",
    },
}]);
