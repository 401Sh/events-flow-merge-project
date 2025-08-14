export interface CacheServiceInterface {
  get<T>(key: string): T | undefined;
  set<T>(key: string, value: T, ttl?: number): void;
  del(key: string): void;
  reset(): void;
}