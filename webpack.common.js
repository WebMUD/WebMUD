const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const targets = require('./targets.js');

const entryHtmlGenerators = Object.values(targets.html).map(
  target => new HtmlWebpackPlugin(target)
);

module.exports = {
  entry: targets.entry,

  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'build'),
    clean: true,
  },

  resolve: {
    extensions: ['.ts', '.js'],
  },

  plugins: [...entryHtmlGenerators],

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
};
