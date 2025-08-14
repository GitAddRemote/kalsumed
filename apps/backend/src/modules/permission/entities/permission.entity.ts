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

export const PERMISSION_NAMES = [
  'track_food',
  'view_progress',
  'ai_insights',
  'advanced_analytics',
  'view_client_data',
  'create_meal_plans',
  'export_reports',
  'manage_organization',
  'view_all_users',
  'billing',
];

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  readonly id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  readonly createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  readonly updatedAt!: Date;

  @ManyToMany(() => Role, role => role.permissions, { cascade: false })
  roles?: Role[];
}
