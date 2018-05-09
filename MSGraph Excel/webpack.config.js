//entry can be an array and an include multiple files
var webpack = require('webpack');
/*Use for extracting CSS to keep it out of the bundle
var ExtractTextPlugin = require('extract-text-webpack-plugin');*/

/* Replace <APPNAME> with the filename or name of application entry point */
/* Replace <FOLDER/FOLDER> with the path to the build directory to output bundle files */
module.exports = {
    entry: {
        bGraphExcel: "./client/graphExcel.app.ts",
        /*Include when extracting CSS To keep it out of the bundle
        tempstyle: "./client/styles/reviewstyle.scss"*/
    },
    output: {
        path: '/code/Conference-Demos/GraphExcel/build/',
        filename: "[name].js",
        publicPath: '/'
    },
    /*Include when extracting CSS to keep it out of the bundle
    plugins: [
        new ExtractTextPlugin("[name].css")
    ],*/
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'ts-loader',
                exclude: /node_modules/
            },
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
                loader: "raw-loader"
            }
        ]
    },
    externals: {
        angular: 'angular',
        Sympraxis: 'Sympraxis',
        adal: 'adal'
    },
    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            angular: './node_modules/angular',
            Sympraxis: './libs'
        }
    },
    watch: true
};
