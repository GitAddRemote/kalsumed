import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Unique,
  Index,
} from 'typeorm';
import { Expose } from 'class-transformer';
import { User } from './user.entity';
import { Role } from '../../role/entities/role.entity';

@Entity('user_roles')
@Unique(['userId', 'roleId'])
export class UserRole {
  @PrimaryGeneratedColumn('uuid')
  readonly id!: string;

  @Index()
  @Column({ type: 'uuid' })
  userId!: string;

  @Index()
  @Column({ type: 'uuid' })
  roleId!: string;

  @ManyToOne(() => User, user => user.userRoles, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  user!: User;

  @ManyToOne(() => Role, role => role.users, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  role!: Role;

  @Expose()
  get userRef(): string {
    return this.userId;
  }

  @Expose()
  get roleRef(): string {
    return this.roleId;
  }
}
