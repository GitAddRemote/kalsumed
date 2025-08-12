// apps/backend/src/data-source.ts
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST!,
  port: Number(process.env.DATABASE_PORT ?? '5432'),
  username: process.env.DATABASE_USERNAME!,
  password: process.env.DATABASE_PASSWORD!,
  database: process.env.DATABASE_NAME!,
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/src/migrations/*.js'],
  migrationsRun: true,
});