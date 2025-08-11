import { Injectable, NotFoundException } from '@nestjs/common';
import { RoleRepository } from './role.repository';
import { Role } from './entities/role.entity';

@Injectable()
export class RoleService {
  constructor(private readonly roles: RoleRepository) {}

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
  async create(name: string, description?: string): Promise<Role> {
    return this.roles.save({ name, description });
  }

  /**
   * Update an existing role
   */
  async update(id: string, attrs: Partial<Role>): Promise<Role> {
    const role = await this.getById(id);
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
