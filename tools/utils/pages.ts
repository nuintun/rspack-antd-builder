/**
 * @module pages
 * @description HTML 页面插件配置模块，根据 AppConfig 生成 HtmlRspackPlugin 实例
 */

import rspack from '@rspack/core';
import { resolve } from 'node:path';
import { isBoolean, isFunction } from './typeof.ts';
import type { AppConfig, GetProp } from '../index.ts';
import type { HtmlRspackPluginOptions, Mode } from '@rspack/core';

/**
 * @typedef PageConfig
 * @description 页面配置类型，继承自 HtmlRspackPluginOptions，用于配置单个 HTML 页面的生成选项
 */
export type PageConfig = HtmlRspackPluginOptions;

/**
 * @constant DEFAULT_TEMPLATE
 * @description 默认的 HTML 模板文件路径，指向 tools/index.ejs
 */
const DEFAULT_TEMPLATE = resolve('tools/index.ejs');

/**
 * @function resolveTemplateParameters
 * @description 解析并合并 HTML 模板参数，确保 lang 属性始终存在
 * @param lang HTML 文档的语言属性值
 * @param page 单个页面的配置对象
 */
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

/**
 * @function resolveHtmlPlugins
 * @description 根据应用配置生成 HtmlRspackPlugin 实例数组，支持单页面和多页面模式
 * @param mode 打包模式，影响模板压缩策略
 * @param appConfig 完整的应用配置对象
 */
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
