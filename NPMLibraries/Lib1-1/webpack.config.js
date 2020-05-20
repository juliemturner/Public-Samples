//entry can be an array and an include multiple files
const webpack = require('webpack');
const path = require('path');
const bundleAnalyzer = require('webpack-bundle-analyzer');

const dropPath = path.join(__dirname, 'temp', 'stats');
const lastDirName = path.basename(__dirname);

let bannerText = "";
const fs = require('fs');
const package = './package.json';
if (fs.existsSync(package)) {
  const packageFileContent = fs.readFileSync(package, 'UTF-8');
  const pagesContents = JSON.parse(packageFileContent);
  bannerText = `*****${pagesContents.name} - Version: ${pagesContents.version} - ${pagesContents.description}*****`;
}

module.exports = {
  mode: 'production',
  target: 'web',
  entry: {
    lib1_1: path.resolve(__dirname, './lib/index.js')
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: bannerText
    }),
    new bundleAnalyzer.BundleAnalyzerPlugin({
      openAnalyzer: false,
      analyzerMode: 'static',
      reportFilename: path.join(dropPath, `${lastDirName}.stats.html`),
      generateStatsFile: true,
      statsFilename: path.join(dropPath, `${lastDirName}.stats.json`),
      logLevel: 'error'
    })
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: "[name].js",
    libraryTarget: 'umd'
  },
  resolve: {
    modules: [
      "node_modules",
      path.resolve(__dirname, "lib")
    ],
  },
  module: {
    rules: [{
      test: /\.css$/,
      exclude: /node_modules/,
      loader: ["style-loader", "css-loader"]
    }]
  },
  externals: [
    'react',
    'react-dom'
  ]
};