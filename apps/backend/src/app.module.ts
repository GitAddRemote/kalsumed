/**
 * @file apps/backend/src/app.module.ts
 * @summary Root NestJS module wired with Config, TypeORM, Redis, Health, Auth, and conditional OAuth.
 * @description
 *  - Reads .env files only in non-CI, non-production environments.
 *  - Composes Joi validation from base + jwt + seeding schemas.
 *  - Uses SnakeNamingStrategy and disables synchronize for safety.
 *  - Registers OAuth providers conditionally via `OAuthModule.register()`.
 * @author
 *   Demian (GitAddRemote)
 * @copyright
 *   (c) 2025 Presstronic Studios LLC
 */

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { resolve } from 'node:path';

import { RedisModule } from './modules/redis/redis.module.js';
import { DatabaseModule } from './modules/database/database.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { UserModule } from './modules/user/user.module.js';
import { RoleModule } from './modules/role/role.module.js';
import { SessionModule } from './modules/auth/session/session.module.js';
import { TokenModule } from './modules/auth/token/token.module.js';

import jwtConfig, { jwtConfigValidationSchema } from './modules/auth/config/jwt.config.js';
import seedingConfig, { seedingConfigSchema } from './modules/database/seeding.config.js';
import { OAuthModule } from './modules/auth/oauth/oauth.module.js';
import { baseEnvValidationSchema } from './config/env.validation.js';

const fromRoot = (p: string) => resolve(process.cwd(), p);

// Derive environment flags once
const env = process.env.NODE_ENV ?? 'development';
const isCI = !!process.env.CI;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,

      // Only read .env files outside of CI and production
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

      // Compose base + module-specific schemas
      validationSchema: baseEnvValidationSchema
        .concat(jwtConfigValidationSchema)
        .concat(seedingConfigSchema),

      // Surface all missing keys; allow extra keys (helpful in CI/containers)
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

    // Feature modules
    RedisModule,
    HealthModule,
    UserModule,
    RoleModule,

    // Seeder toggles via SEEDING_MODE in non-prod
    DatabaseModule.register(),

    // Auth
    SessionModule,
    TokenModule,

    // Conditional OAuth strategies
    OAuthModule.register(),
  ],
})
export class AppModule {}
