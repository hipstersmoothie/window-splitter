import type { StorybookConfig } from "@storybook/svelte-vite";

const config: StorybookConfig = {
  stories: [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx|svelte)",
  ],
  framework: {
    name: "@storybook/svelte-vite",
    options: {},
  },
};

export default config;
