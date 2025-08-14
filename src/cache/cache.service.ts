import { Injectable, Logger } from '@nestjs/common';
import { CacheServiceInterface } from './cache-service.interface';
import { LRUCache } from 'lru-cache';
import {
  CACHE_DEFAULT_TTL,
  CACHE_MAX_AMOUNT,
} from 'src/common/constants/cache.constant';

@Injectable()
export class CacheService implements CacheServiceInterface {
  private readonly logger = new Logger(CacheService.name);

  private readonly cache: LRUCache<string, any>;

  constructor() {
    this.cache = new LRUCache<string, any>({
      max: CACHE_MAX_AMOUNT,
      ttl: CACHE_DEFAULT_TTL,
    });
  }

  get<T>(key: string): T | undefined {
    const value = this.cache.get(key);

    this.logger.debug(`Cache get key ${key} and found value ${value}`);
    return value;
  }


  set<T>(key: string, value: T, ttl?: number): void {
    if (ttl) {
      this.cache.set(key, value, { ttl });
    } else {
      this.cache.set(key, value);
    }
    this.logger.debug(`Cache set key ${key} and value ${value}`);
  }


  del(key: string): void {
    this.cache.delete(key);
    this.logger.debug(`Cache deleted key ${key}`);
  }


  reset(): void {
    this.cache.clear();
    this.logger.debug('Cache has been reset');
  }
}