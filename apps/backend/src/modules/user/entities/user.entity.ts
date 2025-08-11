import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  OneToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BeforeInsert,
  BeforeUpdate,
  Index,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { OAuthAccount } from '../../auth/entities/oauth-account.entity';

@Entity('users')
@Index(['username'], { unique: true })
@Index(['email'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 30, unique: true })
  username!: string;

  @Column({ length: 100, unique: true })
  email!: string;

  @Column()
  passwordHash!: string;

  @Column({ default: false })
  emailVerified!: boolean;

  @Column({ nullable: true, length: 50 })
  firstName?: string;

  @Column({ nullable: true, length: 50 })
  lastName?: string;

  @Column({ nullable: true })
  avatarUrl?: string;

  // Food tracking specific fields
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  height?: number; // in cm

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  currentWeight?: number; // in kg

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  targetWeight?: number; // in kg

  @Column({ type: 'date', nullable: true })
  dateOfBirth?: Date;

  @Column({ type: 'enum', enum: ['male', 'female', 'other'], nullable: true })
  gender?: 'male' | 'female' | 'other';

  @Column({ type: 'enum', enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'], default: 'sedentary' })
  activityLevel!: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

  // Gamification
  @Column({ type: 'int', default: 0 })
  totalPoints!: number;

  @Column({ type: 'int', default: 1 })
  level!: number;

  @Column({ type: 'int', default: 0 })
  streakDays!: number;

  // Multi-tenancy ready
  @Column({ nullable: true })
  organizationId?: string;

  @OneToMany('UserRole', (ur: any) => ur.user, { cascade: true })
  userRoles!: import('./user-role.entity').UserRole[];

  @OneToMany(() => OAuthAccount, (oa) => oa.user, { cascade: true })
  oauthAccounts!: OAuthAccount[];

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastLoginAt?: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;

  @DeleteDateColumn({ type: 'timestamp with time zone' })
  deletedAt?: Date;

  get roles(): import('../../role/entities/role.entity').Role[] {
    return (this.userRoles || []).map((ur) => ur.role).filter(Boolean) as any;
  }

  @BeforeInsert()
  @BeforeUpdate()
  private async hashPassword(): Promise<void> {
    if (this.passwordHash && !this.passwordHash.startsWith('$2b$')) {
      this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
    }
  }
}

import type { Role } from '../../role/entities/role.entity';
