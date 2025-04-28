import react from "@eslint-react/eslint-plugin";
import { fixupPluginRules } from "@eslint/compat";
import eslintPluginReactHooks from "eslint-plugin-react-hooks";
import * as tsParser from "@typescript-eslint/parser";
import base from "./base.js";

export default [
  ...base,
  {
    files: ["**/*.{ts,tsx}"],
    ignores: ["**/.storybook/**"],
    ...react.configs["dom"],
    languageOptions: {
      parser: tsParser,
      parserOptions: { project: "./tsconfig.json" },
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    ignores: ["**/.storybook/**"],
    ...react.configs["recommended-type-checked"],
    settings: {
      "react-x": {
        additionalHooks: {
          useLayoutEffect: ["useIsomorphicLayoutEffect"],
        },
      },
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: { project: "./tsconfig.json" },
    },
    rules: {
      ...react.configs["recommended-type-checked"].rules,
      "@eslint-react/prefer-shorthand-boolean": "error",
      "@eslint-react/naming-convention/filename-extension": "error",
    },
  },
  {
    plugins: {
      "react-hooks": fixupPluginRules(eslintPluginReactHooks),
    },
    rules: {
      ...eslintPluginReactHooks.configs.recommended.rules,
    },
  },
];
