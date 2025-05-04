import { defineConfig } from "vitest/config";
import vuePlugin from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vuePlugin()],
  build: {
    target: "esnext",
  },
  test: {
    coverage: {
      provider: "istanbul",
      include: ["**/*.vue", "!**/*.stories.ts", "!**/*.test.ts"],
      reporter: ["text", "html", "json-summary", "json"],
      reportOnFailure: true,
    },
    browser: {
      enabled: true,
      provider: "playwright",
      instances: [{ browser: "chromium" }],
    },
  },
});
