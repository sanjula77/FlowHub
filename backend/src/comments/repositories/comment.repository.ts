import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Comment } from '../comment.entity';
import { ICommentRepository } from './comment.repository.interface';

@Injectable()
export class CommentRepository implements ICommentRepository {
  constructor(
    @InjectRepository(Comment)
    private readonly repo: Repository<Comment>,
  ) {}

  async create(data: { taskId: string; userId: string; content: string }): Promise<Comment> {
    const comment = this.repo.create(data);
    return this.repo.save(comment);
  }

  async findById(id: string): Promise<Comment | null> {
    return this.repo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['user'],
    });
  }

  async findByTaskId(taskId: string): Promise<Comment[]> {
    return this.repo.find({
      where: { taskId, deletedAt: IsNull() },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });
  }

  async update(id: string, content: string): Promise<Comment> {
    await this.repo.update(id, { content });
    return this.findById(id) as Promise<Comment>;
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.update(id, { deletedAt: new Date() });
  }
}
