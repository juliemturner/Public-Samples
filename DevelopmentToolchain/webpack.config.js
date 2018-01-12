//entry can be an array and an include multiple files
var webpack = require('webpack');

module.exports = {
    entry: {
        bundleDevToolchain: "./client/devToolchain.ts"
    },
    output: {
        path: '/code/Public-Samples/DevelopmentToolchain/build/',
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
            },
            {
                test: /\.ts$/,
                loader: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    externals: {
        angular: 'angular',
        Sympraxis: 'Sympraxis'
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    watch: true
};


