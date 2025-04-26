/** @type {import('@rsbuild/core').RsbuildConfig} */
export default {
  source: {
    entry: {
      index: "./src/bundle.test.ts",
    },
  },
  performance: {
    bundleAnalyze: {
      generateStatsFile: true,
      statsOptions: {
        preset: "verbose",
      },
    },
  },
  output: {
    externals: {
      react: "React",
      "react-dom": "ReactDOM",
    },
  },
};
