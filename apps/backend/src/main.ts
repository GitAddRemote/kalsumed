import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix, CORS, etc.
  app.setGlobalPrefix('api');
  app.enableCors();

  await app.listen(process.env.PORT || 3000);
  console.log(`🚀 Backend running on http://localhost:${process.env.PORT || 3000}/api`);
}
bootstrap();

