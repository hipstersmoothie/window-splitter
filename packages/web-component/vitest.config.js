import { defineConfig } from "vitest/config";

export default defineConfig({
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
