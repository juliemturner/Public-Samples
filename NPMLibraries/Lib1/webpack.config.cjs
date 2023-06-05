const path = require('path');
const fs = require('fs');

module.exports = (env, argv) => {
  return {
    mode: (env.WEBPACK_SERVE || env.WEBPACK_WATCH) ? 'development' : 'production',
    target: 'web',
    entry: {
      lib1: path.resolve(__dirname, './src/index.ts')
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: "[name].js",
      library: { type: "umd", name: "lib1" },
      clean: true
    },
    devtool: 'inline-source-map',
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.scss'],
      modules: ['node_modules'],
    },
    module: {
      rules: [{
        test: /\.tsx|.ts?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              happyPackMode: true,
              transpileOnly: true,
            },
          },
        ]
      },
      {
        test: /\.s[ac]ss$/i,
        use: ["style-loader", "css-loader", "sass-loader"]
      },
      {
        test: /\.svg/,
        type: 'asset/resource'
      }]
    },
    externals: {
      'React': 'react',
      'ReactDOM': 'react-dom',
      '@juliemturner/lib1_1': {
        root: 'lib11',
        commonjs2: '@juliemturner/lib1_1',
        commonjs: '@juliemturner/lib1_1',
        amd: '@juliemturner/lib1_1'
      }
    },
    devServer: {
      compress: true,
      hot: true,
      port: 3010,
      https: {
        key: fs.readFileSync("cert.key"),
        cert: fs.readFileSync("cert.crt"),
        ca: fs.readFileSync("ca.crt"),
      },
      static: [{
        directory: path.join(__dirname, 'app'),
        publicPath: "/"
      },
      {
        directory: path.join(__dirname, "node_modules"),
        publicPath: "/"
      }
      ],
    }
  };
};

