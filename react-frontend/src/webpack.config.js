const webpack = require('webpack');
 
module.exports = {
  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
          IMAGE_SRC_PATH: JSON.stringify("yeet"),
      }
    }),
  ]
}