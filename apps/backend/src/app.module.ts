// apps/backend/src/app.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from './modules/redis/redis.module';
import { HealthModule } from './modules/health/health.module';
import * as path from 'path';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [ path.resolve(process.cwd(), '.env.dev') ],
      // envFilePath: [ path.resolve(__dirname, '..', '.env.dev') ],
      validationSchema: Joi.object({
        // Database
        DATABASE_HOST: Joi.string().required(),
        DATABASE_PORT: Joi.number().default(5432),
        DATABASE_USERNAME: Joi.string().required(),
        DATABASE_PASSWORD: Joi.string().required(),
        DATABASE_NAME: Joi.string().required(),

        // Redis
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().default(6379),
        REDIS_PASSWORD: Joi.string().required(),

        // RabbitMQ (optional if not used directly here)
        RABBITMQ_USER: Joi.string().optional(),
        RABBITMQ_PASSWORD: Joi.string().optional(),

        // Auth & App
        JWT_SECRET: Joi.string().required(),
        NODE_ENV: Joi.string()
          .valid('development','production','test')
          .default('development'),
        PORT: Joi.number().default(3000),
      }),
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        host:     cfg.get<string>('DATABASE_HOST'),
        port:     cfg.get<number>('DATABASE_PORT'),
        username: cfg.get<string>('DATABASE_USERNAME'),
        password: cfg.get<string>('DATABASE_PASSWORD'),
        database: cfg.get<string>('DATABASE_NAME'),
        autoLoadEntities: true,
        synchronize: false,
        retryAttempts: 10,
        retryDelay: 2000,
      }),
    }),

    RedisModule,
    HealthModule,
  ],
})
export class AppModule {}

