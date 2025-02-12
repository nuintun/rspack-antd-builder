/**
 * @module rules
 * @description 配置 Rspack 规则
 */

import rspack from '@rspack/core';
import swcrc from '../../.swcrc.js';
import lightningcssrc from '../../.lightningcssrc.js';

/**
 * @function resolveRules
 * @param {string} mode
 * @return {Promise<NonNullable<import('@rspack/core').Configuration['module']>['rules']>}
 */
export default async mode => {
  const swcOptions = await swcrc();
  const isDevelopment = mode !== 'production';
  const lightningcssOptions = await lightningcssrc(mode);
  const localIdentName = isDevelopment ? '[local]-[hash:8]' : '[hash:8]';
  const cssModulesOptions = { auto: true, localIdentName, exportLocalsConvention: 'camel-case-only' };

  return [
    {
      oneOf: [
        // The loader for js.
        {
          test: /\.[jt]sx?$/i,
          exclude: /[\\/]node_modules[\\/]/,
          use: [
            {
              loader: 'builtin:swc-loader',
              options: swcOptions
            }
          ]
        },
        // The loader for css.
        {
          test: /\.css$/i,
          use: [
            {
              loader: rspack.CssExtractRspackPlugin.loader
            },
            {
              loader: 'css-modules-types-loader'
            },
            {
              loader: 'css-loader',
              options: {
                esModule: true,
                importLoaders: 1,
                modules: cssModulesOptions
              }
            },
            {
              loader: 'builtin:lightningcss-loader',
              options: lightningcssOptions
            }
          ]
        },
        // The loader for scss or sass.
        {
          test: /\.s[ac]ss$/i,
          use: [
            {
              loader: rspack.CssExtractRspackPlugin.loader
            },
            {
              loader: 'css-modules-types-loader'
            },
            {
              loader: 'css-loader',
              options: {
                esModule: true,
                importLoaders: 2,
                modules: cssModulesOptions
              }
            },
            {
              loader: 'builtin:lightningcss-loader',
              options: lightningcssOptions
            },
            {
              loader: 'sass-loader'
            }
          ]
        },
        // The loader for assets.
        {
          type: 'asset/resource',
          test: /\.(mp3|ogg|wav|mp4|flv|webm)$/i
        },
        {
          test: /\.svg$/i,
          oneOf: [
            {
              issuer: /\.[jt]sx?$/i,
              type: 'asset/resource',
              resourceQuery: /^\?url$/,
              use: [
                {
                  loader: '@nuintun/svgo-loader'
                }
              ]
            },
            {
              issuer: /\.[jt]sx?$/i,
              use: [
                {
                  loader: 'builtin:swc-loader',
                  options: swcOptions
                },
                {
                  loader: 'svgc-loader'
                }
              ]
            },
            {
              type: 'asset/resource',
              use: [
                {
                  loader: '@nuintun/svgo-loader'
                }
              ]
            }
          ]
        },
        {
          type: 'asset/resource',
          test: /\.(png|gif|bmp|ico|jpe?g|webp|woff2?|ttf|eot)$/i
        }
      ]
    }
  ];
};
