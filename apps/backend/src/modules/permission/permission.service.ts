// apps/backend/src/modules/permission/permission.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PermissionRepository } from './permission.repository';
import { Permission } from './entities/permission.entity';

@Injectable()
export class PermissionService {
  constructor(private readonly permissions: PermissionRepository) {}

  async findAll(): Promise<Permission[]> {
    return this.permissions.find();
  }

  async findById(id: string): Promise<Permission> {
    const permission = await this.permissions.findOne({ where: { id } });
    if (!permission) {
      throw new NotFoundException(`Permission with id ${id} not found`);
    }
    return permission;
  }

  async findByName(name: string): Promise<Permission> {
    const permission = await this.permissions.findOne({ where: { name } });
    if (!permission) {
      throw new NotFoundException(`Permission with name "${name}" not found`);
    }
    return permission;
  }

  async create(data: Partial<Permission>): Promise<Permission> {
    const permission = this.permissions.create(data);
    return this.permissions.save(permission);
  }

  async update(id: string, data: Partial<Permission>): Promise<Permission> {
    const permission = await this.findById(id);
    Object.assign(permission, data);
    return this.permissions.save(permission);
  }

  async delete(id: string): Promise<void> {
    const permission = await this.findById(id);
    await this.permissions.remove(permission);
  }
}
