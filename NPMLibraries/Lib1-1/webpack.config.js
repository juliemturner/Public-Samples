const webpack = require('webpack');
const path = require('path');

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
    })
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: "[name].js",
    library: "Lib11",
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
  externals: {
    'React': 'react',
    'ReactDOM': 'react-dom'
  }
};