import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

export async function runMigrations(): Promise<void> {
  const logger = new Logger('Migrations');

  try {
    logger.log('Running database migrations...');
    
    const host = process.env.DATABASE_HOST || 'localhost';
    const port = parseInt(process.env.DATABASE_PORT || '5432');
    const username = process.env.DATABASE_USERNAME;
    const password = process.env.DATABASE_PASSWORD;
    const database = process.env.DATABASE_NAME;

    if (!username || !password || !database) {
      throw new Error('Missing required database environment variables: DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_NAME');
    }
    
    const dataSource = new DataSource({
      type: 'postgres',
      host,
      port,
      username,
      password,
      database,
      entities: ['dist/**/*.entity.js'],
      migrations: ['dist/src/migrations/*.js'], // ✅ Correct path
      synchronize: false,
      logging: false,
    });
    
    await dataSource.initialize();
    const migrations = await dataSource.runMigrations();

    if (migrations.length > 0) {
      logger.log(`Successfully ran ${migrations.length} migration(s)`);
      migrations.forEach(migration => {
        logger.log(`✓ ${migration.name}`);
      });
    } else {
      logger.log('Database is up to date - no migrations to run');
    }
    
    await dataSource.destroy();
  } catch (error) {
    logger.error('❌ Migration failed:', error.message);
    logger.error('Stack trace:', error.stack);
    process.exit(1);
  }
}
