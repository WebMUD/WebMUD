const path = require('path');
const targets = require('./targets.js');

module.exports = {
  entry: targets.entry,

  output: {
    filename: '[name]/main.bundle.js',
    path: path.resolve(__dirname, 'build'),
    clean: true,
  },

  resolve: {
    extensions: ['.ts', '.js'],
  },

  plugins: [],

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
