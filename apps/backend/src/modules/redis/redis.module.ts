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
          private shuttingDown = false;

          async onApplicationShutdown() {
            if (this.shuttingDown) return;
            this.shuttingDown = true;

            try {
              if (!client.isOpen) return;

              const timeoutMs = 3000;
              const quit = client.quit();
              await Promise.race([
                quit,
                new Promise((_, reject) =>
                  setTimeout(() => reject(new Error('Redis quit timed out')), timeoutMs),
                ),
              ]);
            } catch (err) {
              console.warn('[redis] graceful quit failed, forcing disconnect:', err);
              try {
                client.disconnect();
              } catch (disconnectErr) {
                console.error('[redis] force disconnect failed:', disconnectErr);
              }
            }
          }
        })(),
      inject: [REDIS_CLIENT],
    },
  ],
  exports: [REDIS_CLIENT, RedisService],
})
export class RedisModule {}