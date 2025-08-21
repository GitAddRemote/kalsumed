import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { SeedModule } from './seed.module.js';
import { SeederService } from '../modules/database/seeder.service.js';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(SeedModule, {
    logger: ['log', 'error', 'warn'],
  });

  const logger = new Logger('SeedCLI');
  try {
    const seeder = app.get(SeederService);
    await seeder.run();
    logger.log('Seeding completed from CLI.');
    process.exit(0);
  } catch (err) {
    logger.error('Seeding failed from CLI', err);
    process.exit(1);
  } finally {
    await app.close();
  }
}

await bootstrap();
