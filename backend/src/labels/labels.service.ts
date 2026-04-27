import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { User, UserRole } from '../users/user.entity';
import { Label } from './label.entity';
import { LabelRepository } from './repositories/label.repository';
import type { ITeamRepository } from '../teams/repositories/team.repository.interface';
import type { ITeamMemberRepository } from '../teams/repositories/team-member.repository.interface';
import { CreateLabelDto } from './dto/create-label.dto';
import { LabelResponseDto } from './dto/label-response.dto';

@Injectable()
export class LabelsService {
  constructor(
    private readonly labelRepository: LabelRepository,
    @Inject('ITeamRepository')
    private readonly teamRepository: ITeamRepository,
    @Inject('ITeamMemberRepository')
    private readonly teamMemberRepository: ITeamMemberRepository,
  ) {}

  async createLabel(user: User, teamId: string, dto: CreateLabelDto): Promise<LabelResponseDto> {
    const team = await this.teamRepository.findById(teamId);
    if (!team || team.deletedAt) {
      throw new NotFoundException('Team not found');
    }

    const isAdmin = user.role === UserRole.ADMIN;
    const isOwner = await this.teamMemberRepository.isTeamOwner(user.id, teamId);
    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('Only team owners or admins can create labels');
    }

    const label = await this.labelRepository.createLabel({ ...dto, teamId });
    return this.toResponseDto(label);
  }

  async findLabelsByTeam(user: User, teamId: string): Promise<LabelResponseDto[]> {
    const team = await this.teamRepository.findById(teamId);
    if (!team || team.deletedAt) {
      throw new NotFoundException('Team not found');
    }

    const isAdmin = user.role === UserRole.ADMIN;
    const isMember = await this.teamMemberRepository.isTeamMember(user.id, teamId);
    if (!isAdmin && !isMember) {
      throw new ForbiddenException('Access denied');
    }

    const labels = await this.labelRepository.findLabelsByTeamId(teamId);
    return labels.map((l) => this.toResponseDto(l));
  }

  async updateLabel(user: User, labelId: string, dto: CreateLabelDto): Promise<LabelResponseDto> {
    const label = await this.labelRepository.findLabelById(labelId);
    if (!label) {
      throw new NotFoundException('Label not found');
    }

    const isAdmin = user.role === UserRole.ADMIN;
    const isOwner = await this.teamMemberRepository.isTeamOwner(user.id, label.teamId);
    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('Only team owners or admins can update labels');
    }

    const updated = await this.labelRepository.updateLabel(labelId, dto);
    return this.toResponseDto(updated);
  }

  async deleteLabel(user: User, labelId: string): Promise<void> {
    const label = await this.labelRepository.findLabelById(labelId);
    if (!label) {
      throw new NotFoundException('Label not found');
    }

    const isAdmin = user.role === UserRole.ADMIN;
    const isOwner = await this.teamMemberRepository.isTeamOwner(user.id, label.teamId);
    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('Only team owners or admins can delete labels');
    }

    await this.labelRepository.deleteLabel(labelId);
  }

  async addTaskLabel(user: User, taskId: string, labelId: string): Promise<void> {
    const label = await this.labelRepository.findLabelById(labelId);
    if (!label) {
      throw new NotFoundException('Label not found');
    }

    const isMember = await this.teamMemberRepository.isTeamMember(user.id, label.teamId);
    if (user.role !== UserRole.ADMIN && !isMember) {
      throw new ForbiddenException('Access denied');
    }

    await this.labelRepository.addTaskLabel(taskId, labelId);
  }

  async removeTaskLabel(user: User, taskId: string, labelId: string): Promise<void> {
    const label = await this.labelRepository.findLabelById(labelId);
    if (!label) {
      throw new NotFoundException('Label not found');
    }

    const isMember = await this.teamMemberRepository.isTeamMember(user.id, label.teamId);
    if (user.role !== UserRole.ADMIN && !isMember) {
      throw new ForbiddenException('Access denied');
    }

    await this.labelRepository.removeTaskLabel(taskId, labelId);
  }

  async findLabelsByTask(taskId: string): Promise<LabelResponseDto[]> {
    const labels = await this.labelRepository.findLabelsByTaskId(taskId);
    return labels.map((l) => this.toResponseDto(l));
  }

  private toResponseDto(label: Label): LabelResponseDto {
    const dto = new LabelResponseDto();
    dto.id = label.id;
    dto.name = label.name;
    dto.color = label.color;
    dto.teamId = label.teamId;
    dto.createdAt = label.createdAt;
    dto.updatedAt = label.updatedAt;
    return dto;
  }
}
