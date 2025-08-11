import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host:     process.env.DATABASE_HOST,
  port:    +(process.env.DATABASE_PORT ?? 5432),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [User, Role],
  synchronize: false,    // always use migrations in prod!
  migrations: ['dist/migrations/*.js'],
  migrationsRun: false,
  logging: true,
};
