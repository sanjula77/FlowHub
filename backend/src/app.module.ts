import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { TeamsModule } from './teams/teams.module';
import { InvitationsModule } from './invitations/invitations.module';
import { CommonModule } from './common/common.module';
import { User } from './users/user.entity';
import { Team } from './teams/team.entity';
import { TeamMember } from './teams/team-member.entity';
import { Invitation } from './invitations/invitation.entity';
import { Project } from './projects/project.entity';
import { ProjectMember } from './projects/project-member.entity';
import { Task } from './tasks/task.entity';
import { AuditLog } from './audit/audit-log.entity';
import { AuditModule } from './audit/audit.module';
import { CommentsModule } from './comments/comments.module';
import { Comment } from './comments/comment.entity';
import { LabelsModule } from './labels/labels.module';
import { AdminModule } from './admin/admin.module';
import { Label } from './labels/label.entity';
import { TaskLabel } from './labels/task-label.entity';
import { BootstrapService } from './bootstrap.service';

@Module({
  imports: [
    CommonModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'flowhub',
      password: process.env.DB_PASSWORD || 'flowhub',
      database: process.env.DB_NAME || 'flowhub_db',
      entities: [User, Team, TeamMember, Invitation, Project, ProjectMember, Task, AuditLog, Comment, Label, TaskLabel],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    AuthModule,
    UsersModule,
    TeamsModule,
    InvitationsModule,
    ProjectsModule,
    TasksModule,
    AuditModule,
    CommentsModule,
    LabelsModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService, BootstrapService],
})
export class AppModule {}
