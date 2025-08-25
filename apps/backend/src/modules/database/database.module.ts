/**
 * @file DatabaseModule
 * @summary Registers TypeORM feature modules and (optionally) the SeederService based on env flags.
 *          Seeding is enabled when SEEDING_MODE=force OR (SEEDING_MODE=auto and NODE_ENV!==production).
 * @author Presstronic
 */

import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity.js';
import { Role } from '../role/entities/role.entity.js';
import { UserRole } from '../user/entities/user-role.entity.js';
import { Permission } from '../permission/entities/permission.entity.js';
import { SeederService } from './seeder.service.js';

/**
 * Injection token that exposes whether seeding is enabled for this boot.
 * Other modules can inject this to toggle behavior in tests/CI if desired.
 */
export const SEEDING_ENABLED = 'SEEDING_ENABLED';

@Module({})
export class DatabaseModule {
  static register(): DynamicModule {
    // Keep the simple, early evaluation (DI not available in dynamic factory).
    const mode = process.env.SEEDING_MODE ?? 'auto'; // 'auto' | 'force' | 'off' (treat unknown as 'auto')
    const env = process.env.NODE_ENV ?? 'development';
    const isProd = env === 'production';

    // Enabled when forced, or when auto and not production.
    const isSeedingEnabled = mode === 'force' || (mode === 'auto' && !isProd);

    return {
      module: DatabaseModule,
      imports: [
        ConfigModule, // so downstream services can inject ConfigService
        TypeOrmModule.forFeature([User, Role, UserRole, Permission]),
      ],
      providers: [
        { provide: SEEDING_ENABLED, useValue: isSeedingEnabled },
        ...(isSeedingEnabled ? [SeederService] : []),
      ],
      exports: [
        SEEDING_ENABLED,
        ...(isSeedingEnabled ? [SeederService] : []),
      ],
    };
  }
}
