import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Redis as RedisClient } from 'ioredis';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private client: RedisClient;

  constructor(private readonly config: ConfigService) {
    this.client = new Redis({
      host: config.get('REDIS_HOST', 'localhost'),
      port: Number(config.get<number>('REDIS_PORT', 6379)),
      password: config.get<string>('REDIS_PASSWORD'),
    });
  }

  async ping(): Promise<string> {
    return this.client.ping();
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string): Promise<'OK'> {
    return this.client.set(key, value);
  }
}
