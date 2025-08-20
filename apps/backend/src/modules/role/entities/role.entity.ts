/**
 * @file apps/backend/src/modules/role/entities/role.entity.ts
 * @summary Role entity with safe, typed computed getters and an `isActive` flag.
 * @module Role/Entities/Role
 * @description
 *   - Defines the Role aggregate with ManyToMany → Permission.
 *   - Includes `isActive` (boolean) used by the seeder and admin UIs.
 *   - Computed views (`slug`, `permissionNames`, `permissionCount`) are implemented
 *     without `any`, unsafe access, or unsafe returns and are defensive against
 *     null/undefined relations.
 * @author
 *   Demian (GitAddRemote)
 * @copyright
 *   (c) 2025 Presstronic Studios LLC
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
import { Permission } from '../../permission/entities/permission.entity';

@Entity()
export class Role {
  /**
   * Primary UUID identifier.
   */
  @PrimaryGeneratedColumn('uuid')
  readonly id!: string;

  /**
   * Unique role name (e.g., "admin", "user").
   */
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64 })
  name!: string;

  /**
   * Optional human-readable description for the role.
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string | null;

  /**
   * Whether the role is currently active/assignable.
   * Used by seeders and admin toggles.
   */
  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  /**
   * Many-to-many relation to Permission.
   * Initialized to [] to avoid undefined at runtime and keep computed
   * getters simple and safe.
   */
  @ManyToMany(() => Permission, (permission) => permission.roles, {
    cascade: false,
    eager: false,
  })
  @JoinTable()
  permissions: Permission[] = [];

  /**
   * Timestamp when the role was created.
   */
  @CreateDateColumn({ type: 'timestamptz' })
  readonly createdAt!: Date;

  /**
   * Timestamp when the role was last updated.
   */
  @UpdateDateColumn({ type: 'timestamptz' })
  readonly updatedAt!: Date;

  // ───────────────────────────────────────────────────────────────
  // Computed, serialized-only views
  // ───────────────────────────────────────────────────────────────

  /**
   * Canonical, URL-friendly version of the role name.
   */
  @Expose()
  get slug(): string {
    const base = typeof this.name === 'string' ? this.name : '';
    return base.trim().toLowerCase().replace(/\s+/g, '-');
  }

  /**
   * Read-only list of permission names for this role.
   * Always returns string[], never any[].
   */
  @Expose()
  get permissionNames(): string[] {
    if (!Array.isArray(this.permissions)) return [];
    return this.permissions.map((perm: Permission) => perm.name);
  }

  /**
   * Count of permissions on this role.
   */
  @Expose()
  get permissionCount(): number {
    return Array.isArray(this.permissions) ? this.permissions.length : 0;
  }
}
