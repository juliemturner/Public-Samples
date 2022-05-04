const path = require('path');

module.exports = {
  mode: 'production',
  target: 'web',
  entry: {
    lib1: path.resolve(__dirname, './lib/index.js')
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: "[name].js",
    library: "Lib1",
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
    'Lib11': '@juliemturner/lib1_1',
    'React': 'react',
    'ReactDOM': 'react-dom'
  }
};