/**
 * @file apps/backend/src/data-source.ts
 * @summary App/runtime DataSource (uses compiled JS files in dist).
 * @description
 *   - Entity/migration globs point at built JS under dist.
 *   - `migrationsRun` is false; migrations are applied explicitly by CLI (compose/CI) before boot.
 */

import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
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
  migrationsRun: false,
  namingStrategy: new SnakeNamingStrategy(),
});
