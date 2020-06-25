const config = {
    entry: {
      app: "./public/index.js",
      chart: "./public/db.js"
    },
    output: {
      path: __dirname + "/dist",
      filename: "[name].bundle.js"
    },
    mode: "development",
    module: {
      rules: [
        {
          test: /\.m?js$/,
          exclude: /(node_modules)/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"]
            }
          }
        }
      ]
    }
  };
  module.exports = config;
  