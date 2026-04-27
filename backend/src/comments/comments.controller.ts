import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UsersService } from '../users/users.service';
import type { Request as ExpressRequest } from 'express';

@Controller()
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly usersService: UsersService,
  ) {}

  @Post('tasks/:taskId/comments')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Request() req: ExpressRequest,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() dto: CreateCommentDto,
  ) {
    const userEntity = await this.usersService.findByEmail((req.user as any).email);
    return this.commentsService.create(userEntity!, taskId, dto);
  }

  @Get('tasks/:taskId/comments')
  @HttpCode(HttpStatus.OK)
  async findByTask(
    @Request() req: ExpressRequest,
    @Param('taskId', ParseUUIDPipe) taskId: string,
  ) {
    const userEntity = await this.usersService.findByEmail((req.user as any).email);
    return this.commentsService.findByTaskId(userEntity!, taskId);
  }

  @Put('comments/:id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Request() req: ExpressRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateCommentDto,
  ) {
    const userEntity = await this.usersService.findByEmail((req.user as any).email);
    return this.commentsService.update(userEntity!, id, dto.content);
  }

  @Delete('comments/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Request() req: ExpressRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const userEntity = await this.usersService.findByEmail((req.user as any).email);
    await this.commentsService.delete(userEntity!, id);
  }
}
