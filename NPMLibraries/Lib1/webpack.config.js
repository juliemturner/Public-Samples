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
        use: ["style-loader", "css-loader", { loader: "sass-loader", options: { api: "modern" } }]
      },
      {
        test: /\.svg/,
        type: 'asset/resource'
      }]
    },
    externals: {
      'react': { root: 'React', commonjs: 'react', commonjs2: 'react', amd: 'react' },
      'react-dom': { root: 'ReactDOM', commonjs: 'react-dom', commonjs2: 'react-dom', amd: 'react-dom' },
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
      client: {
        webSocketURL: 'wss://localhost:3010/ws'
      },
      https: {
        key: fs.readFileSync(path.resolve(__dirname, '../certs/cert.key')),
        cert: fs.readFileSync(path.resolve(__dirname, '../certs/cert.crt')),
        ca: fs.readFileSync(path.resolve(__dirname, '../certs/ca.crt')),
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

