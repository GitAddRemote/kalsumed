/**
 * SeederService for initializing permissions, roles, and a default admin user in the database.
 *
 * @file apps/backend/src/modules/database/seeder.service.ts
 * @author Demian (GitAddRemote)
 * @copyright (c) 2025 Presstronic Studios LLC
 * @description Handles seeding of permissions, roles, and admin user for the backend application.
 */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource, Repository, In } from 'typeorm';
import { Role } from '../role/entities/role.entity';
import { Permission } from '../permission/entities/permission.entity';
import { User } from '../user/entities/user.entity';
import { UserRole } from '../user/entities/user-role.entity';
import * as bcrypt from 'bcrypt';

/**
 * Definition for a role to be seeded, including its permissions.
 */
interface RoleSeedDef {
  /** Name of the role */
  name: string;
  /** Optional description of the role */
  description?: string | null;
  /** Whether the role is active */
  isActive?: boolean;
  /** List of permission names for the role */
  permissions?: string[];
}

/**
 * SeederService is responsible for seeding permissions, roles, and a default admin user.
 */
@Injectable()
export class SeederService implements OnModuleInit {
  private readonly logger = new Logger(SeederService.name);

  private roleRepository!: Repository<Role>;
  private permissionRepository!: Repository<Permission>;
  private userRepository!: Repository<User>;
  private userRoleRepository!: Repository<UserRole>;

  /**
   * Constructs the SeederService with a TypeORM DataSource.
   * @param dataSource The TypeORM DataSource instance.
   */
  constructor(private readonly dataSource: DataSource) {}

  /**
   * Runs the seeder logic on module initialization.
   */
  async onModuleInit(): Promise<void> {
    await this.run();
  }

  /**
   * Main entry point for running all seed operations in a transaction.
   * Seeds permissions, roles, and the default admin user.
   */
  async run(): Promise<void> {
    try {
      await this.dataSource.transaction(async (manager) => {
        this.roleRepository = manager.getRepository(Role);
        this.permissionRepository = manager.getRepository(Permission);
        this.userRepository = manager.getRepository(User);
        this.userRoleRepository = manager.getRepository(UserRole);

        const permissionMap = await this.upsertPermissions();
        await this.seedRoles(permissionMap);
        await this.seedDefaultAdmin();
      });

      this.logger.log('Seeding complete');
    } catch (e: unknown) {
      this.logger.error('Seeding failed', e instanceof Error ? e : new Error('Unknown error'));
      throw e;
    }
  }

  /**
   * List of roles to seed, including their permissions.
   */
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

  /**
   * Ensures all permissions required by roles exist in the database.
   * Creates any missing permissions and returns a map of permission name to Permission entity.
   * @returns Map of permission names to Permission entities.
   */
  private async upsertPermissions(): Promise<Map<string, Permission>> {
    // Collect all permission names from rolesToSeed
    const names = new Set<string>();
    for (const role of this.rolesToSeed) (role.permissions ?? []).forEach((p) => names.add(p));
    const allNames = Array.from(names);
    if (!allNames.length) return new Map();

    // Find existing permissions
    const existing = await this.permissionRepository.find({ where: { name: In(allNames) } });
    const byName = new Map<string, Permission>(existing.map((p) => [p.name, p]));

    // Find missing permissions
    const missing = allNames.filter((n) => !byName.has(n));
    if (missing.length) {
      const created = await this.permissionRepository.save(
        missing.map((n) => this.permissionRepository.create({ name: n }))
      );
      created.forEach((p) => byName.set(p.name, p));
      this.logger.log(`Created ${created.length} permission(s): ${missing.join(', ')}`);
    } else {
      this.logger.debug('No missing permissions to create');
    }

    return byName;
  }

  /**
   * Seeds roles and their permissions into the database.
   * Updates existing roles if their permissions or properties have changed.
   * @param permissionMap Map of permission names to Permission entities.
   */
  private async seedRoles(permissionMap: Map<string, Permission>): Promise<void> {
    for (const def of this.rolesToSeed) {
      if (!def.name) continue;

      const permsForRole = (def.permissions ?? [])
        .map((n) => permissionMap.get(n))
        .filter(Boolean) as Permission[];

      const existing = await this.roleRepository.findOne({
        where: { name: def.name },
        relations: ['permissions'],
      });

      if (existing) {
        let dirty = false;

        if (typeof def.description !== 'undefined' && existing.description !== def.description) {
          existing.description = def.description ?? null;
          dirty = true;
        }

        const existingPerms = (existing.permissions ?? []).map((p) => p.name).sort().join(',');
        const newPerms = permsForRole.map((p) => p.name).sort().join(',');
        if ((def.permissions?.length ?? 0) > 0 && existingPerms !== newPerms) {
          existing.permissions = permsForRole;
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
          permissions: permsForRole,
        });
        await this.roleRepository.save(role);
        this.logger.log(`Created role: ${def.name}`);
      }
    }
  }

  /**
   * Seeds a default admin user with the `org_admin` role if one does not already exist.
   * Uses the password from the `ADMIN_DEFAULT_PASSWORD` environment variable, or a default in development.
   * Throws an error if no password is set in production.
   */
  private async seedDefaultAdmin(): Promise<void> {
    const email = 'admin@kalsumed.com';
    const existing = await this.userRepository.findOne({ where: { email } });
    if (existing) {
      this.logger.log('Admin user already exists, skipping');
      return;
    }

    const adminRole = await this.roleRepository.findOne({ where: { name: 'org_admin' } });
    if (!adminRole) {
      this.logger.warn('Role org_admin not found; cannot create admin user');
      return;
    }

    const isProd = process.env.NODE_ENV === 'production';
    const rawFromEnv = process.env.ADMIN_DEFAULT_PASSWORD;
    const rawPassword = rawFromEnv ?? (isProd ? null : 'admin123');
    if (!rawPassword) {
      throw new Error('ADMIN_DEFAULT_PASSWORD is required when seeding in production.');
    }

    const saltRounds = Number(process.env.ADMIN_PASSWORD_SALT_ROUNDS ?? 10);
    const passwordHash = await bcrypt.hash(rawPassword, saltRounds);

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
