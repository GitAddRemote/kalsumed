/**
 * @file User entity definition for application users.
 * @summary Contains the User entity and related fields for authentication, profile, and gamification.
 * @author Demian (GitAddRemote)
 * @copyright (c) 2024 Your Company
 */

import 'reflect-metadata';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BeforeInsert,
  BeforeUpdate,
  Index,
} from 'typeorm';
import type { Relation } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';
import { OAuthAccount } from '../../auth/entities/oauth-account.entity.js';
import { UserRole } from './user-role.entity.js';
import type { Role } from '../../role/entities/role.entity.js';

/**
 * Enum for user gender.
 */
export enum UserGender {
  Male = 'male',
  Female = 'female',
  Other = 'other',
}

/**
 * Enum for user activity level.
 */
export enum UserActivityLevel {
  Sedentary = 'sedentary',
  Light = 'light',
  Moderate = 'moderate',
  Active = 'active',
  VeryActive = 'very_active',
}

@Entity('app_user')
@Index(['username'], { unique: true })
@Index(['email'], { unique: true })
export class User {
  /**
   * Unique identifier for the user.
   * @readonly
   */
  @PrimaryGeneratedColumn('uuid')
  readonly id!: string;

  /**
   * Unique username.
   */
  @Column({ type: 'varchar', length: 30, unique: true })
  username!: string;

  /**
   * Unique email address.
   */
  @Column({ type: 'varchar', length: 100, unique: true })
  email!: string;

  /**
   * Hashed password (never exposed).
   * @private
   */
  @Exclude()
  @Column({ type: 'varchar' })
  passwordHash!: string;

  /**
   * Whether the email is verified.
   */
  @Column({ type: 'boolean', default: false })
  emailVerified!: boolean;

  /**
   * First name of the user.
   * Optional at the API and nullable in the DB.
   */
  @Column({ type: 'varchar', length: 50, nullable: true })
  firstName?: string | null;

  /**
   * Last name of the user.
   * Optional at the API and nullable in the DB.
   */
  @Column({ type: 'varchar', length: 50, nullable: true })
  lastName?: string | null;

  /**
   * Avatar URL.
   */
  @Column({ type: 'varchar', nullable: true })
  avatarUrl?: string | null;

  /**
   * Height in centimeters.
   * Stored as NUMERIC(5,2). Consider a transformer if you want numbers instead of strings in JS.
   */
  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  height?: number | null;

  /**
   * Current weight in kilograms.
   * Stored as NUMERIC(5,2).
   */
  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  currentWeight?: number | null;

  /**
   * Target weight in kilograms.
   * Stored as NUMERIC(5,2).
   */
  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  targetWeight?: number | null;

  /**
   * Date of birth.
   */
  @Column({ type: 'date', nullable: true })
  dateOfBirth?: Date | null;

  /**
   * Gender of the user.
   */
  @Column({ type: 'enum', enum: UserGender, nullable: true })
  gender?: UserGender | null;

  /**
   * Activity level of the user (gamification/health).
   */
  @Column({ type: 'enum', enum: UserActivityLevel, default: UserActivityLevel.Sedentary })
  activityLevel!: UserActivityLevel;

  /**
   * Total gamification points.
   */
  @Column({ type: 'int', default: 0 })
  totalPoints!: number;

  /**
   * Gamification level.
   */
  @Column({ type: 'int', default: 1 })
  level!: number;

  /**
   * Number of consecutive streak days.
   */
  @Column({ type: 'int', default: 0 })
  streakDays!: number;

  /**
   * Organization ID for multi-tenancy.
   */
  @Column({ type: 'uuid', nullable: true })
  organizationId?: string | null;

  /**
   * User roles (join table).
   */
  @OneToMany(() => UserRole, (ur) => ur.user, { cascade: true })
  userRoles!: Relation<UserRole[]>;

  /**
   * OAuth accounts linked to the user.
   */
  @OneToMany(() => OAuthAccount, (oa) => oa.user, { cascade: true })
  oauthAccounts!: Relation<OAuthAccount[]>;

  /**
   * Last login timestamp.
   */
  @Column({ type: 'timestamptz', nullable: true })
  lastLoginAt?: Date | null;

  /**
   * Timestamp when the user was created.
   * @readonly
   */
  @CreateDateColumn({ type: 'timestamptz' })
  readonly createdAt!: Date;

  /**
   * Timestamp when the user was last updated.
   * @readonly
   */
  @UpdateDateColumn({ type: 'timestamptz' })
  readonly updatedAt!: Date;

  /**
   * Timestamp when the user was soft-deleted.
   * @readonly
   */
  @DeleteDateColumn({ type: 'timestamptz' })
  readonly deletedAt?: Date | null;

  /**
   * Computed array of roles for this user.
   * @readonly
   */
  get roles(): Role[] {
    return (this.userRoles || []).map((ur) => ur.role).filter(Boolean);
  }

  /**
   * Hashes the password if it is not already hashed.
   * Uses bcrypt and assumes a cost factor of 10.
   * @private
   */
  @BeforeInsert()
  @BeforeUpdate()
  private async hashPassword(): Promise<void> {
    if (this.passwordHash && !this.passwordHash.startsWith('$2')) {
      this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
    }
  }
}
