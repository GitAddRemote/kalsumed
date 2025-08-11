import { Global, Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createClient } from 'redis';
import { RedisService } from './redis.service';
import { REDIS_CLIENT, type RedisClient } from './redis.tokens';

const redisClientProvider = {
  provide: REDIS_CLIENT,
  useFactory: async (config: ConfigService): Promise<RedisClient> => {
    const url =
      config.get<string>('REDIS_URL') ??
      `redis://${config.get<string>('REDIS_HOST', 'redis')}:${config.get<number>('REDIS_PORT', 6379)}`;

    const client = createClient({
      url,
      socket: { reconnectStrategy: (retries) => Math.min(5000, retries * 100) },
    });

    client.on('error', (err) => console.error('[redis] client error:', err));
    await client.connect();
    return client;
  },
  inject: [ConfigService],
};

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    redisClientProvider,
    RedisService,
    {
      provide: 'REDIS_SHUTDOWN_HOOK',
      useFactory: (client: RedisClient) =>
        new (class implements OnApplicationShutdown {
          async onApplicationShutdown() {
            try {
              await client.quit();
            } catch {}
          }
        })(),
      inject: [REDIS_CLIENT],
    },
  ],
  exports: [REDIS_CLIENT, RedisService],
})
export class RedisModule {}