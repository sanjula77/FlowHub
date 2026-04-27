import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Label } from '../label.entity';
import { TaskLabel } from '../task-label.entity';

@Injectable()
export class LabelRepository {
  constructor(
    @InjectRepository(Label)
    private readonly labelRepo: Repository<Label>,
    @InjectRepository(TaskLabel)
    private readonly taskLabelRepo: Repository<TaskLabel>,
  ) {}

  async createLabel(data: { name: string; color: string; teamId: string }): Promise<Label> {
    return this.labelRepo.save(this.labelRepo.create(data));
  }

  async findLabelById(id: string): Promise<Label | null> {
    return this.labelRepo.findOne({ where: { id } });
  }

  async findLabelsByTeamId(teamId: string): Promise<Label[]> {
    return this.labelRepo.find({ where: { teamId }, order: { name: 'ASC' } });
  }

  async updateLabel(id: string, data: Partial<Label>): Promise<Label> {
    await this.labelRepo.update(id, data);
    return this.findLabelById(id) as Promise<Label>;
  }

  async deleteLabel(id: string): Promise<void> {
    await this.labelRepo.delete(id);
  }

  async addTaskLabel(taskId: string, labelId: string): Promise<TaskLabel> {
    const existing = await this.taskLabelRepo.findOne({ where: { taskId, labelId } });
    if (existing) return existing;
    return this.taskLabelRepo.save(this.taskLabelRepo.create({ taskId, labelId }));
  }

  async removeTaskLabel(taskId: string, labelId: string): Promise<void> {
    await this.taskLabelRepo.delete({ taskId, labelId });
  }

  async findLabelsByTaskId(taskId: string): Promise<Label[]> {
    const taskLabels = await this.taskLabelRepo.find({
      where: { taskId },
      relations: ['label'],
    });
    return taskLabels.map((tl) => tl.label);
  }

  async findLabelsByTaskIds(taskIds: string[]): Promise<Map<string, Label[]>> {
    if (!taskIds.length) return new Map();
    const taskLabels = await this.taskLabelRepo
      .createQueryBuilder('tl')
      .innerJoinAndSelect('tl.label', 'label')
      .where('tl.task_id IN (:...taskIds)', { taskIds })
      .getMany();

    const map = new Map<string, Label[]>();
    for (const tl of taskLabels) {
      const list = map.get(tl.taskId) ?? [];
      list.push(tl.label);
      map.set(tl.taskId, list);
    }
    return map;
  }
}
