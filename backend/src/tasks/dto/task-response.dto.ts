import { TaskStatus } from '../task.entity';

export class TaskResponseDto {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  projectId: string;
  teamId: string;
  assignedToId?: string;
  priority?: number;
  dueDate?: Date;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  labels: { id: string; name: string; color: string }[];
}
