var path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: './src/main.js',
  module: {
    rules: [
      { test: /\.vue$/, use: 'vue-loader' },
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'css-loader'
        ]
      },
      { test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
       }
    ]
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'index_bundle.js'
  },
  plugins: [
    new VueLoaderPlugin(),
    new CopyPlugin({
      patterns: [
        { from: "src/*.html", to: "[name].[ext]" }
      ],
    }),
  ]
};
