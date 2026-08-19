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

type Resolver = (...args: any[]) => any;

type Semantic = Record<string, unknown>;

type StringPart<T> = Extract<T, string>;

type ObjectPart<T> = Extract<T, Semantic>;

interface RuntimeSchema {
  [DEFAULT_SLOT]?: string;
  [key: string]: RuntimeSchema | string | undefined;
}

export const DEFAULT_SLOT = Symbol('semantic.default');

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
function resolveStyles(base: Semantic, custom?: Semantic): Semantic {
  const output: Semantic = {
    ...base
  };

  if (!custom) {
    return output;
  }

  for (const key of Object.keys(custom)) {
    const baseValue = output[key];
    const customValue = custom[key];

    if (isPlainObject(baseValue) && isPlainObject(customValue)) {
      output[key] = {
        ...baseValue,
        ...customValue
      };
    } else {
      output[key] = customValue;
    }
  }

  return output;
}

// oxfmt-ignore
export type SemanticSchema<T> =
  [ObjectPart<SemanticSlots<T>>] extends [never]
    ? never
    : {
        [K in keyof ObjectPart<SemanticSlots<T>> as
          SemanticSchema<ObjectPart<SemanticSlots<T>>[K]> extends never
            ? never
            : K]?: SemanticSchema<ObjectPart<SemanticSlots<T>>[K]>;
      } & (
        [StringPart<SemanticSlots<T>>] extends [never]
          ? {}
          : {
              [DEFAULT_SLOT]?: keyof ObjectPart<SemanticSlots<T>> & string;
            }
      );

/**
 * @type SemanticSlots
 * @description 语义化 slots 类型
 */
export type SemanticSlots<C> = C extends Resolver ? ReturnType<C> : Exclude<C, Resolver>;

/**
 * @function combineStyles
 * @description 组合基础 styles 与自定义 styles
 * @param base 基础 styles
 * @param custom 自定义 styles
 */
export function combineStyles<C>(base: Partial<SemanticSlots<C>>, custom?: C): C {
  if (isFunction(custom)) {
    return ((...args: Parameters<Extract<C, Resolver>>) => {
      return resolveStyles(base as Semantic, custom(...args) as Semantic | undefined) as C;
    }) as C;
  }

  return resolveStyles(base as Semantic, custom as Semantic | undefined) as C;
}

/**
 * @function resolveClassNames
 * @description 按语义化 schema 合并 classNames
 * @param schema 语义化 classNames schema
 * @param base 基础 classNames
 * @param custom 自定义 classNames
 */
function resolveClassNames(schema: RuntimeSchema, base: Semantic, custom?: Semantic): Semantic {
  const output: Semantic = {};
  const stack: ClassNamesFrame[] = [];

  // 后进先出，确保 base 先处理，custom 后处理。
  if (custom) {
    stack.push({
      schema,
      source: custom,
      target: output
    });
  }

  stack.push({
    schema,
    source: base,
    target: output
  });

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
      if (isSchema(keySchema) && keySchema[DEFAULT_SLOT]) {
        const slot = getSemantic(target, key);

        slot[keySchema[DEFAULT_SLOT]] = clsx(slot[keySchema[DEFAULT_SLOT]] as ClassValue, value as ClassValue);
        continue;
      }

      // 普通叶子 className 直接追加。
      target[key] = clsx(target[key] as ClassValue, value as ClassValue);
    }
  }

  return output;
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
      return resolveClassNames(schema as RuntimeSchema, base as Semantic, custom(...args) as Semantic | undefined) as C;
    }) as C;
  }

  return resolveClassNames(schema as RuntimeSchema, base as Semantic, custom as Semantic | undefined) as C;
}
