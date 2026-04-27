export class ProjectResponseDto {
  id: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  teamId: string;
  createdById?: string;
  createdAt: Date;
  updatedAt: Date;
}
