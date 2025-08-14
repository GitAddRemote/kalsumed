import { Injectable } from '@nestjs/common';
import { DataSource, Repository, In } from 'typeorm';
import { Permission } from './entities/permission.entity';

@Injectable()
export class PermissionRepository extends Repository<Permission> {
  constructor(private dataSource: DataSource) {
    super(Permission, dataSource.createEntityManager());
  }

  async findByNames(names: string[]): Promise<Permission[]> {
    if (!names.length) return [];
    return this.find({
      where: { name: In(names) },
    });
  }
}
