import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Role } from '../role/entities/role.entity';
import { UserRole } from '../user/entities/user-role.entity';

@Injectable()
export class RoleRepository {
  private repo!: Repository<Role>;
  private userRoleRepo!: Repository<UserRole>;

  constructor(private readonly _dataSource: DataSource) {}

  onModuleInit() {
    this.repo = this._dataSource.getRepository(Role);
    this.userRoleRepo = this._dataSource.getRepository(UserRole);
  }
  
  findById(id: string): Promise<Role | null> {
    return this.repo.findOne({ where: { id } });
  }

  findByName(name: string): Promise<Role | null> {
    return this.repo.findOne({ where: { name } });
  }

  findAll(): Promise<Role[]> {
    return this.repo.find();
  }

  save(role: Partial<Role>): Promise<Role> {
    return this.repo.save(role);
  }

  remove(role: Role): Promise<Role> {
    return this.repo.softRemove(role);
  }
}