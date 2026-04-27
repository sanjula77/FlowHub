import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { Team } from './team.entity';
import { User } from '../users/user.entity';
import { UserRole } from '../users/user.entity';
import type { ITeamRepository } from './repositories/team.repository.interface';
import type { IUserRepository } from '../users/repositories/user.repository.interface';
import type { ITeamMemberRepository } from './repositories/team-member.repository.interface';
import { TeamMemberRole } from './team-member.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { TeamResponseDto } from './dto/team-response.dto';

/**
 * Teams Service
 * Contains business logic for team operations
 * Follows Single Responsibility Principle - only business logic
 * Depends on repository interface (Dependency Inversion Principle)
 */
@Injectable()
export class TeamsService {
  constructor(
    @Inject('ITeamRepository')
    private readonly teamRepository: ITeamRepository,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('ITeamMemberRepository')
    private readonly teamMemberRepository: ITeamMemberRepository,
  ) {}

  /**
   * Create a new team
   * Business logic:
   * - Validate slug uniqueness
   * - Create team
   * - Automatically assign creator as OWNER in TeamMember table
   * - Does NOT grant platform-level ADMIN privileges (least privilege principle)
   *
   * @param creator The user creating the team (will be assigned as OWNER)
   * @param createTeamDto Team creation data
   */
  async createTeam(
    creator: User,
    createTeamDto: CreateTeamDto,
  ): Promise<TeamResponseDto> {
    // Check if slug already exists
    const slugExists = await this.teamRepository.slugExists(createTeamDto.slug);
    if (slugExists) {
      throw new ConflictException('Team with this slug already exists');
    }

    // Create team via repository (no adminUserId - we use TeamMember for ownership)
    const team = await this.teamRepository.create({
      name: createTeamDto.name,
      slug: createTeamDto.slug,
      description: createTeamDto.description,
      adminUserId: undefined,
    });

    // Automatically assign creator as OWNER in TeamMember table
    // This is the secure way: team-level role, not platform-level privilege
    await this.teamMemberRepository.create({
      userId: creator.id,
      teamId: team.id,
      role: TeamMemberRole.OWNER,
    });

    return this.toResponseDto(team);
  }

  /**
   * Legacy create method (for backward compatibility)
   * @deprecated Use createTeam instead
   */
  async create(createTeamDto: CreateTeamDto): Promise<TeamResponseDto> {
    // This method is kept for backward compatibility but should not be used
    // It doesn't create TeamMember records
    const slugExists = await this.teamRepository.slugExists(createTeamDto.slug);
    if (slugExists) {
      throw new ConflictException('Team with this slug already exists');
    }

    const team = await this.teamRepository.create({
      name: createTeamDto.name,
      slug: createTeamDto.slug,
      description: createTeamDto.description,
      adminUserId: createTeamDto.adminUserId,
    });

    return this.toResponseDto(team);
  }

  /**
   * Find team by ID
   */
  async findById(id: string): Promise<TeamResponseDto> {
    const team = await this.teamRepository.findById(id);
    if (!team) {
      throw new NotFoundException('Team not found');
    }
    return this.toResponseDto(team);
  }

  /**
   * Find team by slug
   */
  async findBySlug(slug: string): Promise<TeamResponseDto> {
    const team = await this.teamRepository.findBySlug(slug);
    if (!team) {
      throw new NotFoundException('Team not found');
    }
    return this.toResponseDto(team);
  }

  /**
   * Find all teams
   */
  async findAll(): Promise<TeamResponseDto[]> {
    const teams = await this.teamRepository.findAll();
    return teams.map((team) => this.toResponseDto(team));
  }

  /**
   * Find teams by admin user ID
   */
  async findByAdminUserId(adminUserId: string): Promise<TeamResponseDto[]> {
    const teams = await this.teamRepository.findByAdminUserId(adminUserId);
    return teams.map((team) => this.toResponseDto(team));
  }

  /**
   * Update team
   * Business logic: Validate slug uniqueness if slug is being changed
   */
  async update(
    id: string,
    updateTeamDto: UpdateTeamDto,
  ): Promise<TeamResponseDto> {
    // Check if slug is being updated and if it already exists
    if (updateTeamDto.slug) {
      const slugExists = await this.teamRepository.slugExists(
        updateTeamDto.slug,
        id,
      );
      if (slugExists) {
        throw new ConflictException('Team with this slug already exists');
      }
    }

    // Validate admin user if being changed
    if (updateTeamDto.adminUserId) {
      // Note: In a real app, validate user exists
    }

    const team = await this.teamRepository.update(id, updateTeamDto);
    return this.toResponseDto(team);
  }

  /**
   * Soft delete team
   * Business logic: Prevent deletion if team has active users
   */
  async softDelete(id: string): Promise<void> {
    const team = await this.teamRepository.findById(id);
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Check if team has active users
    const hasActiveUsers = await this.teamRepository.hasActiveUsers(id);
    if (hasActiveUsers) {
      const userCount = await this.teamRepository.countActiveUsers(id);
      throw new ConflictException(
        `Cannot delete team: ${userCount} active user(s) still belong to this team. Please remove or reassign users first.`,
      );
    }

    await this.teamRepository.softDelete(id);
  }

  /**
   * Get all teams the current user belongs to
   */
  async getMyTeams(user: User): Promise<TeamResponseDto[]> {
    if (user.deletedAt) {
      throw new UnauthorizedException('User account is inactive');
    }

    const memberships = await this.teamMemberRepository.findByUserId(user.id);
    if (!memberships.length) {
      return [];
    }

    const teams = await Promise.all(
      memberships.map((m) => this.teamRepository.findById(m.teamId)),
    );

    const roleByTeamId = new Map(memberships.map((m) => [m.teamId, m.role]));

    return teams
      .filter((t) => t && !t.deletedAt)
      .map((t) => {
        const dto = this.toResponseDto(t!);
        dto.userRole = roleByTeamId.get(t!.id) as 'OWNER' | 'MANAGER' | 'MEMBER' | undefined;
        return dto;
      });
  }

  /**
   * Add user to team
   * Business rules:
   * - Only team admin or system ADMIN can add users
   * - Cannot add users across different teams
   * - User must exist and be active
   */
  async addUserToTeam(
    admin: User,
    teamId: string,
    userId: string,
  ): Promise<{ message: string; user: any }> {
    // Validate admin user is not soft-deleted
    if (admin.deletedAt) {
      throw new UnauthorizedException('Admin account is inactive');
    }

    // Validate team exists
    const targetTeam = await this.teamRepository.findById(teamId);
    if (!targetTeam || targetTeam.deletedAt) {
      throw new NotFoundException('Team not found');
    }

    // Authorization check: Admin must be ADMIN role OR team owner of the target team
    const isSystemAdmin = admin.role === UserRole.ADMIN;

    // Check if user is team owner of the target team (using TeamMember)
    const isTeamOwner = await this.isTeamOwnerOfTeam(admin, teamId);

    if (!isSystemAdmin && !isTeamOwner) {
      throw new ForbiddenException(
        'Only team owners or system administrators can add users to teams',
      );
    }

    // Get target user
    const targetUser = await this.userRepository.findById(userId);
    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    if (targetUser.deletedAt) {
      throw new BadRequestException('Cannot add inactive user to team');
    }

    // Check if already a member
    const existingMember = await this.teamMemberRepository.findByUserAndTeam(
      userId,
      teamId,
    );
    if (existingMember) {
      throw new ConflictException('User is already a member of this team');
    }

    // Create TeamMember record
    await this.teamMemberRepository.create({
      userId: userId,
      teamId: teamId,
      role: TeamMemberRole.MEMBER,
    });

    const teamName = targetTeam.name || 'team';

    return {
      message: `User ${targetUser.email} has been added to team ${teamName}`,
      user: {
        id: targetUser.id,
        email: targetUser.email,
        role: targetUser.role,
      },
    };
  }

  /**
   * Update team member role
   * Enterprise-grade business rules:
   * - Only TEAM_OWNER can promote MEMBER → OWNER
   * - Only TEAM_OWNER can demote OWNER → MEMBER
   * - System ADMIN can change any team member role
   * - Prevents role escalation
   */
  async updateTeamMemberRole(
    changer: User,
    teamId: string,
    targetUserId: string,
    newRole: TeamMemberRole,
  ): Promise<{ message: string; member: any }> {
    // Validate changer is not soft-deleted
    if (changer.deletedAt) {
      throw new UnauthorizedException('User account is inactive');
    }

    // Validate team exists
    const team = await this.teamRepository.findById(teamId);
    if (!team || team.deletedAt) {
      throw new NotFoundException('Team not found');
    }

    // Get target team member
    const targetMember = await this.teamMemberRepository.findByUserAndTeam(
      targetUserId,
      teamId,
    );
    if (!targetMember) {
      throw new NotFoundException('Team member not found');
    }

    const oldRole = targetMember.role;

    // Authorization: Only TEAM_OWNER or system ADMIN can change roles
    const isSystemAdmin = changer.role === UserRole.ADMIN;
    const isTeamOwner = await this.isTeamOwnerOfTeam(changer, teamId);

    if (!isSystemAdmin && !isTeamOwner) {
      throw new ForbiddenException(
        'Only team owners or system administrators can change team member roles',
      );
    }

    // Prevent role escalation: Only TEAM_OWNER can promote to OWNER
    const isPromotingToOwner =
      newRole === TeamMemberRole.OWNER && oldRole === TeamMemberRole.MEMBER;
    if (isPromotingToOwner && !isTeamOwner && !isSystemAdmin) {
      throw new ForbiddenException(
        'Only team owners can promote members to OWNER role. Role escalation prevented.',
      );
    }

    // Prevent self-demotion (team owner cannot demote themselves)
    if (
      changer.id === targetUserId &&
      newRole === TeamMemberRole.MEMBER &&
      oldRole === TeamMemberRole.OWNER
    ) {
      throw new ForbiddenException(
        'Team owners cannot demote themselves. Transfer ownership first.',
      );
    }

    // Update role
    const updatedMember = await this.teamMemberRepository.updateRole(
      targetMember.id,
      newRole,
    );

    return {
      message: `Team member role changed from ${oldRole} to ${newRole}`,
      member: {
        userId: updatedMember.userId,
        teamId: updatedMember.teamId,
        role: updatedMember.role,
      },
    };
  }

  /**
   * Check if user is a team owner (using TeamMember)
   * Helper method for authorization
   */
  private async isTeamOwner(user: User, teamId: string): Promise<boolean> {
    return this.teamMemberRepository.isTeamOwner(user.id, teamId);
  }

  /**
   * Check if user is a team member (any role)
   */
  async isTeamMember(user: User, teamId: string): Promise<boolean> {
    return this.teamMemberRepository.isTeamMember(user.id, teamId);
  }

  /**
   * Check if user is a team owner of a specific team
   * Public method for authorization checks
   * Uses TeamMember table for team-level roles
   */
  async isTeamOwnerOfTeam(user: User, teamId: string): Promise<boolean> {
    return this.teamMemberRepository.isTeamOwner(user.id, teamId);
  }

  async isTeamAdminOfTeam(user: User, teamId: string): Promise<boolean> {
    return this.teamMemberRepository.isTeamOwner(user.id, teamId);
  }

  /**
   * Get team members with their team roles (OWNER/MANAGER/MEMBER)
   * Any authenticated team member can view the list
   */
  async getTeamMembersWithRoles(
    requester: User,
    teamId: string,
  ): Promise<{ userId: string; email: string; firstName?: string; lastName?: string; teamRole: string }[]> {
    const team = await this.teamRepository.findById(teamId);
    if (!team || team.deletedAt) {
      throw new NotFoundException('Team not found');
    }

    const isSystemAdmin = requester.role === UserRole.ADMIN;
    const isMember = await this.teamMemberRepository.isTeamMember(requester.id, teamId);
    if (!isSystemAdmin && !isMember) {
      throw new ForbiddenException('You are not a member of this team');
    }

    const memberships = await this.teamMemberRepository.findByTeamId(teamId);
    return memberships.map((m) => ({
      userId: m.userId,
      email: m.user?.email ?? '',
      firstName: m.user?.firstName,
      lastName: m.user?.lastName,
      teamRole: m.role,
    }));
  }

  /**
   * Convert Team entity to TeamResponseDto
   */
  private toResponseDto(team: Team): TeamResponseDto {
    const dto = new TeamResponseDto();
    dto.id = team.id;
    dto.name = team.name;
    dto.slug = team.slug;
    dto.description = team.description;
    dto.adminUserId = team.adminUserId;
    dto.createdAt = team.createdAt;
    dto.updatedAt = team.updatedAt;
    return dto;
  }
}
