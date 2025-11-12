const { merge } = require("webpack-merge");
const common = require("./webpack.config.js");

module.exports = merge(common, {
    mode: "production",
    output: {
        ...common.output,
        chunkFilename: "[name].[contenthash:8].js",
        filename: "[name].[contenthash:8].js",
    },
});
