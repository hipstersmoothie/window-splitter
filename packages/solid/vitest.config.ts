import { defineConfig } from "vitest/config";
import solidPlugin from "vite-plugin-solid";

export default defineConfig({
  plugins: [solidPlugin()],
  build: {
    target: "esnext",
  },
  test: {
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "istanbul",
      include: ["**/*.tsx", "!**/*.stories.tsx", "!**/*.test.tsx"],
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
