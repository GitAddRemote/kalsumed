import 'express-session';
declare module 'express-session' {
  interface SessionData {
    [key: string]: unknown;
  }
}

import { Module, NestModule, MiddlewareConsumer, Inject } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import session, { SessionOptions } from 'express-session';
import RedisStore from 'connect-redis';
import { RedisModule } from '../../redis/redis.module.js';
import { REDIS_CLIENT, type RedisClient } from '../../redis/redis.tokens.js';
import { SessionService } from './session.service.js';
import { SessionController } from './session.controller.js';

@Module({
  imports: [ConfigModule, RedisModule],
  providers: [SessionService],
  controllers: [SessionController],
})
export class SessionModule implements NestModule {
  constructor(
    private readonly config: ConfigService,
    @Inject(REDIS_CLIENT) private readonly redisClient: RedisClient,
  ) {}

  configure(consumer: MiddlewareConsumer) {
    const sessionSecret = this.config.get<string>('SESSION_SECRET');
    if (!sessionSecret) throw new Error('SESSION_SECRET must be set');

    const isProd = (this.config.get<string>('NODE_ENV') ?? 'development') === 'production';
    const cookieName = this.config.get<string>('SESSION_COOKIE_NAME') ?? 'sid';
    const cookieDomain = this.config.get<string>('SESSION_COOKIE_DOMAIN') ?? undefined;

    const defaultMaxAgeMs = 1000 * 60 * 60 * 24 * 7;
    const maxAgeMs = Number(this.config.get<string>('SESSION_MAX_AGE_MS') ?? '') || defaultMaxAgeMs;
    const ttlSeconds = Math.max(1, Math.floor(maxAgeMs / 1000));

    const prefix = this.config.get<string>('REDIS_SESSION_PREFIX') ?? 'sess:';
    const disableTouch = this.config.get<string>('SESSION_DISABLE_TOUCH') === 'true';
    const rolling = this.config.get<string>('SESSION_ROLLING') !== 'false';

    const store = new RedisStore({
      client: this.redisClient,
      prefix,
      ttl: ttlSeconds,
      disableTouch,
    });

    const sessionOptions: SessionOptions = {
      name: cookieName,
      secret: sessionSecret,
      store,
      resave: false,
      saveUninitialized: false,
      rolling,
      proxy: isProd,
      cookie: {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        domain: cookieDomain,
        maxAge: maxAgeMs,
      },
      unset: 'destroy',
    };

    consumer.apply(session(sessionOptions)).forRoutes('*');
  }
}
