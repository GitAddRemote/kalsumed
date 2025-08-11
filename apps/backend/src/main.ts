import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,               // strip any properties not in your DTO
    forbidNonWhitelisted: true,    // throw on unexpected properties
    transform: true,               // convert payloads to DTO instances
    transformOptions: {
      enableImplicitConversion: true, // auto-cast primitives (e.g. “42” → 42)
    },
  }));

  // Global prefix, CORS, etc.
  app.setGlobalPrefix('api');
  app.enableCors();

  await app.listen(process.env.PORT || 3000);
  console.log(`🚀 Backend running on http://localhost:${process.env.PORT || 3000}/api`);
}
bootstrap();

