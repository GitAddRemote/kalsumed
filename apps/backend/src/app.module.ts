// apps/backend/src/app.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from './modules/redis/redis.module';
import { DatabaseModule } from './modules/database/database.module';
import { HealthModule } from './modules/health/health.module';
import { UserModule } from './modules/user/user.module';
import { RoleModule } from './modules/role/role.module';
import { SessionModule } from './modules/auth/session/session.module';
import { TokenModule } from './modules/auth/token/token.module';
import * as path from 'path';
import * as Joi from 'joi';
import { jwtConfig, jwtConfigValidationSchema } from './modules/auth/config/jwt.config';
import { OAuthModule } from './modules/auth/oauth/oauth.module';

@Module({
  imports: [
    // --- Configuration ---
    ConfigModule.forRoot({
      isGlobal: true,
      load: [jwtConfig],
      envFilePath: [path.resolve(process.cwd(), '.env.dev')],
      validationSchema: Joi.object({
        // Database
        DATABASE_HOST: Joi.string().required(),
        DATABASE_PORT: Joi.number().default(5432),
        DATABASE_USERNAME: Joi.string().required(),
        DATABASE_PASSWORD: Joi.string().required(),
        DATABASE_NAME: Joi.string().required(),

        // Redis (for RedisModule)
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().default(6379),
        REDIS_PASSWORD: Joi.string().required(),

        // RabbitMQ
        RABBITMQ_USER: Joi.string().optional(),
        RABBITMQ_PASSWORD: Joi.string().optional(),

        // Legacy JWT (if still used elsewhere)
        JWT_SECRET: Joi.string().required(),

        // App
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().default(3000),

        SESSION_SECRET: Joi.string().min(32).required(),
        REDIS_URL: Joi.string().uri().required(),
      }).concat(jwtConfigValidationSchema),
    }),

    // --- TypeORM (Postgres) ---
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
      }),
      inject: [ConfigService],
    }),

    // --- Other modules ---
    RedisModule,
    HealthModule,
    UserModule,
    RoleModule,
    DatabaseModule,
    // --- Auth/session modules ---
    SessionModule,
    TokenModule,
    OAuthModule,
  ],
})
export class AppModule {}
