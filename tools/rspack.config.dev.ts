/**
 * @module rspack.config.dev
 * @description 开发环境 Rspack 配置
 * @see https://github.com/facebook/create-react-app
 */

const mode = 'development';

process.env.NODE_ENV = mode;
process.env.BABEL_ENV = mode;

import Koa from 'koa';
import rspack from '@rspack/core';
import compress from 'koa-compress';
import resolveIp from './utils/ip.ts';
import { createMemfs } from './utils/fs.ts';
import { resolvePort } from './utils/port.ts';
import resolveConfigs from './rspack.config.base.ts';
import { server as dev } from 'rspack-dev-middleware';
import { ReactRefreshRspackPlugin } from '@rspack/plugin-react-refresh';

// HTTP client error codes.
const HTTP_CLIENT_ERROR_CODES = new Set([
  'EOF', // End of file - client closed connection.
  'EPIPE', // Broken pipe - client disconnected.
  'ECANCELED', // Operation canceled.
  'ECONNRESET', // Connection reset by peer.
  'ECONNABORTED', // Connection aborted.
  'ERR_STREAM_PREMATURE_CLOSE' // Stream closed before finishing.
]);

const [appConfig, configure] = await resolveConfigs(mode);

const ip = resolveIp();
const fs = createMemfs();
const { ports } = appConfig;
const port = await resolvePort(ports);
const devServerHost = `http://${ip}:${port}`;

// @ts-expect-error
configure.experiments.cache.version = 'dev';
configure.devtool = 'eval-cheap-module-source-map';
configure.watchOptions = { aggregateTimeout: 256 };

// @ts-expect-error
configure.plugins.push(new ReactRefreshRspackPlugin());

const app = new Koa();
const compiler = rspack(configure);

const devService = await dev(compiler, {
  fs,
  headers: {
    'Cache-Control': 'no-cache',
    'X-Content-Type-Options': 'nosniff'
  }
});

app.use(
  compress({
    br: false
  })
);

app.use(devService);

app.use(async ctx => {
  ctx.type = 'text/html; charset=utf-8';
  // ctx.body = fs.createReadStream(???);
});

app.on('error', error => {
  if (!HTTP_CLIENT_ERROR_CODES.has(error.code)) {
    console.error(error);
  }
});

app.listen(port, () => {
  devService.logger.info(`server run at: \x1b[36m${devServerHost}\x1b[0m`);
});
