// @edmar/config/eslint/base — shared flat-config rules for every workspace.
// Consuming package: `import base from '@edmar/config/eslint/base'` in its own eslint.config.js.
const js = require("@eslint/js");
const tseslint = require("typescript-eslint");
const prettier = require("eslint-config-prettier");
const globals = require("globals");

module.exports = [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
  {
    // Node tooling config files are conventionally CommonJS — require() there
    // is correct, not a lint violation. Application/library source (under
    // src/, app/) keeps the strict ESM-only rule.
    files: ["*.config.js", "*.config.cjs", "eslint.config.js", "eslint/**/*.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.next/**",
      "**/.expo/**",
      "**/.turbo/**",
      "**/coverage/**",
      "**/*.generated.ts",
    ],
  },
];
