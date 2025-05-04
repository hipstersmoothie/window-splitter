import vue from "@vitejs/plugin-vue";

export default {
  plugins: [vue()],
  build: {
    outDir: "es",
    minify: false,
    rollupOptions: {
      external: ["vue"],
      input: ["./src/index.ts"],
      output: {
        globals: {
          vue: "Vue",
        },
        dir: "dist",
      },
    },
    lib: {
      entry: "./src/index.ts",
      name: "window-splitter-vue",
      fileName: "window-splitter-vue",
      formats: ["es", "umd", "cjs"],
    },
  },
};
