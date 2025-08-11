import { Inject, Injectable } from '@nestjs/common';
import { REDIS_CLIENT, type RedisClient } from './redis.tokens';

@Injectable()
export class RedisService {
  constructor(@Inject(REDIS_CLIENT) private readonly client: RedisClient) {}

  async ping(): Promise<string> {
    return this.client.ping();
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<string | null> {
    if (ttlSeconds && ttlSeconds > 0) {
      return this.client.set(key, value, { EX: ttlSeconds });
    }
    return this.client.set(key, value);
  }
}