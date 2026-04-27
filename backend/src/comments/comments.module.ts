import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './comment.entity';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { CommentRepository } from './repositories/comment.repository';
import { TasksModule } from '../tasks/tasks.module';
import { TeamsModule } from '../teams/teams.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment]),
    TasksModule,
    TeamsModule,
    UsersModule,
  ],
  controllers: [CommentsController],
  providers: [
    CommentsService,
    {
      provide: 'ICommentRepository',
      useClass: CommentRepository,
    },
  ],
  exports: [CommentsService],
})
export class CommentsModule {}
