import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from '../modules/database/seeder.service.js';
import { User } from '../modules/user/entities/user.entity.js';
import { Role } from '../modules/role/entities/role.entity.js';
import { UserRole } from '../modules/user/entities/user-role.entity.js';
import { Permission } from '../modules/permission/entities/permission.entity.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forFeature([User, Role, UserRole, Permission]),
  ],
  providers: [SeederService],
})
export class SeedModule {}
