import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource, Repository, In } from 'typeorm';
import { Role } from '../role/entities/role.entity';
import { Permission } from '../permission/entities/permission.entity';
import { User } from '../user/entities/user.entity';
import { UserRole } from '../user/entities/user-role.entity';
import * as bcrypt from 'bcrypt';

interface RoleSeedDef {
  name: string;
  description?: string;
  isActive?: boolean;
  permissions?: string[];
}

@Injectable()
export class SeederService implements OnModuleInit {
  private readonly logger = new Logger(SeederService.name);

  private roleRepository!: Repository<Role>;
  private permissionRepository!: Repository<Permission>;
  private userRepository!: Repository<User>;
  private userRoleRepository!: Repository<UserRole>;

  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit(): Promise<void> {
    this.roleRepository = this.dataSource.getRepository(Role);
    this.permissionRepository = this.dataSource.getRepository(Permission);
    this.userRepository = this.dataSource.getRepository(User);
    this.userRoleRepository = this.dataSource.getRepository(UserRole);

    if (process.env.NODE_ENV === 'development' || process.env.ENABLE_SEEDING === 'true') {
      try {
        await this.seedRoles();
        await this.seedDefaultAdmin();
        this.logger.log('Seeding complete');
      } catch (e) {
        this.logger.error('Seeding failed', e as Error);
      }
    } else {
      this.logger.log('Seeding disabled (env conditions not met)');
    }
  }

  private readonly rolesToSeed: RoleSeedDef[] = [
    {
      name: 'user',
      description: 'Basic food tracking user',
      permissions: ['track_food', 'view_progress'],
      isActive: true,
    },
    {
      name: 'premium_user',
      description: 'Premium features enabled',
      permissions: ['track_food', 'view_progress', 'ai_insights', 'advanced_analytics'],
      isActive: true,
    },
    {
      name: 'nutritionist',
      description: 'Professional nutritionist',
      permissions: ['view_client_data', 'create_meal_plans', 'export_reports'],
      isActive: true,
    },
    {
      name: 'org_admin',
      description: 'Organization administrator',
      permissions: ['manage_organization', 'view_all_users', 'billing'],
      isActive: true,
    },
  ];

  private async seedRoles(): Promise<void> {
    for (const def of this.rolesToSeed) {
      if (!def.name) continue;

      const existing = await this.roleRepository.findOne({
        where: { name: def.name },
        relations: ['permissions'],
      });

      // Fetch Permission entities for this role
      let permissions: Permission[] = [];
      if (def.permissions?.length) {
        permissions = await this.permissionRepository.find({
          where: { name: In(def.permissions) },
        });
      }

      if (existing) {
        let dirty = false;
        if (def.description && existing.description !== def.description) {
          existing.description = def.description;
          dirty = true;
        }
        if (
          def.permissions &&
          (existing.permissions?.map(p => p.name).sort().join(',') !== permissions.map(p => p.name).sort().join(','))
        ) {
          existing.permissions = permissions;
          dirty = true;
        }
        if (typeof def.isActive === 'boolean' && existing.isActive !== def.isActive) {
          existing.isActive = def.isActive;
          dirty = true;
        }
        if (dirty) {
          await this.roleRepository.save(existing);
          this.logger.log(`Updated role: ${def.name}`);
        } else {
          this.logger.debug(`Role unchanged: ${def.name}`);
        }
      } else {
        const role = this.roleRepository.create({
          name: def.name,
          description: def.description ?? null,
          isActive: def.isActive ?? true,
          permissions,
        });
        await this.roleRepository.save(role);
        this.logger.log(`Created role: ${def.name}`);
      }
    }
  }

  private async seedDefaultAdmin(): Promise<void> {
    const email = 'admin@kalsumed.com';
    const exists = await this.userRepository.findOne({ where: { email } });
    if (exists) {
      this.logger.log('Admin user already exists, skipping');
      return;
    }

    const adminRole = await this.roleRepository.findOne({ where: { name: 'org_admin' } });
    if (!adminRole) {
      this.logger.warn('Role org_admin not found; cannot create admin user');
      return;
    }

    const passwordHash = await bcrypt.hash('admin123', 10);
    const adminUser = this.userRepository.create({
      username: 'admin',
      email,
      passwordHash,
      emailVerified: true,
    });
    await this.userRepository.save(adminUser);

    const link = this.userRoleRepository.create({ user: adminUser, role: adminRole });
    await this.userRoleRepository.save(link);

    this.logger.log('Default admin user created');
  }
}
