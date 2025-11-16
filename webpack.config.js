const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const { WebpackManifestPlugin } = require("webpack-manifest-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: {
        main: "./src/main.js",
        login: "./src/login.tsx",
    },
    output: {
        path: path.resolve(__dirname, "./dist"),
        chunkFilename: "[name].js",
        filename: "[name].js",
        publicPath: "/",
    },
    resolve: {
        extensions: [".ts", ".js", ".json", ".jsx", ".tsx", ".scss"],
        fallback: {
            buffer: require.resolve("buffer/"),
        },
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                },
            },
            {
                test: /\.tsx?$/,
                use: {
                    loader: "ts-loader",
                    options: {
                        transpileOnly: false,
                        compilerOptions: { noEmit: false },
                    },
                },
                exclude: /node_modules/,
            },
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    "style-loader",
                    "css-loader",
                    {
                        loader: "sass-loader",
                        options: {
                            sassOptions: {
                                quietDeps: true,
                                logger: {
                                    warn: () => {},
                                    deprecation: () => {},
                                },
                            },
                        },
                    },
                ],
                exclude: /node_modules/,
            },
        ],
    },
    optimization: {
        minimize: true,
        runtimeChunk: {
            name: "runtime", // necessary when using multiple entrypoints on the same page
        },
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|jquery)[\\/]/,
                    name: "vendor",
                    chunks: "all",
                },
            },
        },
    },
    plugins: [
        new WebpackManifestPlugin({
            fileName: "asset-manifest.json",
            generate: (seed, files) => {
                const manifestFiles = files.reduce((manifest, file) => {
                    manifest[file.name] = file.path;
                    return manifest;
                }, seed);

                const entrypointFiles = files.filter(x => x.isInitial && !x.name.endsWith(".map")).map(x => x.path);

                return {
                    files: manifestFiles,
                    entrypoints: entrypointFiles,
                };
            },
        }),
        new HtmlWebpackPlugin({
            hash: true,
            filename: "./index.html",
            template: "./src/index.html",
            chunks: ["main", "vendor", "runtime"],
        }),
        new HtmlWebpackPlugin({
            hash: true,
            filename: "./login.html",
            template: "./src/login.html",
            chunks: ["login", "vendor", "runtime"],
        }),
    ],
};
