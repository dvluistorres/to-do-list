const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const cssRules = {test: /\.css$/i, use: ['style-loader', 'css-loader'],};
const imgRules = {test: /\.(png|svg|jpg|jpeg|gif)$/i,type: 'asset/resource',};
const fontsRules = {test: /\.(woff|woff2|eot|ttf|otf)$/i, type: 'asset/resource',};
const htmlRules = {test: /\.(html)$/,use: ['html-loader'],}

module.exports = {
  module: {
    rules: [
      cssRules,
      imgRules,
      fontsRules,
      htmlRules
    ],
  },
  entry: {
    main: './src/index.js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'To-Do List',
      template: './src/index.html'
    }),
  ],
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
}
