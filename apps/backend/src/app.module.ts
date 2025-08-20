import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { RedisModule } from './modules/redis/redis.module';
import { DatabaseModule } from './modules/database/database.module';
import { HealthModule } from './modules/health/health.module';
import { UserModule } from './modules/user/user.module';
import { RoleModule } from './modules/role/role.module';
import { SessionModule } from './modules/auth/session/session.module';
import { TokenModule } from './modules/auth/token/token.module';
import * as path from 'path';
import * as Joi from 'joi';
import jwtConfig, { jwtConfigValidationSchema } from './modules/auth/config/jwt.config';
import seedingConfig, { seedingConfigSchema } from './modules/database/seeding.config';
import { OAuthModule } from './modules/auth/oauth/oauth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [jwtConfig, seedingConfig],
      // Resolve for both ts-node (src) and dist builds
      envFilePath: [
        path.resolve(process.cwd(), '.env.dev'),
        path.resolve(__dirname, '..', '.env.dev'),
      ],
      validationSchema: Joi.object({
        DATABASE_HOST: Joi.string().required(),
        DATABASE_PORT: Joi.number().default(5432),
        DATABASE_USERNAME: Joi.string().required(),
        DATABASE_PASSWORD: Joi.string().required(),
        DATABASE_NAME: Joi.string().required(),

        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().default(6379),
        REDIS_PASSWORD: Joi.string().required(),

        RABBITMQ_USER: Joi.string().optional(),
        RABBITMQ_PASSWORD: Joi.string().optional(),

        JWT_ACCESS_SECRET: Joi.string().required(),

        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().default(3000),

        SESSION_SECRET: Joi.string().min(32).required(),
        REDIS_URL: Joi.string().uri().required(),
      })
        .concat(jwtConfigValidationSchema)
        .concat(seedingConfigSchema),
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
