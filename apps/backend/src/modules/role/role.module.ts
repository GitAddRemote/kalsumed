import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity.js';
import { RoleRepository } from './role.repository.js';
import { RoleService } from './role.service.js';
import { RoleController } from './role.controller.js';
import { PermissionModule } from '../permission/permission.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role]),
    PermissionModule, // <-- Import PermissionModule here
  ],
  providers: [RoleRepository, RoleService],
  controllers: [RoleController],
  exports: [RoleRepository, RoleService],
})
export class RoleModule {}
