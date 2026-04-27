import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { Task } from '../tasks/task.entity';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

@Entity('users')
@Index(['email'], { where: '"deleted_at" IS NULL' })
@Index(['role'], { where: '"deleted_at" IS NULL' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  // One-to-Many: One user can be assigned to many tasks
  @OneToMany(() => Task, (task) => task.assignedTo, { cascade: false })
  assignedTasks: Task[];

  // Role (enforced at DB level via enum)
  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  // Profile information
  @Column({ type: 'varchar', length: 100, nullable: true })
  firstName?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  lastName?: string;

  // Timestamps
  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  // Soft delete
  @Column({ type: 'timestamptz', nullable: true, name: 'deleted_at' })
  @Index()
  deletedAt?: Date;

  @Column({ type: 'timestamptz', nullable: true, name: 'last_login_at' })
  lastLoginAt?: Date;
}
