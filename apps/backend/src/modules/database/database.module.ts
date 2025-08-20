import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Role } from '../role/entities/role.entity';
import { UserRole } from '../user/entities/user-role.entity';
import { Permission } from '../permission/entities/permission.entity';
import { SeederService } from './seeder.service';

@Module({})
export class DatabaseModule {
  static register(): DynamicModule {
    const mode = process.env.SEEDING_MODE ?? 'auto';
    const isProd = process.env.NODE_ENV === 'production';
    const isSeedingEnabled = mode === 'force' || (mode === 'auto' && !isProd);

    return {
      module: DatabaseModule,
      imports: [
        ConfigModule,
        TypeOrmModule.forFeature([User, Role, UserRole, Permission]),
      ],
      providers: isSeedingEnabled ? [SeederService] : [],
      exports: isSeedingEnabled ? [SeederService] : [],
    };
  }
}
