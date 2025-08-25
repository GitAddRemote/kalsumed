/**
 * @file apps/backend/src/data-source.cli.ts
 * @summary CLI-only DataSource for TypeORM (ESM + ts-node).
 * @description
 *   - Loads env via dotenv (compose/CI provide envs; this is a no-op fallback locally).
 *   - Uses TypeScript globs under src so no pre-build is required for CLI.
 *   - Paired with `typeorm-ts-node-esm` in package.json scripts.
 */

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import * as dotenv from 'dotenv';

dotenv.config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST!,
  port: Number(process.env.DATABASE_PORT ?? 5432),
  username: process.env.DATABASE_USERNAME!,
  password: process.env.DATABASE_PASSWORD!,
  database: process.env.DATABASE_NAME!,
  namingStrategy: new SnakeNamingStrategy(),
  synchronize: false,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
});
