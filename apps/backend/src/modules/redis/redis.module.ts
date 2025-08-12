import { Global, Module, OnApplicationShutdown, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createClient } from 'redis';
import { RedisService } from './redis.service';
import { REDIS_CLIENT, type RedisClient } from './redis.tokens';

const redisClientProvider = {
  provide: REDIS_CLIENT,
  useFactory: async (config: ConfigService): Promise<RedisClient> => {
    const logger = new Logger('RedisClient'); // ✅ Add logger
    const url =
      config.get<string>('REDIS_URL') ??
      `redis://${config.get<string>('REDIS_HOST', 'redis')}:${config.get<number>('REDIS_PORT', 6379)}`;

    const client = createClient({
      url,
      socket: { reconnectStrategy: (retries) => Math.min(5000, retries * 100) },
    });

    client.on('error', (err) => logger.error('[redis] client error:', err)); // ✅ Use logger instead of console
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
          private readonly logger = new Logger('RedisShutdown'); // ✅ Add logger
          private shuttingDown = false;

          async onApplicationShutdown(): Promise<void> {
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
              this.logger.warn('[redis] graceful quit failed, forcing disconnect:', err); // ✅ Use logger
              try {
                await client.disconnect(); // ✅ Add await to fix floating promise
              } catch (disconnectErr) {
                this.logger.error('[redis] force disconnect failed:', disconnectErr); // ✅ Use logger
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