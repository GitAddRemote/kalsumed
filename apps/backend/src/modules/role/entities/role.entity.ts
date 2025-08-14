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

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  readonly id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50 })
  name!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string | null;

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

  // Exposed helper: list of user IDs (safe, no any, no unsafe member access)
  @Expose()
  get userIds(): string[] {
    if (!Array.isArray(this.users)) return [];
    return this.users
      .filter((u): u is User => !!u && typeof u === 'object' && typeof u.id === 'string')
      .map(u => u.id);
  }
}
