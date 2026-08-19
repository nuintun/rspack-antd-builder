/**
 * @module semantic
 */

import clsx, { ClassValue } from 'clsx';
import { isFunction, isPlainObject } from './typeof';

interface ClassNamesFrame {
  source: Semantic;
  target: Semantic;
  schema: RuntimeSchema;
}

type Semantic = Record<string, unknown>;

type Resolver<T = unknown> = (...args: any[]) => T;

interface RuntimeSchema {
  [DEFAULT_SLOT]?: string;
  [key: string]: RuntimeSchema | string | undefined;
}

export const DEFAULT_SLOT = Symbol('semantic.default');

type SemanticSlots<C> = C extends Resolver<infer T> ? T : C;

type SemanticObject<T> = Extract<SemanticSlots<T>, Semantic>;

// oxfmt-ignore
export type SemanticSchema<T> =
  [SemanticObject<T>] extends [never]
    ? never
    : {
        [K in keyof SemanticObject<T> as
          SemanticSchema<SemanticObject<T>[K]> extends never
            ? never
            : K
        ]?: SemanticSchema<SemanticObject<T>[K]>;
      } & (
        [Extract<SemanticSlots<T>, string>] extends [never]
          ? {}
          : {
              [DEFAULT_SLOT]?: keyof SemanticObject<T> & string;
            }
      );

/**
 * @function isSchema
 * @description 判断值是否为运行时语义化 schema
 * @param value 需要验证的值
 */
function isSchema(value: unknown): value is RuntimeSchema {
  return isPlainObject(value);
}

/**
 * @function getSemantic
 * @description 获取语义化对象，不存在时创建
 * @param target 目标语义化对象
 * @param key 对象键
 */
function getSemantic(target: Semantic, key: string): Semantic {
  const value = target[key] || {};

  target[key] = value;

  return value as Semantic;
}

/**
 * @function resolveStyles
 * @description 按语义化 slot 浅合并 styles
 * @param base 基础 styles
 * @param custom 自定义 styles
 */
function resolveStyles<C>(base: Partial<SemanticSlots<C>>, custom?: SemanticSlots<C>): SemanticSlots<C> {
  const output: Semantic = {
    ...base
  };

  if (!custom) {
    return output as SemanticSlots<C>;
  }

  for (const [key, value] of Object.entries(custom)) {
    output[key] = {
      ...(output[key] as Semantic | undefined),
      ...(value as Semantic | undefined)
    };
  }

  return output as SemanticSlots<C>;
}

/**
 * @function combineStyles
 * @description 组合基础 styles 与自定义 styles
 * @param base 基础 styles
 * @param custom 自定义 styles
 */
export function combineStyles<C>(base: Partial<SemanticSlots<C>>, custom?: C): C {
  if (isFunction(custom)) {
    return ((...args: Parameters<Extract<C, Resolver>>) => {
      return resolveStyles<C>(base, custom(...args));
    }) as C;
  }

  return resolveStyles<C>(base, custom as SemanticSlots<C>) as C;
}

/**
 * @function resolveClassNames
 * @description 按语义化 schema 合并 classNames
 * @param schema 语义化 classNames schema
 * @param base 基础 classNames
 * @param custom 自定义 classNames
 */
function resolveClassNames<C>(
  schema: SemanticSchema<C>,
  base: Partial<SemanticSlots<C>>,
  custom?: SemanticSlots<C>
): SemanticSlots<C> {
  const output: Semantic = {};
  const stack: ClassNamesFrame[] = [];

  // 后进先出，确保 base 先处理，custom 后处理。
  stack.push({
    source: base,
    target: output,
    schema: schema as RuntimeSchema
  });

  if (custom) {
    stack.push({
      source: custom,
      target: output,
      schema: schema as RuntimeSchema
    });
  }

  let current: ClassNamesFrame | undefined;

  while ((current = stack.pop())) {
    const { schema, source, target } = current;

    for (const key of Object.keys(source)) {
      const value = source[key];
      const keySchema = schema[key];

      // 普通嵌套对象无需 schema，继续处理子节点。
      if (isPlainObject(value)) {
        stack.push({
          source: value,
          target: getSemantic(target, key),
          schema: isSchema(keySchema) ? keySchema : {}
        });
        continue;
      }

      // DEFAULT_SLOT 表示 string 形式对应的默认 semantic slot。
      if (isSchema(keySchema)) {
        const slotKey = keySchema[DEFAULT_SLOT];

        if (slotKey) {
          const slot = getSemantic(target, key);

          slot[slotKey] = clsx(slot[slotKey] as ClassValue, value as ClassValue);
          continue;
        }
      }

      // 普通叶子 className 直接追加。
      target[key] = clsx(target[key] as ClassValue, value as ClassValue);
    }
  }

  return output as SemanticSlots<C>;
}

/**
 * @function combineClassNames
 * @description 组合基础 classNames 与自定义 classNames
 * @param schema 语义化 classNames schema
 * @param base 基础 classNames
 * @param custom 自定义 classNames
 */
export function combineClassNames<C>(schema: SemanticSchema<C>, base: Partial<SemanticSlots<C>>, custom?: C): C {
  if (isFunction(custom)) {
    return ((...args: Parameters<Extract<C, Resolver>>) => {
      return resolveClassNames<C>(schema, base, custom(...args));
    }) as C;
  }

  return resolveClassNames<C>(schema, base, custom as SemanticSlots<C>) as C;
}
