import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from './modules/redis/redis.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.dev', '.env'],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        host: cfg.get<string>('DATABASE_HOST'),
        port: cfg.get<number>('DATABASE_PORT', 5432),
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
