/**
 * @module pages
 */

import rspack from '@rspack/core';
import { resolve } from 'node:path';
import { isBoolean, isFunction } from './typeof.ts';
import type { AppConfig, GetProp, PageConfig } from '../index.ts';
import type { HtmlRspackPluginOptions, Mode } from '@rspack/core';

const DEFAULT_TEMPLATE = resolve('tools/index.ejs');

function resolveTemplateParameters(
  lang: string,
  { templateParameters }: PageConfig
): GetProp<HtmlRspackPluginOptions, 'templateParameters'> {
  if (isBoolean(templateParameters)) {
    return templateParameters;
  }

  if (isFunction(templateParameters)) {
    return params => {
      return {
        lang,
        ...templateParameters(params)
      };
    };
  }

  return {
    lang,
    ...templateParameters
  };
}

export default function resolveHtmlPlugins(
  mode: Mode,
  { name, lang, pages }: AppConfig
): InstanceType<typeof rspack.HtmlRspackPlugin>[] {
  return (Array.isArray(pages) ? pages : [pages]).map(page => {
    return new rspack.HtmlRspackPlugin({
      title: name,
      template: DEFAULT_TEMPLATE,
      minify: mode === 'production',
      ...page,
      templateParameters: resolveTemplateParameters(lang, page)
    });
  });
}
