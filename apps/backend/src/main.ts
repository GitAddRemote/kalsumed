import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { runMigrations } from './utils/migration.util';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  try {
    // 🚨 THIS MUST RUN FIRST - BEFORE NestFactory.create()
    logger.log('Starting application bootstrap...');
    await runMigrations();
    
    // Create app AFTER migrations
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

    const port = process.env.PORT || 3000;
    await app.listen(port);
    logger.log(`🚀 Backend running on http://localhost:${port}/api`);
  }
  catch (error) {
    logger.error('❌ Error during bootstrap:', error.message);
    logger.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

bootstrap();

