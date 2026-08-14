/**
 * @module TypedMap
 * @description 泛型 Map 结构，支持基于 key 的类型推导
 * @template T 映射对象类型，键为 key 类型，值为对应的 value 类型
 */
export interface TypedMap<T extends Record<keyof object, unknown>> extends Map<keyof T, T[keyof T]> {
  /**
   * @description 检查是否存在指定的键（类型安全的重载）
   * @param key 键名
   * @returns 存在返回 true，否则返回 false
   */
  has: <K extends keyof T>(key: K) => boolean;

  /**
   * @description 设置键值对（类型安全的重载）
   * @param key 键名，必须是 T 中定义的键之一
   * @param value 值，类型必须与键对应的值类型匹配
   * @returns 返回当前实例，支持链式调用
   */
  set: <K extends keyof T>(key: K, value: T[K]) => this;

  /**
   * @description 获取指定键的值（类型安全的重载）
   * @param key 键名
   * @returns 对应的值，如果不存在则返回 undefined
   */
  get: <K extends keyof T>(key: K) => T[K] | undefined;

  /**
   * @description 删除指定键的键值对（类型安全的重载）
   * @param key 键名
   * @returns 删除成功返回 true，键不存在返回 false
   */
  delete: <K extends keyof T>(key: K) => boolean;
}
