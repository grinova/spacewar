const path = require('path');

const distDir = path.resolve(__dirname, 'dist');
const srcDir = path.resolve(__dirname, 'src');

module.exports = {
  mode: "none",
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
    modules: [srcDir, 'node_modules']
  }
};
