/**
 * @file UserRole entity definition for user-role join table.
 * @summary Represents the many-to-many relationship between users and roles.
 * @author Demian (GitAddRemote)
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Unique,
  Index, type Relation,
} from 'typeorm';
import { Expose } from 'class-transformer';
import { User } from './user.entity.js';
import { Role } from '../../role/entities/role.entity.js';

/**
 * Entity representing the assignment of a role to a user.
 * Enforces unique user-role pairs.
 */
@Entity()
@Unique(['user', 'role'])
export class UserRole {
  /**
   * Unique identifier for the user-role relation.
   * @type {string}
   * @readonly
   */
  @PrimaryGeneratedColumn('uuid')
  readonly id!: string;

  /**
   * Foreign key referencing the user.
   * @type {string}
   */
  @Index()
  @Column({ type: 'uuid' })
  userId!: string;

  /**
   * Foreign key referencing the role.
   * @type {string}
   */
  @Index()
  @Column({ type: 'uuid' })
  roleId!: string;

  /**
   * User entity relation.
   * @type {User}
   */
  @ManyToOne(() => User, user => user.userRoles, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  user!: Relation<User>;

  /**
   * Role entity relation.
   * @type {Role}
   */
  @ManyToOne(() => Role, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  role!: Role;

  /**
   * Exposed user reference for serialization.
   * Use this property to include the user ID in API responses.
   * @type {string}
   * @readonly
   */
  @Expose()
  get userRef(): string {
    return this.userId;
  }

  /**
   * Exposed role reference for serialization.
   * Use this property to include the role ID in API responses.
   * @type {string}
   * @readonly
   */
  @Expose()
  get roleRef(): string {
    return this.roleId;
  }
}
