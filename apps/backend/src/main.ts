import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { runMigrations } from './utils/migration.util';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  try {
    logger.log('Starting application bootstrap...');
    if (process.env.RUN_MIGRATIONS_ON_BOOT === 'true') {
      await runMigrations();
    }

    logger.log('Creating NestJS application...');
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }));

    app.setGlobalPrefix('api');
    app.enableCors();

    const port = process.env.PORT ?? 3000;
    await app.listen(port);
    logger.log(`🚀 Backend running on http://localhost:${port}/api`);
  }
  catch (error) {
    logger.error('❌ Error during bootstrap:', error.message);
    logger.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

void bootstrap();

