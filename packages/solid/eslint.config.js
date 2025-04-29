import base from "@internal/eslint-config/base.js";
import solid from "eslint-plugin-solid/configs/typescript";

export default [
  ...base,
  {
    files: ["**/*.{ts,tsx}"],
    ...solid,
  },
];
