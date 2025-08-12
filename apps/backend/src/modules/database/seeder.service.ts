import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Role } from '../role/entities/role.entity';
import { User } from '../user/entities/user.entity';
import { UserRole } from '../user/entities/user-role.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeederService implements OnModuleInit {
  private readonly logger = new Logger(SeederService.name);

  private roleRepository!: Repository<Role>;
  private userRepository!: Repository<User>;
  private userRoleRepository!: Repository<UserRole>;

  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit() {
    this.roleRepository = this.dataSource.getRepository(Role);
    this.userRepository = this.dataSource.getRepository(User);
    this.userRoleRepository = this.dataSource.getRepository(UserRole);

    if (process.env.NODE_ENV === 'development' || process.env.ENABLE_SEEDING === 'true') {
      await this.seedRoles();
      await this.seedDefaultAdmin();
    }
  }

  private async seedRoles() {
    const count = await this.roleRepository.count();
    if (count > 0) {
      this.logger.log('Roles already exist, skipping seed');
      return;
    }

    const initialRoles: Partial<Role>[] = [
      { 
        name: 'user', 
        description: 'Basic food tracking user', 
        isPremium: false, 
        permissions: ['track_food', 'view_progress'],
        isActive: true
      },
      { 
        name: 'premium_user', 
        description: 'Premium features enabled', 
        isPremium: true, 
        permissions: ['track_food', 'view_progress', 'ai_insights', 'advanced_analytics'],
        isActive: true
      },
      { 
        name: 'nutritionist', 
        description: 'Professional nutritionist', 
        isPremium: true, 
        permissions: ['view_client_data', 'create_meal_plans', 'export_reports'],
        isActive: true
      },
      { 
        name: 'org_admin', 
        description: 'Organization administrator', 
        isPremium: true, 
        permissions: ['manage_organization', 'view_all_users', 'billing'],
        isActive: true
      },
    ];

    await this.roleRepository.save(initialRoles);
    this.logger.log('Initial roles seeded successfully');
  }

  private async seedDefaultAdmin() {
    const adminExists = await this.userRepository.findOne({ where: { email: 'admin@kalsumed.com' } });
    if (adminExists) {
      this.logger.log('Admin user already exists, skipping');
      return;
    }

    const adminRole = await this.roleRepository.findOne({ where: { name: 'org_admin' } });
    if (!adminRole) {
      this.logger.warn('Admin role not found, skipping admin user creation');
      return;
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);

    const adminUser = this.userRepository.create({
      username: 'admin',
      email: 'admin@kalsumed.com',
      passwordHash: hashedPassword,
      emailVerified: true,
    });
    await this.userRepository.save(adminUser);

    const userRole = this.userRoleRepository.create({
      user: adminUser,
      role: adminRole,
    });
    await this.userRoleRepository.save(userRole);

    this.logger.log('Default admin user created');
  }
}