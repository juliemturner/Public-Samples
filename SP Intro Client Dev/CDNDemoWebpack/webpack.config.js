//entry can be an array and an include multiple files
var webpack = require('webpack');

module.exports = {
    entry: {
        bundleCDNDemo: "./client/cdndemo.js"
    },
    output: {
        path: '/code/Conference-Demos/CDNDemoWebpack/build/',
        filename: "[name].js",
        publicPath: '/'
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                exclude: /node_modules/,
                loader: ["style-loader", "css-loader"]
            },
            {
                test: /\.scss$/,
                exclude: /node_modules/,
                loader: ["style-loader", "css-loader", "sass-loader"]
            },
            {
                test: /\.html$/,
                exclude: /node_modules/,
                loader: "html-loader"
            }
        ]
    },
    externals: {
        angular: 'angular',
        Sympraxis: 'Sympraxis'
    },
    watch: true
};


