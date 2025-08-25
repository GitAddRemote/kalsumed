import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { RedisModule } from './modules/redis/redis.module.js';
import { DatabaseModule } from './modules/database/database.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { UserModule } from './modules/user/user.module.js';
import { RoleModule } from './modules/role/role.module.js';
import { SessionModule } from './modules/auth/session/session.module.js';
import { TokenModule } from './modules/auth/token/token.module.js';
import { resolve } from 'node:path';
import Joi from 'joi';
import jwtConfig, { jwtConfigValidationSchema } from './modules/auth/config/jwt.config.js';
import seedingConfig, { seedingConfigSchema } from './modules/database/seeding.config.js';
import { OAuthModule } from './modules/auth/oauth/oauth.module.js';
import { baseEnvValidationSchema } from './config/env.validation.js'; // ← NEW

const fromRoot = (p: string) => resolve(process.cwd(), p);

// derive environment flags once
const env = process.env.NODE_ENV ?? 'development';
const isCI = !!process.env.CI;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,

      // only read .env files outside CI and non-production
      ignoreEnvFile: isCI || env === 'production',
      envFilePath: isCI
        ? []
        : [
          fromRoot(`.env.${env}.local`),
          fromRoot('.env.local'),
          fromRoot(`.env.${env}`),
          fromRoot('.env'),
        ],

      load: [jwtConfig, seedingConfig],

      // compose base + module-specific schemas
      validationSchema: baseEnvValidationSchema
        .concat(jwtConfigValidationSchema)
        .concat(seedingConfigSchema),

      // surface all missing keys; ignore extra keys (useful in CI/containers)
      validationOptions: {
        abortEarly: false,
        allowUnknown: true,
      },
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres' as const,
        host: cfg.getOrThrow<string>('DATABASE_HOST'),
        port: cfg.getOrThrow<number>('DATABASE_PORT'),
        username: cfg.getOrThrow<string>('DATABASE_USERNAME'),
        password: cfg.getOrThrow<string>('DATABASE_PASSWORD'),
        database: cfg.getOrThrow<string>('DATABASE_NAME'),
        autoLoadEntities: true,
        synchronize: false,
        retryAttempts: 10,
        retryDelay: 2000,
        namingStrategy: new SnakeNamingStrategy(),
      }),
      inject: [ConfigService],
    }),

    RedisModule,
    HealthModule,
    UserModule,
    RoleModule,

    DatabaseModule.register(),

    SessionModule,
    TokenModule,
    OAuthModule,
  ],
})
export class AppModule {}
