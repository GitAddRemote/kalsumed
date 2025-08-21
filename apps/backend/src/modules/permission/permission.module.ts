import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity.js';
import { PermissionRepository } from './permission.repository.js';
import { PermissionService } from './permission.service.js';
import { PermissionController } from './permission.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Permission])],
  providers: [PermissionRepository, PermissionService],
  controllers: [PermissionController],
  exports: [PermissionRepository, PermissionService],
})
export class PermissionModule {}
