const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const webpack = require('webpack');
const paths = require('react-scripts/config/paths');
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

/**
 * Utility function to replace plugins in the webpack config files used by react-scripts
 */
const replacePlugin = (plugins, nameMatcher, newPlugin) => {
  const pluginIndex = plugins.findIndex((plugin) => {
    return plugin.constructor && plugin.constructor.name && nameMatcher(plugin.constructor.name);
  });

  if (pluginIndex === -1)
    return plugins;

  return plugins.slice(0, pluginIndex).concat(newPlugin).concat(plugins.slice(pluginIndex + 1));
};

module.exports = function override(config, env) {
  const isEnvDevelopment = process.env.NODE_ENV !== 'production';
  const isEnvProduction = process.env.NODE_ENV === 'production';

  config.entry = {
    lol: [
      isEnvDevelopment && require.resolve('react-dev-utils/webpackHotDevClient'),
      resolveApp('src/lol.js'),
    ].filter(Boolean),
    'rugs-usa': [
      isEnvDevelopment && require.resolve('react-dev-utils/webpackHotDevClient'),
      resolveApp('src/rugs-usa.js')
    ].filter(Boolean),
  };

  const indexHtmlPlugin = new HtmlWebpackPlugin(
    Object.assign(
      {},
      {
        filename: 'lol.html',
        inject: true,
        template: resolveApp('public/lol.html'),
        chunks: ['lol']
      },
      isEnvProduction
        ? {
          minify: {
            removeComments: true,
            collapseWhitespace: true,
            removeRedundantAttributes: true,
            useShortDoctype: true,
            removeEmptyAttributes: true,
            removeStyleLinkTypeAttributes: true,
            keepClosingSlash: true,
            minifyJS: true,
            minifyCSS: true,
            minifyURLs: true,
          },
        }
        : undefined
    )
  );

  config.plugins = replacePlugin(config.plugins, (name) => /HtmlWebpackPlugin/i.test(name), indexHtmlPlugin);

  config.plugins.push(
    new HtmlWebpackPlugin(
      Object.assign(
        {},
        {
          filename: 'rugs-usa.html',
          inject: true,
          template: resolveApp('public/rugs-usa.html'),
          chunks: ['rugs-usa']
        },
        isEnvProduction
          ? {
            minify: {
              removeComments: true,
              collapseWhitespace: true,
              removeRedundantAttributes: true,
              useShortDoctype: true,
              removeEmptyAttributes: true,
              removeStyleLinkTypeAttributes: true,
              keepClosingSlash: true,
              minifyJS: true,
              minifyCSS: true,
              minifyURLs: true,
            },
          }
          : undefined
      )
    )
  );

  // "output": {
  //   "pathinfo": true,
  //   "filename": "static/js/bundle.js",
  //   "futureEmitAssets": true,
  //   "chunkFilename": "static/js/[name].chunk.js",
  //   "publicPath": "/",
  //   "jsonpFunction": "webpackJsonpcra-templates",
  //   "globalObject": "this"
  // };
  if(isEnvDevelopment) config.output.filename = 'static/js/[name].bundle.js'

  config.optimization.runtimeChunk = false
  config.optimization.splitChunks = false

  const publicPath = isEnvProduction
      ? paths.servedPath
      : isEnvDevelopment && '/';

  const multiEntryManfiestPlugin = new ManifestPlugin({
    fileName: 'asset-manifest.json',
    publicPath: publicPath,
    generate: (seed, files, entrypoints) => {
      const manifestFiles = files.reduce((manifest, file) => {
        manifest[file.name] = file.path;
        return manifest;
      }, seed);

      const entrypointFiles = {};
      Object.keys(entrypoints).forEach(entrypoint => {
        entrypointFiles[entrypoint] = entrypoints[entrypoint].filter(fileName => !fileName.endsWith('.map'));
      });

      return {
        files: manifestFiles,
        entrypoints: entrypointFiles,
      };
    },
  });

  config.plugins = replacePlugin(config.plugins, (name) => /ManifestPlugin/i.test(name), multiEntryManfiestPlugin);

  // const limitChunkCountPlugin = new webpack.optimize.LimitChunkCountPlugin({
  //   maxChunks: 1
  // })
  //
  // config.plugins = replacePlugin(config.plugins, (name) => /LimitChunkCountPlugin/i.test(name), limitChunkCountPlugin);

  return config;
};
