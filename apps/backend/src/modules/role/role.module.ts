import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { RoleRepository } from './role.repository';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { PermissionModule } from '../permission/permission.module';

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
