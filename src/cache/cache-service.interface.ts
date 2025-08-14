export interface CacheServiceInterface {
  /**
   * Retrieves a value from the cache by its key.
   *
   * @template T
   * @param {string} key - The cache key.
   * @returns {(T | undefined)} The cached value if present, otherwise undefined.
   */
  get<T>(key: string): T | undefined;

  /**
   * Stores a value in the cache under the specified key.
   *
   * @template T
   * @param {string} key - The cache key.
   * @param {T} value - The value to cache.
   * @param {number} [ttl] - Optional time-to-live in milliseconds.
   * @returns {void}
   */
  set<T>(key: string, value: T, ttl?: number): void;

  /**
   * Deletes a value from the cache by its key.
   *
   * @param {string} key - The cache key to delete.
   * @returns {void}
   */
  del(key: string): void;

  /**
   * Clears the entire cache.
   *
   * @returns {void}
   */
  reset(): void;
}