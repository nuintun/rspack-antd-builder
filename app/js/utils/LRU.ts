/**
 * @module LRU
 */

export class LRU<K, V> {
  #cache: Map<K, V>;
  #capacity: number;

  constructor(capacity: number) {
    if (capacity <= 0 || !Number.isInteger(capacity)) {
      throw new RangeError('capacity must be a positive integer');
    }

    this.#cache = new Map();
    this.#capacity = capacity;
  }

  get size(): number {
    return this.#cache.size;
  }

  get capacity(): number {
    return this.#capacity;
  }

  has(key: K): boolean {
    return this.#cache.has(key);
  }

  get(key: K): V | undefined {
    const cache = this.#cache;
    const value = cache.get(key);

    if (cache.has(key)) {
      cache.delete(key);
      cache.set(key, value as V);
    }

    return value;
  }

  set(key: K, value: V): void {
    const cache = this.#cache;

    if (cache.has(key)) {
      cache.delete(key);
    } else if (cache.size >= this.#capacity) {
      const head = cache.keys().next();

      if (!head.done) {
        cache.delete(head.value);
      }
    }

    cache.set(key, value);
  }

  delete(key: K): void {
    this.#cache.delete(key);
  }

  clear(): void {
    this.#cache.clear();
  }

  // 复合操作
  getOrInsert(key: K, value: V): V {
    if (this.has(key)) {
      return this.get(key) as V;
    }

    this.set(key, value);

    return value;
  }

  getOrInsertComputed(key: K, callback: (key: K) => V): V {
    if (this.has(key)) {
      return this.get(key) as V;
    }

    const value = callback(key);

    this.set(key, value);

    return value;
  }

  keys(): IterableIterator<K> {
    return this.#cache.keys();
  }

  values(): IterableIterator<V> {
    return this.#cache.values();
  }

  entries(): IterableIterator<[K, V]> {
    return this.#cache.entries();
  }

  [Symbol.iterator](): IterableIterator<[K, V]> {
    return this.entries();
  }

  // 序列化
  toJSON(): { key: K; value: V }[] {
    const json: { key: K; value: V }[] = [];

    for (const [key, value] of this) {
      json.push({ key, value });
    }

    return json;
  }

  toString(): string {
    const strings: string[] = [];

    for (const [key, value] of this) {
      strings.push(`${key}:${value}`);
    }

    return strings.join(' < ');
  }
}
