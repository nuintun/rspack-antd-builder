/**
 * @module semantic
 */

import clsx, { ClassValue } from 'clsx';
import { isFunction, isPlainObject } from './typeof';

interface StackFrame {
  source: Semantic;
  target: Semantic;
  schema?: RuntimeSchema;
}

type Semantic = Record<PropertyKey, unknown>;

type Resolver<R = unknown> = (...args: any[]) => R;

type Slots<T> = T extends Resolver<infer R> ? R : T;

type SemanticSlots<T> = Extract<Slots<T>, Semantic>;

export const DEFAULT_SLOT = Symbol('semantic.default');

interface RuntimeSchema {
  [DEFAULT_SLOT]?: string;
  [key: PropertyKey]: RuntimeSchema | string | undefined;
}

// oxfmt-ignore
export type Schema<T> =
  SemanticSlots<T> extends never
    ? never
    : {
        [K in keyof SemanticSlots<T> as
          Schema<SemanticSlots<T>[K]> extends never
            ? never
            : K
        ]?: Schema<SemanticSlots<T>[K]>;
      } & (
        Extract<Slots<T>, string> extends never
          ? {}
          : {
              [DEFAULT_SLOT]?: keyof SemanticSlots<T> & string;
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
function getSemantic(target: Semantic, key: PropertyKey): Semantic {
  const value = target[key];

  if (isPlainObject(value)) {
    return value;
  }

  const semantic: Semantic = {};

  target[key] = semantic;

  return semantic;
}

/**
 * @function mergeStyles
 * @description 按语义化 slot 合并 styles
 * @param base 基础 styles
 * @param custom 自定义 styles
 */
function mergeStyles<T>(base: Partial<Slots<T>>, custom?: Slots<T>): Slots<T> {
  const output: Semantic = {
    ...base
  };

  if (!custom) {
    return output as Slots<T>;
  }

  const stack: StackFrame[] = [
    {
      source: custom,
      target: output
    }
  ];

  let current: StackFrame | undefined;

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
 * @function resolveStyles
 * @description 解析并组合基础 styles 与自定义 styles
 * @param base 基础 styles
 * @param custom 自定义 styles 或 styles resolver
 */
export function resolveStyles<T>(base: Partial<Slots<T>>, custom?: T): T {
  if (isFunction(custom)) {
    return ((...args: Parameters<Extract<T, Resolver>>) => {
      return mergeStyles<T>(base, custom(...args));
    }) as T;
  }

  return mergeStyles<T>(base, custom as Slots<T>) as T;
}

/**
 * @function mergeClassNames
 * @description 按语义化 schema 合并 classNames
 * @param base 基础 classNames
 * @param custom 自定义 classNames
 * @param schema 可选的语义化 classNames schema
 */
function mergeClassNames<T>(base: Partial<Slots<T>>, custom?: Slots<T>, schema?: Schema<T>): Slots<T> {
  const output: Semantic = {};

  const stack: StackFrame[] = [
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

  let current: StackFrame | undefined;

  while ((current = stack.pop())) {
    const { source, target, schema } = current;

    for (const key of Object.keys(source)) {
      const value = source[key];
      const keySchema = schema?.[key];
      const hasSchema = isSchema(keySchema);

      // 普通嵌套对象继续处理子节点。
      if (isPlainObject(value)) {
        const frame: StackFrame = {
          source: value,
          target: getSemantic(target, key)
        };

        if (hasSchema) {
          frame.schema = keySchema;
        }

        stack.push(frame);
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
 * @function resolveClassNames
 * @description 解析并组合基础 classNames 与自定义 classNames
 * @param base 基础 classNames
 * @param custom 自定义 classNames 或 classNames resolver
 * @param schema 可选的语义化 classNames schema
 */
export function resolveClassNames<T>(base: Partial<Slots<T>>, custom?: T, schema?: Schema<T>): T {
  if (isFunction(custom)) {
    return ((...args: Parameters<Extract<T, Resolver>>) => {
      return mergeClassNames<T>(base, custom(...args), schema);
    }) as T;
  }

  return mergeClassNames<T>(base, custom as Slots<T>, schema) as T;
}
