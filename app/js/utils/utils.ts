/**
 * @module utils
 */

import dayjs, { Dayjs, ManipulateType, OpUnitType } from 'dayjs';

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
 * @function formatThousands
 * @description 格式化数字
 * @param number 需要格式话的数字
 * @param precision 小数位保留个数
 */
export function formatThousands(number: number | string = 0, precision: number = 2): string {
  number = Number(number);

  const { Intl } = window;

  if (Intl) {
    return new Intl.NumberFormat('en-us', {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision
    }).format(number);
  }

  const parts = number.toFixed(precision).split('.');

  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return parts.join('.');
}

/**
 * @function createMarkup
 * @description 生成 React HTML 字符串
 * @param html HTML 字符串
 */
export function createMarkup(html: string): { __html: string } {
  return { __html: html };
}

/**
 * @function getLastRangeDate
 * @description 获取当前时间向前指定偏移的时间区间
 * @param value 偏移值
 * @param unit 偏移单位
 */
export function getLastRangeDate(value: number, unit: ManipulateType = 'day'): [start: Dayjs, end: Dayjs] {
  const today = dayjs();

  return [today.subtract(value, unit), today];
}

/**
 * @function getThisRangeDate
 * @description 获取当前时间所在的指定范围日期区间
 * @param unit 指定范围
 * @param overflow 是否能超过当前时间
 */
export function getThisRangeDate(unit: OpUnitType = 'day', overflow: boolean = false): [start: Dayjs, end: Dayjs] {
  const today = dayjs();

  return [today.startOf(unit), overflow ? today.endOf(unit) : today];
}
