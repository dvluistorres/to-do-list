const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const cssRules = {test: /\.css$/i, use: ['style-loader', 'css-loader'],};
const imgRules = {test: /\.(png|svg|jpg|jpeg|gif)$/i,type: 'asset/resource',};
const fontsRules = {test: /\.(woff|woff2|eot|ttf|otf)$/i, type: 'asset/resource',};

module.exports = {
  mode: 'development',
  module: {
    rules: [
      cssRules,
      imgRules,
      fontsRules
    ],
  },
  entry: {
    main: './src/index.js',
  },
  devtool: 'inline-source-map',
  devServer: {
    static: './dist',
    open: true,
    //overlay: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Development',
      template: './src/index.html'
    }),
  ],
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    clean: false,
  },
 optimization: {
   runtimeChunk: 'single',
 },
};