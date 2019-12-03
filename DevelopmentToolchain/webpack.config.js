//entry can be an array and an include multiple files
var webpack = require('webpack');
const path = require('path');

module.exports = {
  mode: 'development',
  devtool: 'eval-source-map',
  target: 'node',
  entry: {
    bDemoWebpack: "./src/main.ts"
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: "[name].js",
    library: 'wpdLibrary'
  },
  module: {
    rules: [{
        test: /\.scss$/,
        exclude: /node_modules/,
        loader: ["style-loader", "css-loader", "sass-loader"]
      },
      {
        test: /\.(ts|tsx)$/,
        loader: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  externals: {
    React: 'React',
    'ReactDOM': 'ReactDOM'
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  watch: true
};