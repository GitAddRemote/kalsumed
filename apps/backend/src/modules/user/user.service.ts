import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UserRepository } from './user.repository.js';
import { User } from '../user/entities/user.entity.js';

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizeUsername(username: string): string {
  return username.trim();
}

@Injectable()
export class UserService {
  constructor(
    private readonly users: UserRepository,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Retrieve a single user by UUID (throws 404 if not found).
   */
  async getById(id: string): Promise<User> {
    const user = await this.users.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }
    return user;
  }

  /**
   * Retrieve a single user by username (case-insensitive; throws 404 if not found).
   * Uses LOWER(username) to hit the functional unique index from the migration.
   */
  async getByUsername(username: string): Promise<User> {
    const u = normalizeUsername(username);
    const repo = this.dataSource.getRepository(User);

    const user = await repo
      .createQueryBuilder('u')
      .where('LOWER(u.username) = LOWER(:name)', { name: u })
      .getOne();

    if (!user) {
      throw new NotFoundException(`User with username "${username}" not found`);
    }
    return user;
  }

  /**
   * Find a user by username (case-insensitive; returns null when missing).
   */
  async findByUsername(username: string): Promise<User | null> {
    const u = normalizeUsername(username);
    const repo = this.dataSource.getRepository(User);

    return repo
      .createQueryBuilder('u')
      .where('LOWER(u.username) = LOWER(:name)', { name: u })
      .getOne();
  }

  /**
   * Retrieve a single user by email (citext in DB makes it case-insensitive; throws 404 if not found).
   */
  async getByEmail(email: string): Promise<User> {
    const e = normalizeEmail(email);
    const user = await this.users.findByEmail(e);
    if (!user) {
      throw new NotFoundException(`User with email "${email}" not found`);
    }
    return user;
  }

  /**
   * Retrieve a user by OAuth provider account (returns null when missing).
   */
  async findByOAuthAccount(provider: string, providerUserId: string): Promise<User | null> {
    return this.users.findByOAuthAccount(provider, providerUserId);
  }

  /**
   * Create a new local user.
   * Normalizes email (lowercase) and trims username.
   */
  async createLocal(username: string, email: string, passwordHash: string): Promise<User> {
    const newUser: Partial<User> = {
      username: normalizeUsername(username),
      email: normalizeEmail(email),
      passwordHash,
    };
    return this.users.save(newUser);
  }

  /**
   * Update an existing user's attributes.
   * Applies the same normalization as createLocal.
   */
  async update(id: string, attrs: Partial<User>): Promise<User> {
    const user = await this.getById(id);

    const next: Partial<User> = { ...attrs };
    if (typeof next.username === 'string') {
      next.username = normalizeUsername(next.username);
    }
    if (typeof next.email === 'string') {
      next.email = normalizeEmail(next.email);
    }

    Object.assign(user, next);
    return this.users.save(user);
  }

  /**
   * Soft-delete a user.
   */
  async delete(id: string): Promise<void> {
    const user = await this.getById(id);
    await this.users.remove(user);
  }

  /**
   * Retrieve all users.
   */
  async findAll(): Promise<User[]> {
    return this.users.findAll();
  }

  /**
   * Alias for findAll, for controller naming consistency.
   */
  async listAll(): Promise<User[]> {
    return this.findAll();
  }
}
