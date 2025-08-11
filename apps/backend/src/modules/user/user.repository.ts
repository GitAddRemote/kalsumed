import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { UserRole } from '../../entities/user-role.entity';
import { Role } from '../../entities/role.entity';

@Injectable()
export class UserRepository {
  private repo!: Repository<User>;
  private userRoleRepo!: Repository<UserRole>;
  private roleRepo!: Repository<Role>;

  constructor(private readonly dataSource: DataSource) {}

  onModuleInit() {
    this.repo = this.dataSource.getRepository(User);
    this.userRoleRepo = this.dataSource.getRepository(UserRole);
    this.roleRepo = this.dataSource.getRepository(Role);
  }
  
  findAll(): Promise<User[]> {
    return this.repo.find();
  }

  findById(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }

  findByUsername(username: string): Promise<User | null> {
    return this.repo.findOne({ where: { username } });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }

  /**
   * Find a user via an OAuth account (provider + provider-specific user ID)
   */
  async findByOAuthAccount(
    provider: string,
    providerUserId: string,
  ): Promise<User | null> {
    return this.repo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.oauthAccounts', 'oa')
      .where('oa.provider = :provider', { provider })
      .andWhere('oa.providerUserId = :providerUserId', { providerUserId })
      .getOne();
  }

  async getRoles(userId: string): Promise<Role[]> {
    const links = await this.userRoleRepo.find({
      where: { userId },
      relations: { role: true },
    });
    return links.map((l) => l.role);
  }

  /**
   * Create or update a user instance
   */
  save(user: Partial<User>): Promise<User> {
    return this.repo.save(user);
  }

  /**
   * Soft-remove a user (sets deletedAt)
   */
  remove(user: User): Promise<User> {
    return this.repo.softRemove(user);
  }
}
