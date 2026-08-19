/**
 * @module semantic
 */

import clsx, { ClassValue } from 'clsx';
import { isFunction, isPlainObject } from './typeof';

interface Frame {
  source: Semantic;
  target: Semantic;
}

interface SchemaFrame extends Frame {
  schema: RuntimeSchema;
}

type Semantic = Record<string, unknown>;

type Resolver<R = unknown> = (...args: any[]) => R;

interface RuntimeSchema {
  [DEFAULT_SLOT]?: string;
  [key: string]: RuntimeSchema | string | undefined;
}

export const DEFAULT_SLOT = Symbol('semantic.default');

type Slots<T> = T extends Resolver<infer R> ? R : T;

type SemanticSchema<T> = Extract<Slots<T>, Semantic>;

// oxfmt-ignore
export type Schema<T> =
  [SemanticSchema<T>] extends [never]
    ? never
    : {
        [K in keyof SemanticSchema<T> as
          Schema<SemanticSchema<T>[K]> extends never
            ? never
            : K
        ]?: Schema<SemanticSchema<T>[K]>;
      } & (
        [Extract<Slots<T>, string>] extends [never]
          ? {}
          : {
              [DEFAULT_SLOT]?: keyof SemanticSchema<T> & string;
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
  const value = target[key];

  if (isPlainObject(value)) {
    return value;
  }

  const semantic: Semantic = {};

  target[key] = semantic;

  return semantic;
}

/**
 * @function resolveStyles
 * @description 按语义化 slot 合并 styles
 * @param base 基础 styles
 * @param custom 自定义 styles
 */
function resolveStyles<T>(base: Partial<Slots<T>>, custom?: Slots<T>): Slots<T> {
  const output: Semantic = {
    ...base
  };

  if (!custom) {
    return output as Slots<T>;
  }

  const stack: Frame[] = [
    {
      source: custom,
      target: output
    }
  ];

  let current: Frame | undefined;

  while ((current = stack.pop())) {
    const { source, target } = current;

    for (const [key, value] of Object.entries(source)) {
      const baseValue = target[key];

      if (isPlainObject(value) && isPlainObject(baseValue)) {
        const next: Semantic = {
          ...baseValue
        };

        target[key] = next;

        stack.push({
          source: value,
          target: next
        });
        continue;
      }

      target[key] = value;
    }
  }

  return output as Slots<T>;
}

/**
 * @function combineStyles
 * @description 组合基础 styles 与自定义 styles
 * @param base 基础 styles
 * @param custom 自定义 styles
 */
export function combineStyles<T>(base: Partial<Slots<T>>, custom?: T): T {
  if (isFunction(custom)) {
    return ((...args: Parameters<Extract<T, Resolver>>) => {
      return resolveStyles<T>(base, custom(...args));
    }) as T;
  }

  return resolveStyles<T>(base, custom as Slots<T>) as T;
}

/**
 * @function resolveClassNames
 * @description 按语义化 schema 合并 classNames
 * @param schema 语义化 classNames schema
 * @param base 基础 classNames
 * @param custom 自定义 classNames
 */
function resolveClassNames<T>(schema: Schema<T>, base: Partial<Slots<T>>, custom?: Slots<T>): Slots<T> {
  const output: Semantic = {};
  const stack: SchemaFrame[] = [
    {
      source: base,
      target: output,
      schema
    }
  ];

  if (custom) {
    stack.push({
      source: custom,
      target: output,
      schema
    });
  }

  let current: SchemaFrame | undefined;

  while ((current = stack.pop())) {
    const { schema, source, target } = current;

    for (const key of Object.keys(source)) {
      const value = source[key];
      const keySchema = schema[key];
      const hasSchema = isSchema(keySchema);

      // 普通嵌套对象无需 schema，继续处理子节点。
      if (isPlainObject(value)) {
        stack.push({
          source: value,
          target: getSemantic(target, key),
          schema: hasSchema ? keySchema : {}
        });
        continue;
      }

      // DEFAULT_SLOT 表示 string 形式对应的默认 semantic slot。
      if (hasSchema) {
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

  return output as Slots<T>;
}

/**
 * @function combineClassNames
 * @description 组合基础 classNames 与自定义 classNames
 * @param schema 语义化 classNames schema
 * @param base 基础 classNames
 * @param custom 自定义 classNames
 */
export function combineClassNames<T>(schema: Schema<T>, base: Partial<Slots<T>>, custom?: T): T {
  if (isFunction(custom)) {
    return ((...args: Parameters<Extract<T, Resolver>>) => {
      return resolveClassNames<T>(schema, base, custom(...args));
    }) as T;
  }

  return resolveClassNames<T>(schema, base, custom as Slots<T>) as T;
}
