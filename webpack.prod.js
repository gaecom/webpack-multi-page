const webpackCommon = require('./webpack.common.js')
const merge = require('webpack-merge')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const webpack = require('webpack')
const path = require('path')
const cfg = require('./webpack.cfg.js')
module.exports = (env, argv) => {
  return merge(webpackCommon(env, argv), {
    mode: 'production', // 当mode值为'production'时，webpack-dev-server 变动刷新反应很慢
    devtool: '#source-map',
    module: {
      rules: [
        {
          test: /\.(css|scss|sass)$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                // you can specify a publicPath here
                // by default it use publicPath in webpackOptions.output
              }
            },
            'css-loader?sourceMap', // 将 CSS 转化成 CommonJS 模块
            'sass-loader?sourceMap', // 将 Sass 编译成 CSS
            'postcss-loader?sourceMap'
          ]
        },
        {
          test: /\.(gif|png|jpe?g|svg)$/i,
          exclude: /(node_modules|bower_components)/,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 8192,
                name: `${cfg.build.assetsSubDirectory}/img/[name]-[hash:7].[ext]`,
                publicPath: '../../'
              }
            }
          ]
        },

      ]
    },
    plugins: [
      new CleanWebpackPlugin('./dist'),
      new CopyWebpackPlugin([
        {
          from: path.resolve(__dirname, cfg.build.assetsSubDirectory),
          to: cfg.build.assetsSubDirectory,
          ignore: ['.*']
        }
      ]),
     
      new MiniCssExtractPlugin({

        filename: `${cfg.build.assetsSubDirectory}/css/[name].[contenthash].css`,
        // increasing file size: https://github.com/vuejs-templates/webpack/issues/1110
      }),

      new UglifyJsPlugin({
        uglifyOptions: {
          compress: {
            warnings: false
          }
        },
        sourceMap: cfg.build.productionSourceMap,
        parallel: true
      }),
      new OptimizeCssAssetsPlugin({
        cssProcessorOptions: {
          sourcemap: true,
          map: {
            inline: !cfg.build.productionSourceMap,
            annotation: true
          },
          autoprefixer: { disable: true },
        }
      }),
    ],
    optimization: {
      runtimeChunk: {
        name: 'manifest',
      },
      splitChunks: {
        minSize: 20000, // 超过20k才会被打包
        cacheGroups: {
          vendor: {
            name: "vendor",
            test: /[\\/]node_modules[\\/]/,
            chunks: "all",
            minChunks: 1
          },
          commons: {
            name: "commons",
            chunks: "all",
            minChunks: 2
          }
        }
      }
    }
  })
}
