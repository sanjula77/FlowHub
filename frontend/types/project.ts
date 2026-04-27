export interface Project {
  id: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  teamId: string;
  createdById?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
  teamId: string;
  isPrivate?: boolean;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
}

