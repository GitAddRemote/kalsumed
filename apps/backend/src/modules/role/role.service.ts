import { Injectable, NotFoundException } from '@nestjs/common';
import { RoleRepository } from './role.repository.js';
import { PermissionRepository } from '../permission/permission.repository.js';
import { Role } from './entities/role.entity.js';
import { Permission } from '../permission/entities/permission.entity.js';
import { In } from 'typeorm';
import { UpdateRoleDto } from './dto/update-role.dto.js';

@Injectable()
export class RoleService {
  constructor(
    private readonly roles: RoleRepository,
    private readonly permissions: PermissionRepository,
  ) {}

  /**
   * Get a role by its UUID
   */
  async getById(id: string): Promise<Role> {
    const role = await this.roles.findById(id);
    if (!role) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }
    return role;
  }

  /**
   * Get a role by its name
   */
  async getByName(name: string): Promise<Role> {
    const role = await this.roles.findByName(name);
    if (!role) {
      throw new NotFoundException(`Role with name "${name}" not found`);
    }
    return role;
  }

  /**
   * Create a new role
   */
  async create(name: string, description?: string, permissions?: string[]): Promise<Role> {
    let foundPermissions: Permission[] = [];
    if (permissions?.length) {
      foundPermissions = await this.permissions.find({
        where: { name: In(permissions) },
      });
      if (foundPermissions.length !== permissions.length) {
        throw new NotFoundException('Some permissions not found');
      }
    }
    return this.roles.save({
      name,
      description: description ?? null,
      permissions: foundPermissions,
    });
  }

  /**
   * Update an existing role
   */
  async update(id: string, attrs: UpdateRoleDto): Promise<Role> {
    const role = await this.getById(id);

    if (attrs.permissions) {
      const foundPermissions = await this.permissions.find({
        where: { name: In(attrs.permissions) },
      });
      if (foundPermissions.length !== attrs.permissions.length) {
        throw new NotFoundException('Some permissions not found');
      }
      // Map Permission[] to string[] (e.g., permission names)
      attrs = {
        ...attrs,
        permissions: foundPermissions.map(permission => permission.name)
      };
    }

    Object.assign(role, attrs);
    return this.roles.save(role);
  }

  /**
   * Soft-delete a role
   */
  async delete(id: string): Promise<void> {
    const role = await this.getById(id);
    await this.roles.remove(role);
  }

  /**
   * List all roles
   */
  async listAll(): Promise<Role[]> {
    return this.roles.findAll();
  }
}
