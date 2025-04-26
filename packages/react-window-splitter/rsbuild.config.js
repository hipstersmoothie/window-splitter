/** @type {import('@rsbuild/core').RsbuildConfig} */
export default {
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
