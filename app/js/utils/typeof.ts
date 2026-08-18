/**
 * @module typeof
 */

export type TypedArray =
  | Int8Array
  | Int16Array
  | Int32Array
  | Uint8Array
  | Uint16Array
  | Uint32Array
  | Float32Array
  | Float64Array
  | BigInt64Array
  | BigUint64Array
  | Uint8ClampedArray;

// 获取 TypedArray 原型
const TypedArray = Object.getPrototypeOf(Uint8Array);

/**
 * @function assert
 * @description 断言
 * @param cond 断言条件
 * @param message 断言失败消息
 */
export function assert<T>(cond: T, message: string): asserts cond {
  if (!cond) throw new Error(message);
}

/**
 * @function isBigInt
 * @description 是否为大整数
 * @param value 需要验证的值
 */
export function isBigInt(value: unknown): value is bigint {
  return toString.call(value) === '[object BigInt]';
}

/**
 * @function isFunction
 * @description 是否为函数
 * @param value 需要验证的值
 */
export function isFunction(value: unknown): value is Function {
  return typeof value === 'function';
}

/**
 * @function isTypedArray
 * @description 是否为 TypedArray
 * @param value 需要验证的值
 */
export function isTypedArray(value: unknown): value is TypedArray {
  return value instanceof TypedArray;
}

/**
 * @function isObject
 * @description 是否为对象
 * @param value 需要验证的值
 */
export function isObject(value: unknown): value is object {
  return Object.prototype.toString.call(value) === '[object Object]';
}

/**
 * @function isString
 * @description 是否为字符串
 * @param value 需要验证的值
 */
export function isString(value: unknown): value is string {
  return Object.prototype.toString.call(value) === '[object String]';
}

/**
 * @function isNumber
 * @description 是否为数字
 * @param value 需要验证的值
 */
export function isNumber(value: unknown): value is number {
  return Object.prototype.toString.call(value) === '[object Number]';
}

/**
 * @function isBoolean
 * @description 是否为布尔值
 * @param value 需要验证的值
 */
export function isBoolean(value: unknown): value is boolean {
  return Object.prototype.toString.call(value) === '[object Boolean]';
}

/**
 * @function isPlainObject
 * @description 是否为普通对象
 * @param value 需要验证的值
 */
export function isPlainObject(value: unknown): value is Record<PropertyKey, unknown> {
  if (!isObject(value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);

  return prototype === Object.prototype || prototype === null;
}
