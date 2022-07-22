const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')
module.exports = {
    entry: './index.jsx',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'main.bundle.js',
    },
    devtool: 'source-map',
    devServer: {
      static: './dist',
    },
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.jsx/,
                exclude: /node_modules/,
                use: {
                  loader: "babel-loader",
                  options: {
                    presets: [
                        [
                          "@babel/preset-react",
                          {
                            "pragma": "Leact.createElement", // default pragma is React.createElement (only in classic runtime)
                            "pragmaFrag": "Leact.Fragment", // default is React.Fragment (only in classic runtime)
                            "throwIfNamespace": false, // defaults to true
                            "runtime": "classic" // defaults to classic
                          }
                        ]
                      ]
                  }
                }
            },
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ]
         
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
      },
    plugins: [new HtmlWebpackPlugin({template: './main.html'})],
};