// apps/backend/src/modules/user/user.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { User } from '../user/entities/user.entity';

@Injectable()
export class UserService {
  constructor(private readonly users: UserRepository) {}

  /**
   * Retrieve a single user by UUID
   * @param id the user's UUID
   */
  async getById(id: string): Promise<User> {
    const user = await this.users.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }
    return user;
  }

  /**
   * Retrieve a single user by username
   * @param username the user's username
   */
  async getByUsername(username: string): Promise<User> {
    const user = await this.users.findByUsername(username);
    if (!user) {
      throw new NotFoundException(`User with username "${username}" not found`);
    }
    return user;
  }

  /**
   * Find a user by their username.
   *
   * Performs a lookup in the UserRepository for a user matching the given username.
   * This method returns `null` if no user is found, allowing the caller to decide
   * how to handle a missing user (e.g. throwing 404 vs. returning 401).
   *
   * @param username - The username to search for (case-sensitive by default; adjust repo if you need case-insensitive)
   * @returns A Promise that resolves to the User entity if found, or `null` otherwise
   */
  async findByUsername(username: string): Promise<User | null> {
    return this.users.findByUsername(username);
  }  

  /**
   * Retrieve a single user by email
   * @param email the user's email address
   */
  async getByEmail(email: string): Promise<User> {
    const user = await this.users.findByEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email "${email}" not found`);
    }
    return user;
  }

  /**
   * Retrieve a user by OAuth provider account
   * @param provider the OAuth provider name
   * @param providerUserId the provider-specific user ID
   */
  async findByOAuthAccount(
    provider: string,
    providerUserId: string
  ): Promise<User | null> {
    return this.users.findByOAuthAccount(provider, providerUserId);
  }

  /**
   * Create a new local user (username, email, and password hash)
   * @param username desired username
   * @param email user email
   * @param passwordHash hashed password
   */
  async createLocal(
    username: string,
    email: string,
    passwordHash: string
  ): Promise<User> {
    const newUser: Partial<User> = { username, email, passwordHash };
    return this.users.save(newUser);
  }

  /**
   * Update an existing user's attributes
   * @param id the user's UUID
   * @param attrs partial set of attributes to update
   */
  async update(id: string, attrs: Partial<User>): Promise<User> {
    const user = await this.getById(id);
    Object.assign(user, attrs);
    return this.users.save(user);
  }

  /**
   * Soft-delete a user
   * @param id the user's UUID
   */
  async delete(id: string): Promise<void> {
    const user = await this.getById(id);
    await this.users.remove(user);
  }

  /**
   * Retrieve all users
   */
  async findAll(): Promise<User[]> {
    return this.users.findAll();
  }

  /**
   * Alias for findAll, for controller naming consistency
   */
  async listAll(): Promise<User[]> {
    return this.findAll();
  }
}
