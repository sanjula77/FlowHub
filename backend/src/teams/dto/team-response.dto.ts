export class TeamResponseDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  adminUserId?: string; // ID of the team admin/owner
  userRole?: 'OWNER' | 'MANAGER' | 'MEMBER'; // Current user's role in this team (only set by getMyTeams)
  userCount?: number; // Number of users in team (optional, for convenience)
  createdAt: Date;
  updatedAt: Date;
  // deletedAt is intentionally excluded from responses
}
