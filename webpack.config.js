const path = require('path');

module.exports = {
    resolve: {
        fallback: {
            "fs": false,
            "tls": false,
            "net": false,
            "path": false,
            "zlib": false,
            "http": false,
            "https": false,
            "stream": false,
            "crypto": false,
            "crypto-browserify": require.resolve('crypto-browserify'), //if you want to use this module also don't forget npm i crypto-browserify
        }
    },
    entry: './src/index.js', // Entry point for your app
    output: {
        path: path.resolve(__dirname, 'dist'), // Output directory
        filename: 'bundle.js', // Output file
    },
    mode: 'development', // Can be 'development' or 'production'
    module: {
        rules: [
            {
                test: /\.css$/, // For processing CSS files
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.m?js$/, // For processing JavaScript files
                exclude: /node_modules/, // Exclude node_modules directory
                use: {
                    loader: 'babel-loader', // Use Babel to transpile JS
                    options: {
                        presets: ['@babel/preset-env'], // Babel preset for ES6+
                    },
                },
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/, // For handling images
                type: 'asset/resource',
            },
        ],
    },
    devServer: {
        static: './dist', // Serve content from the 'dist' directory
        open: true, // Automatically open the browser
    },
};