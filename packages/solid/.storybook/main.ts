import type { StorybookConfig } from "storybook-solidjs-vite";

import { join, dirname } from "path";

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath<T extends string>(value: T): T {
  return dirname(require.resolve(join(value, "package.json"))) as T;
}

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [],
  framework: {
    name: getAbsolutePath("storybook-solidjs-vite"),
    options: {},
  },
  core: {
    builder: "@storybook/builder-vite",
  },
};
export default config;
