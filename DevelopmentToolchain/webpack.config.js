//entry can be an array and an include multiple files
var webpack = require('webpack');
const path = require('path');

module.exports = {
  mode: 'development',
  devtool: 'eval-source-map',
  target: 'node',
  entry: {
    bDemoWebpack: "./lib/main.js"
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: "[name].js",
    library: 'wpdLibrary'
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
    React: 'React',
    'ReactDOM': 'ReactDOM'
  }
};