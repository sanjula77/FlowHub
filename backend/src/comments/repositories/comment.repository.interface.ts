import { Comment } from '../comment.entity';

export interface ICommentRepository {
  create(data: { taskId: string; userId: string; content: string }): Promise<Comment>;
  findById(id: string): Promise<Comment | null>;
  findByTaskId(taskId: string): Promise<Comment[]>;
  update(id: string, content: string): Promise<Comment>;
  softDelete(id: string): Promise<void>;
}
