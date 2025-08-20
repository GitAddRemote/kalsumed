/**
 * @file Permission entity definition.
 * @summary Represents a permission that can be assigned to roles in the system.
 * @author Demian (GitAddRemote)
 * @copyright (c) 2025 Presstronic Studios LLC
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToMany,
} from 'typeorm';
import { Role } from '../../role/entities/role.entity';

/**
 * Entity representing a permission that can be assigned to roles.
 */
@Entity()
export class Permission {
  /**
   * Unique identifier for the permission.
   * @readonly
   */
  @PrimaryGeneratedColumn('uuid')
  readonly id!: string;

  /**
   * Unique name of the permission.
   */
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 100 })
  name!: string;

  /**
   * Optional description of the permission.
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string | null;

  /**
   * Timestamp when the permission was created.
   * @readonly
   */
  @CreateDateColumn({ type: 'timestamptz' })
  readonly createdAt!: Date;

  /**
   * Timestamp when the permission was last updated.
   * @readonly
   */
  @UpdateDateColumn({ type: 'timestamptz' })
  readonly updatedAt!: Date;

  /**
   * Roles that have this permission.
   *
   * NOTE: Do not initialize relation arrays (no `= []`).
   */
  @ManyToMany(() => Role, (role) => role.permissions, { cascade: false })
  roles!: Role[];
}
