import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, IsNull } from 'typeorm';
import { User } from '../users/user.entity';
import { Team } from '../teams/team.entity';
import { Project } from '../projects/project.entity';
import { Task, TaskStatus } from '../tasks/task.entity';
import { AuditLog } from '../audit/audit-log.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async getStats() {
    const userRepo = this.dataSource.getRepository(User);
    const teamRepo = this.dataSource.getRepository(Team);
    const projectRepo = this.dataSource.getRepository(Project);
    const taskRepo = this.dataSource.getRepository(Task);
    const auditRepo = this.dataSource.getRepository(AuditLog);

    const [
      totalUsers,
      adminUsers,
      totalTeams,
      totalProjects,
      todoTasks,
      inProgressTasks,
      doneTasks,
      recentActivity,
    ] = await Promise.all([
      userRepo.count({ where: { deletedAt: IsNull() } }),
      userRepo.count({ where: { role: 'ADMIN' as any, deletedAt: IsNull() } }),
      teamRepo.count({ where: { deletedAt: IsNull() } }),
      projectRepo.count({ where: { deletedAt: IsNull() } }),
      taskRepo.count({ where: { status: TaskStatus.TODO, deletedAt: IsNull() } }),
      taskRepo.count({ where: { status: TaskStatus.IN_PROGRESS, deletedAt: IsNull() } }),
      taskRepo.count({ where: { status: TaskStatus.DONE, deletedAt: IsNull() } }),
      auditRepo.find({
        order: { createdAt: 'DESC' },
        take: 10,
      }),
    ]);

    const totalTasks = todoTasks + inProgressTasks + doneTasks;

    return {
      users: { total: totalUsers, admins: adminUsers },
      teams: { total: totalTeams },
      projects: { total: totalProjects },
      tasks: {
        total: totalTasks,
        todo: todoTasks,
        inProgress: inProgressTasks,
        done: doneTasks,
      },
      recentActivity: recentActivity.map((log) => ({
        id: log.id,
        action: log.action,
        userId: log.userId,
        entityType: log.entityType,
        entityId: log.entityId,
        createdAt: log.createdAt,
      })),
    };
  }
}
