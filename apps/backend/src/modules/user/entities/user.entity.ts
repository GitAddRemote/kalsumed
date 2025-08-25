/**
 * @file User entity definition for application users.
 * @summary Contains the User entity and related fields for authentication, profile, and gamification.
 * @author Demian (GitAddRemote)
 * @copyright
 *   (c) 2024 Your Company
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
// NOTE: Do not add @Index unique decorators here for username/email.
// - Email uniqueness is enforced by a UNIQUE constraint on a `citext` column (case-insensitive).
// - Username uniqueness is enforced by a functional unique index on LOWER(username), created in migrations.
export class User {
  /** Unique identifier for the user. */
  @PrimaryGeneratedColumn('uuid')
  readonly id!: string;

  /**
   * Username (unique case-insensitively via DB index on LOWER(username)).
   * Keep column itself non-unique so we don't accidentally enforce case-sensitive uniqueness.
   */
  @Column({ type: 'varchar', length: 30 })
  username!: string;

  /**
   * Email (citext, unique at DB level; case-insensitive).
   * Keep this `citext` to match migration; do not set a length for citext.
   */
  @Column({ type: 'citext', unique: true })
  email!: string;

  /** Hashed password (never exposed). */
  @Exclude()
  @Column({ name: 'password_hash', type: 'varchar' })
  passwordHash!: string;

  /** Whether the email is verified. */
  @Column({ name: 'email_verified', type: 'boolean', default: false })
  emailVerified!: boolean;

  /** First name (optional). */
  @Column({ name: 'first_name', type: 'varchar', length: 50, nullable: true })
  firstName?: string | null;

  /** Last name (optional). */
  @Column({ name: 'last_name', type: 'varchar', length: 50, nullable: true })
  lastName?: string | null;

  /** Avatar URL. */
  @Column({ name: 'avatar_url', type: 'varchar', nullable: true })
  avatarUrl?: string | null;

  /** Height in centimeters (NUMERIC(5,2)). */
  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  height?: number | null;

  /** Current weight in kilograms (NUMERIC(5,2)). */
  @Column({ name: 'current_weight', type: 'numeric', precision: 5, scale: 2, nullable: true })
  currentWeight?: number | null;

  /** Target weight in kilograms (NUMERIC(5,2)). */
  @Column({ name: 'target_weight', type: 'numeric', precision: 5, scale: 2, nullable: true })
  targetWeight?: number | null;

  /** Date of birth. */
  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth?: Date | null;

  /** Gender of the user. */
  @Column({ type: 'enum', enum: UserGender, nullable: true })
  gender?: UserGender | null;

  /** Activity level (gamification/health). */
  @Column({ name: 'activity_level', type: 'enum', enum: UserActivityLevel, default: UserActivityLevel.Sedentary })
  activityLevel!: UserActivityLevel;

  /** Total gamification points. */
  @Column({ name: 'total_points', type: 'int', default: 0 })
  totalPoints!: number;

  /** Gamification level. */
  @Column({ type: 'int', default: 1 })
  level!: number;

  /** Number of consecutive streak days. */
  @Column({ name: 'streak_days', type: 'int', default: 0 })
  streakDays!: number;

  /** Organization ID for multi-tenancy. */
  @Column({ name: 'organization_id', type: 'uuid', nullable: true })
  organizationId?: string | null;

  /** User roles (join table). */
  @OneToMany(() => UserRole, (ur) => ur.user, { cascade: true })
  userRoles!: Relation<UserRole[]>;

  /** OAuth accounts linked to the user. */
  @OneToMany(() => OAuthAccount, (oa) => oa.user, { cascade: true })
  oauthAccounts!: Relation<OAuthAccount[]>;

  /** Last login timestamp. */
  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
  lastLoginAt?: Date | null;

  /** Timestamp when the user was created. */
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  readonly createdAt!: Date;

  /** Timestamp when the user was last updated. */
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  readonly updatedAt!: Date;

  /** Timestamp when the user was soft-deleted. */
  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz' })
  readonly deletedAt?: Date | null;

  /** Computed array of roles for this user. */
  get roles(): Role[] {
    return (this.userRoles || []).map((ur) => ur.role).filter(Boolean);
  }

  /**
   * Normalize fields and hash password when needed.
   * - Email: trim + lowercase (aligns with citext + unique).
   * - Username: trim (preserve case for display).
   * - Password: only hash if not already hashed.
   */
  @BeforeInsert()
  @BeforeUpdate()
  private async prePersist(): Promise<void> {
    if (typeof this.email === 'string') this.email = this.email.trim().toLowerCase();
    if (typeof this.username === 'string') this.username = this.username.trim();

    if (this.passwordHash && !this.passwordHash.startsWith('$2')) {
      this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
    }
  }
}
