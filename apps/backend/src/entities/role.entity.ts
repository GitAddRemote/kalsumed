import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 30, unique: true })
  name!: string;

  @Column({ length: 100, nullable: true })
  description?: string;

  @Column({ type: 'json', nullable: true })
  permissions?: string[];

  @Column({ default: false })
  isPremium!: boolean;

  @Column({ default: true })
  isActive!: boolean;

  // Replace ManyToMany(User) with OneToMany(UserRole)
  @OneToMany('UserRole', (ur: any) => ur.role)
  userRoles!: import('./user-role.entity').UserRole[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;
}