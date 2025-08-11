import { Entity
    , PrimaryGeneratedColumn
    , Column
    , ManyToOne
    , JoinColumn
    , Unique
    , CreateDateColumn } from 'typeorm';

@Entity('user_roles')
@Unique(['userId', 'roleId'])
export class UserRole {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @Column()
  roleId!: string;

  // Use string targets to avoid static imports and cycles
  @ManyToOne('User', (user: any) => user.userRoles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: import('./user.entity').User;

  @ManyToOne('Role', (role: any) => role.userRoles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roleId' })
  role!: import('../../role/entities/role.entity').Role;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  assignedAt!: Date;
}