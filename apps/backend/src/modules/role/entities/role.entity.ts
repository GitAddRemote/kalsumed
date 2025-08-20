/**
 * @file Role entity definition for user roles and permissions.
 * @summary Contains the Role entity and related types.
 * @author Demian (GitAddRemote)
 * @copyright (c) 2025 Presstronic Studios LLC
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  Index,
} from 'typeorm';
import { Expose } from 'class-transformer';
import { User } from '../../user/entities/user.entity';
import { Permission } from '../../permission/entities/permission.entity';

/**
 * Role entity representing a user role in the system.
 */
@Entity()
export class Role {
  /**
   * Unique identifier for the role.
   * @readonly
   */
  @PrimaryGeneratedColumn('uuid')
  readonly id!: string;

  /**
   * Unique name of the role.
   */
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50 })
  name!: string;

  /**
   * Optional description of the role.
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string | null;

  /**
   * Indicates if the role is active.
   */
  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  /**
   * Timestamp when the role was created.
   * @readonly
   */
  @CreateDateColumn({ type: 'timestamptz' })
  readonly createdAt!: Date;

  /**
   * Timestamp when the role was last updated.
   * @readonly
   */
  @UpdateDateColumn({ type: 'timestamptz' })
  readonly updatedAt!: Date;

  /**
   * Users assigned to this role.
   *
   * NOTE: Do not initialize relation arrays (no `= []`).
   */
  @ManyToMany(() => User, (user) => user.roles, { cascade: false })
  @JoinTable({
    name: 'user_role',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  users?: User[];

  /**
   * Permissions assigned to this role.
   *
   * NOTE: Do not initialize relation arrays (no `= []`).
   */
  @ManyToMany(() => Permission, (permission) => permission.roles, {
    cascade: false,
    eager: true,
  })
  @JoinTable({
    name: 'role_permission',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions!: Permission[];

  /**
   * Array of user IDs assigned to this role.
   * @readonly
   */
  @Expose()
  get userIds(): string[] {
    if (!Array.isArray(this.users)) return [];
    return this.users.filter((u) => !!u && typeof u.id === 'string').map((u) => u.id);
  }

  /**
   * Array of permission names assigned to this role.
   * @readonly
   */
  @Expose()
  get permissionNames(): string[] {
    if (!Array.isArray(this.permissions)) return [];
    return this.permissions
      .filter((p): p is Permission & { name: string } => !!p && typeof (p as any).name === 'string')
      .map((p) => (p as any).name);
  }
}
