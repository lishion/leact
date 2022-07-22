const path = require('path');
module.exports = {
    entry: './src/index.ts',
    output: {
        path: path.resolve(__dirname, './build'), 
        filename: 'leact.min.js', 
        libraryTarget: 'umd', 
        library: 'leact', 
    },
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ]
         
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    }
}