import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { User, UserRole } from '../users/user.entity';
import { Comment } from './comment.entity';
import type { ICommentRepository } from './repositories/comment.repository.interface';
import type { ITaskRepository } from '../tasks/repositories/task.repository.interface';
import type { ITeamMemberRepository } from '../teams/repositories/team-member.repository.interface';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentResponseDto } from './dto/comment-response.dto';

@Injectable()
export class CommentsService {
  constructor(
    @Inject('ICommentRepository')
    private readonly commentRepository: ICommentRepository,
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
    @Inject('ITeamMemberRepository')
    private readonly teamMemberRepository: ITeamMemberRepository,
  ) {}

  async create(
    user: User,
    taskId: string,
    dto: CreateCommentDto,
  ): Promise<CommentResponseDto> {
    const task = await this.taskRepository.findById(taskId);
    if (!task || task.deletedAt) {
      throw new NotFoundException('Task not found');
    }

    const isAdmin = user.role === UserRole.ADMIN;
    const isMember = await this.teamMemberRepository.isTeamMember(user.id, task.teamId);
    if (!isAdmin && !isMember) {
      throw new ForbiddenException('You must be a team member to comment');
    }

    const comment = await this.commentRepository.create({
      taskId,
      userId: user.id,
      content: dto.content,
    });

    return this.toResponseDto(comment, user);
  }

  async findByTaskId(user: User, taskId: string): Promise<CommentResponseDto[]> {
    const task = await this.taskRepository.findById(taskId);
    if (!task || task.deletedAt) {
      throw new NotFoundException('Task not found');
    }

    const isAdmin = user.role === UserRole.ADMIN;
    const isMember = await this.teamMemberRepository.isTeamMember(user.id, task.teamId);
    if (!isAdmin && !isMember) {
      throw new ForbiddenException('Access denied');
    }

    const comments = await this.commentRepository.findByTaskId(taskId);
    return comments.map((c) => this.toResponseDto(c));
  }

  async update(
    user: User,
    commentId: string,
    content: string,
  ): Promise<CommentResponseDto> {
    const comment = await this.commentRepository.findById(commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const isAdmin = user.role === UserRole.ADMIN;
    const isAuthor = comment.userId === user.id;
    if (!isAdmin && !isAuthor) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    const updated = await this.commentRepository.update(commentId, content);
    return this.toResponseDto(updated);
  }

  async delete(user: User, commentId: string): Promise<void> {
    const comment = await this.commentRepository.findById(commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const isAdmin = user.role === UserRole.ADMIN;
    const isAuthor = comment.userId === user.id;
    if (!isAdmin && !isAuthor) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.commentRepository.softDelete(commentId);
  }

  private toResponseDto(comment: Comment, authorOverride?: User): CommentResponseDto {
    const dto = new CommentResponseDto();
    dto.id = comment.id;
    dto.taskId = comment.taskId;
    dto.userId = comment.userId;
    dto.content = comment.content;
    dto.createdAt = comment.createdAt;
    dto.updatedAt = comment.updatedAt;

    const author = authorOverride || comment.user;
    if (author) {
      dto.userFirstName = author.firstName;
      dto.userLastName = author.lastName;
      dto.userEmail = author.email;
    }

    return dto;
  }
}
