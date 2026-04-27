import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './project.entity';
import { ProjectMember } from './project-member.entity';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { ProjectRepository } from './repositories/project.repository';
import { TeamsModule } from '../teams/teams.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, ProjectMember]),
    TeamsModule,
    UsersModule,
  ],
  providers: [
    ProjectsService,
    {
      provide: 'IProjectRepository',
      useClass: ProjectRepository,
    },
    ProjectRepository,
  ],
  controllers: [ProjectsController],
  exports: [ProjectsService, 'IProjectRepository'],
})
export class ProjectsModule {}
