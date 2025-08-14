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

export const PERMISSION_NAMES = [
  'track_food',
  'view_progress',
  'ai_insights',
  'advanced_analytics',
] as const;
export type PermissionName = (typeof PERMISSION_NAMES)[number];

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  readonly id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50 })
  name!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string | null;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  readonly createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  readonly updatedAt!: Date;

  @ManyToMany(() => User, user => user.roles, { cascade: false })
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  users?: User[];

  @ManyToMany(() => Permission, permission => permission.roles, { cascade: false, eager: true })
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions?: Permission[];

  @Expose()
  get userIds(): string[] {
    if (!Array.isArray(this.users)) return [];
    return this.users.filter(u => !!u && typeof u.id === 'string').map(u => u.id);
  }

  @Expose()
  get permissionNames(): string[] {
    if (!Array.isArray(this.permissions)) return [];
    return this.permissions
      .filter(p => !!p && typeof p.name === 'string')
      .map(p => p.name);
  }
}
