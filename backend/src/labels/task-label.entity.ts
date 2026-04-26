import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  Unique,
} from 'typeorm';
import { Task } from '../tasks/task.entity';
import { Label } from './label.entity';

@Entity('task_labels')
@Unique(['taskId', 'labelId'])
export class TaskLabel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Task, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task: Task;

  @Column({ name: 'task_id' })
  taskId: string;

  @ManyToOne(() => Label, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'label_id' })
  label: Label;

  @Column({ name: 'label_id' })
  labelId: string;
}
