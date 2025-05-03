import type { StorybookConfig } from "@storybook/svelte-vite";

import { join, dirname } from "path";

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string) {
  return dirname(require.resolve(join(value, "package.json")));
}
const config: StorybookConfig = {
  stories: [
    "../stories/**/*.mdx",
    "../src/**/*.stories.@(js|ts|svelte)",
    "../stories/**/*.stories.@(js|ts|svelte)",
  ],
  addons: [
    {
      name: getAbsolutePath("@storybook/addon-essentials"),
      options: {
        docs: false,
      },
    },
    getAbsolutePath("@storybook/addon-svelte-csf"),
    getAbsolutePath("@storybook/addon-interactions"),
  ],
  framework: {
    name: getAbsolutePath("@storybook/svelte-vite"),
    options: {},
  },
};
export default config;
