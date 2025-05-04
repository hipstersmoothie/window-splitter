// eslint.config.js

import base from "@internal/eslint-config";
import eslintPluginVue from "eslint-plugin-vue";
import typescriptEslint from "typescript-eslint";

export default typescriptEslint.config(
  ...base,
  { ignores: ["*.d.ts", "**/coverage", "**/dist"] },
  {
    extends: [...eslintPluginVue.configs["flat/recommended"]],
    files: ["**/*.{ts,vue}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        parser: typescriptEslint.parser,
      },
    },
    rules: {
      "vue/multi-word-component-names": "off",
      "vue/max-attributes-per-line": "off",
    },
  }
);
