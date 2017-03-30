// TODO: implement
const path = require('path');
const webpack = require('webpack');
const AppCachePlugin = require('appcache-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const minimatch = require('minimatch');

const babelOptions = {
  babelrc: false,
  presets: [require.resolve('babel-preset-react-app')],
};

const excludePrivate = [
  minimatch.makeRe('**/_[a-zA-Z]*'),
  minimatch.makeRe('**/_[a-zA-Z]*/**'),
];

function makeConfig(config) {
  return {
    entry: [
      path.resolve(__dirname, '../app/index.js'),
      'webpack-dev-server/client/index.js?http://localhost:8080/', // TODO: make dev only
    ],
    devtool: 'source-map', // TODO: make cheaper in dev
    context: config.root,
    output: {
      filename: 'bundle.js',
      path: path.resolve(process.cwd(), '.tmp/dist'),
      publicPath: '/',
    },
    resolve: {
      modules: [config.root, 'node_modules'],
    },
    resolveLoader: {
      modules: [
        path.resolve(__dirname, '../loaders'),
        path.resolve(__dirname, '../../node_modules'),
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        __CONTEXT__: JSON.stringify(config.root),
        // TODO: process.NODE_ENV
      }),
      new AppCachePlugin({
        settings: ['prefer-online'],
        output: 'atlas-manifest.appcache',
      }),
      new HtmlWebpackPlugin({
        title: 'Atlas',
        template: path.resolve('app/public/index.html'),
      }),
      // TODO: uglify in prod build
    ],
    module: {
      rules: [
        {
          exclude: [
            /\.html$/, // [DOC FILE] loaded via html-loader
            /\.md/, // [DOC FILE] see url-loader
            /\.jsx?$/, // [DOC FILE] loaded through babel as js module
            /\.css$/, // loaded as css module
            /\.json$/, // loaded as json data
            /\.bmp$/, // see url-loader
            /\.gif$/, // see url-loader
            /\.jpe?g$/, // see url-loader
            /\.png$/, // see url-loader
          ],
          loader: 'file-loader',
          options: {
            name: '[name].[hash:8].[ext]',
          },
        },
        {
          test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: '[name].[hash:8].[ext]',
          },
        },
        {
          test: /\.jsx?$/,
          include: [path.resolve('app'), config.root],
          loader: 'babel-loader',
          options: babelOptions,
        },
        {
          test: /\.md$/,
          include: [config.root],
          loaders: [
            {
              loader: 'babel-loader',
              options: babelOptions,
            },
            'html-react-loader',
            'html-loader',
            'md-doc-loader',
          ],
        },
        {
          test: /\.html$/,
          include: [config.root],
          loaders: [
            {
              loader: 'babel-loader',
              options: babelOptions,
            },
            'html-react-loader',
            'html-loader',
            'html-doc-loader',
          ],
        },
      ],
    },
  };
}

module.exports = makeConfig;
