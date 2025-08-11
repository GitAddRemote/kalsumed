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

  @Column({ type: 'varchar', length: 30, unique: true })
  name!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  description?: string | undefined;

  @Column({ type: 'json', nullable: true })
  permissions?: string[] | undefined;

  @Column({ type: 'boolean', default: false })
  isPremium!: boolean;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @OneToMany('UserRole', (ur: any) => ur.role)
  userRoles!: any[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}