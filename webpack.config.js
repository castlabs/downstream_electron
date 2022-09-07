const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const webpack = require("webpack");
const packageJson = require("./package.json");

let externals = {};
for (let key in packageJson.dependencies) {
  if (key === "moment") {
    key = key + "/" + key;
  }
  externals[key] = true;
}
externals["electron"] = true;

const PATHS = {
  api: path.join(__dirname, "api"),
  build: path.join(__dirname, ""),
  documentation: path.join(__dirname, "out"),
  publicPath: ""
};

const date = new Date().toISOString().replace(/T/g, " ").replace(/Z/g, "");
const package = require("./package.json");
let banner = [];
banner.push(package.name);
banner.push(package.version);
banner.push(date);
banner.push(package.author);
banner = [banner.join(",")];
banner.push("");
banner.push("Copyright (C) 2017 Castlabs GmbH.");
banner.push("Licensed under the Apache License, Version 2.0 (the \"License\");");
banner.push("you may not use this file except in compliance with the License.");
banner.push("You may obtain a copy of the License at");
banner.push("http://www.apache.org/licenses/LICENSE-2.0");
banner.push("Unless required by applicable law or agreed to in writing, software");
banner.push("distributed under the License is distributed on an \"AS IS\" BASIS,");
banner.push("WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.");
banner.push("See the License for the specific language governing permissions and");
banner.push("limitations under the License.");
banner = banner.join("\n");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  mode: "production",
  target: "node",
  entry: {
    "index": [
      "./api/index"
    ],
    "downstream-electron-be": [
      "./api/downstream-electron-be"
    ],
    "downstream-electron-fe": [
      "./api/downstream-electron-fe"
    ],
    "startServer": [
      "./api/server/startServer"
    ]
  },

  output: {
    path: PATHS.build,
    publicPath: PATHS.publicPath,
    filename: "[name].js",
    chunkFilename: "[id].chunk.js",
    libraryTarget: "umd"
  },

  devtool: 'eval-source-map',

  module: {
    rules: [
      {
        test: /\.js$/,
        include: PATHS.api,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"]
          }
        }
      }
    ],
    noParse: function (content) {
      return /api\/index\.js/.test(content);
    }
  },

  plugins: [
    new CleanWebpackPlugin({
      //cleanOnceBeforeBuildPatterns: [PATHS.build, PATHS.documentation],
      cleanOnceBeforeBuildPatterns: [],
      verbose: true,
      dry: false
    }),
    new webpack.BannerPlugin({
      banner: banner
    })
  ],

  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin(
      )
    ],
  },

  externals: externals
};