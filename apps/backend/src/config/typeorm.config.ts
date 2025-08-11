import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const getEnvVar = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  return value;
};

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres' as const,
  host: getEnvVar('DATABASE_HOST'),
  port: parseInt(getEnvVar('DATABASE_PORT') || '5432', 10),
  username: getEnvVar('DATABASE_USERNAME'),
  password: getEnvVar('DATABASE_PASSWORD'),
  database: getEnvVar('DATABASE_NAME'),
  autoLoadEntities: true, // This will auto-discover entities in modules
  synchronize: false,
  migrations: ['dist/migrations/*.js'],
  migrationsRun: false,
  logging: true,
};
