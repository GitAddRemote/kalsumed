/**
 * @file OAuthAccount entity definition.
 * @summary Represents an OAuth account linked to a user for authentication providers.
 * @author Demian (GitAddRemote)
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  // Note: Relation is a *type*; import it as a type to avoid runtime deps
} from 'typeorm';
import type { Relation } from 'typeorm';
import { User } from '../../user/entities/user.entity.js';

/**
 * Entity representing an OAuth account associated with a user.
 */
@Entity()
@Index(['provider', 'providerUserId'], { unique: true })
export class OAuthAccount {
  /**
   * Unique identifier for the OAuth account.
   * @type {string}
   * @readonly
   */
  @PrimaryGeneratedColumn('uuid')
  readonly id!: string;

  /**
   * User associated with this OAuth account.
   * Using Relation<User> avoids circular runtime metadata on ESM.
   */
  @ManyToOne(() => User, (user) => user.oauthAccounts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: Relation<User>;

  /**
   * OAuth provider name (e.g., 'google', 'facebook').
   */
  @Column({ type: 'varchar', length: 50 })
  provider!: string;

  /**
   * Unique user ID from the OAuth provider.
   */
  @Column({ type: 'varchar', length: 255 })
  providerUserId!: string;

  /**
   * Access token for the OAuth provider.
   */
  @Column({ type: 'text', nullable: true })
  accessToken?: string | null;

  /**
   * Refresh token for the OAuth provider.
   */
  @Column({ type: 'text', nullable: true })
  refreshToken?: string | null;

  /**
   * Expiration date/time for the access token.
   */
  @Column({ type: 'timestamptz', nullable: true })
  expiresAt?: Date | null;

  /**
   * Timestamp when the OAuth account was created.
   * @readonly
   */
  @CreateDateColumn({ type: 'timestamp with time zone' })
  readonly createdAt!: Date;

  /**
   * Timestamp when the OAuth account was last updated.
   * @readonly
   */
  @UpdateDateColumn({ type: 'timestamp with time zone' })
  readonly updatedAt!: Date;
}
