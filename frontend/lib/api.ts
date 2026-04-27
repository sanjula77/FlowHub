const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
import { fetchWithAuth } from './auth';
import { Project, CreateProjectDto, UpdateProjectDto } from '@/types/project';
import { Comment } from '@/types/comment';
import { Label } from '@/types/label';
import { AdminStats } from '@/types/admin';

/**
 * Get current user's team
 */
export async function getMyTeams() {
  const res = await fetchWithAuth(`${API_URL}/teams/me`);
  if (!res.ok) {
    throw new Error('Failed to load team');
  }
  return res.json();
}

export async function getMyTeam() {
  const teams = await getMyTeams();
  return Array.isArray(teams) ? teams[0] : teams;
}

/**
 * Get current user profile
 */
export async function getMyProfile() {
  const res = await fetchWithAuth(`${API_URL}/users/me`);
  if (!res.ok) {
    throw new Error('Failed to load profile');
  }
  return res.json();
}

/**
 * Get team members with their team roles (OWNER/MANAGER/MEMBER)
 */
export async function getTeamMembers(teamId: string) {
  const res = await fetchWithAuth(`${API_URL}/teams/${teamId}/members`);
  if (!res.ok) {
    throw new Error('Failed to load team members');
  }
  return res.json();
}

export async function updateTeamMemberRole(teamId: string, userId: string, role: 'OWNER' | 'MANAGER' | 'MEMBER') {
  const res = await fetchWithAuth(`${API_URL}/teams/${teamId}/members/${userId}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to update role');
  }
  return res.json();
}

/**
 * Invite user to team
 * Requires ADMIN role or team admin status
 */
export async function inviteUser(data: {
  email: string;
  teamId: string;
  role: 'USER' | 'ADMIN';
  customMessage?: string;
}) {
  const res = await fetchWithAuth(`${API_URL}/invitations`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to send invitation');
  }

  return res.json();
}

/**
 * Remove user from team
 * Requires ADMIN role
 */
export async function removeUser(userId: string) {
  const res = await fetchWithAuth(`${API_URL}/users/${userId}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to remove user');
  }
}

/**
 * Get all tasks (role-based)
 * ADMIN: Returns all tasks
 * USER: Returns only tasks from their team
 */
export async function getTasks(projectId?: string, status?: string) {
  const params = new URLSearchParams();
  if (projectId) params.append('projectId', projectId);
  if (status) params.append('status', status);
  
  const queryString = params.toString();
  const url = queryString ? `${API_URL}/tasks?${queryString}` : `${API_URL}/tasks`;
  
  const res = await fetchWithAuth(url);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to load tasks');
  }
  return res.json();
}

/**
 * Get task by ID
 */
export async function getTaskById(id: string) {
  const res = await fetchWithAuth(`${API_URL}/tasks/${id}`);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to load task');
  }
  return res.json();
}

/**
 * Get tasks by project
 */
export async function getTasksByProject(projectId: string) {
  const res = await fetchWithAuth(`${API_URL}/tasks/project/${projectId}`);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to load tasks');
  }
  return res.json();
}

/**
 * Get tasks assigned to a user
 */
export async function getTasksByAssigned(userId: string) {
  const res = await fetchWithAuth(`${API_URL}/tasks/assigned/${userId}`);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to load tasks');
  }
  return res.json();
}

/**
 * Create new task
 */
export async function createTask(data: {
  title: string;
  description?: string;
  status?: string;
  projectId: string;
  assignedToId?: string;
  priority?: number;
  dueDate?: string;
}) {
  const res = await fetchWithAuth(`${API_URL}/tasks`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to create task');
  }

  return res.json();
}

/**
 * Assign task to user
 */
export async function assignTask(taskId: string, assignedToId: string) {
  const res = await fetchWithAuth(`${API_URL}/tasks/${taskId}/assign`, {
    method: 'PATCH',
    body: JSON.stringify({ assignedToId }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to assign task');
  }

  return res.json();
}

/**
 * Update task status
 */
export async function updateTaskStatus(taskId: string, status: string) {
  const res = await fetchWithAuth(`${API_URL}/tasks/${taskId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to update task status');
  }

  return res.json();
}

/**
 * Update task
 */
export async function updateTask(taskId: string, data: {
  title?: string;
  description?: string;
  status?: string;
  assignedToId?: string;
  priority?: number;
  dueDate?: string;
}) {
  const res = await fetchWithAuth(`${API_URL}/tasks/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to update task');
  }

  return res.json();
}

/**
 * Delete task
 */
export async function deleteTask(taskId: string) {
  const res = await fetchWithAuth(`${API_URL}/tasks/${taskId}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to delete task');
  }
}

/**
 * Get all projects (role-based)
 * ADMIN: Returns all projects
 * USER: Returns only projects from their team
 */
export async function getProjects(): Promise<Project[]> {
  const res = await fetchWithAuth(`${API_URL}/projects`);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to load projects');
  }
  return res.json();
}

/**
 * Get project by ID
 * ADMIN: Can access any project
 * USER: Can only access projects from their team
 */
export async function getProjectById(id: string): Promise<Project> {
  const res = await fetchWithAuth(`${API_URL}/projects/${id}`);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to load project');
  }
  return res.json();
}

/**
 * Get projects created by current user
 */
export async function getMyProjects(): Promise<Project[]> {
  const res = await fetchWithAuth(`${API_URL}/projects/my-projects`);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to load my projects');
  }
  return res.json();
}

/**
 * Create new project
 * Requires ADMIN role
 */
export async function createProject(data: CreateProjectDto): Promise<Project> {
  const res = await fetchWithAuth(`${API_URL}/projects`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to create project');
  }

  return res.json();
}

/**
 * Update project
 * Requires ADMIN role
 */
export async function updateProject(id: string, data: UpdateProjectDto): Promise<Project> {
  const res = await fetchWithAuth(`${API_URL}/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to update project');
  }

  return res.json();
}

export async function deleteProject(id: string): Promise<void> {
  const res = await fetchWithAuth(`${API_URL}/projects/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to delete project');
  }
}

export async function getProjectMembers(projectId: string) {
  const res = await fetchWithAuth(`${API_URL}/projects/${projectId}/members`);
  if (!res.ok) throw new Error('Failed to load project members');
  return res.json();
}

export async function addProjectMember(projectId: string, userId: string) {
  const res = await fetchWithAuth(`${API_URL}/projects/${projectId}/members`, {
    method: 'POST',
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to add project member');
  }
  return res.json();
}

export async function removeProjectMember(projectId: string, userId: string) {
  const res = await fetchWithAuth(`${API_URL}/projects/${projectId}/members/${userId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to remove project member');
  }
}

export async function getTaskComments(taskId: string): Promise<Comment[]> {
  const res = await fetchWithAuth(`${API_URL}/tasks/${taskId}/comments`);
  if (!res.ok) throw new Error('Failed to load comments');
  return res.json();
}

export async function createComment(taskId: string, content: string): Promise<Comment> {
  const res = await fetchWithAuth(`${API_URL}/tasks/${taskId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to create comment');
  }
  return res.json();
}

export async function updateComment(id: string, content: string): Promise<Comment> {
  const res = await fetchWithAuth(`${API_URL}/comments/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ content }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to update comment');
  }
  return res.json();
}

export async function deleteComment(id: string): Promise<void> {
  const res = await fetchWithAuth(`${API_URL}/comments/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to delete comment');
  }
}

export async function getTeamLabels(teamId: string): Promise<Label[]> {
  const res = await fetchWithAuth(`${API_URL}/teams/${teamId}/labels`);
  if (!res.ok) throw new Error('Failed to load labels');
  return res.json();
}

export async function createLabel(teamId: string, name: string, color: string): Promise<Label> {
  const res = await fetchWithAuth(`${API_URL}/teams/${teamId}/labels`, {
    method: 'POST',
    body: JSON.stringify({ name, color }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to create label');
  }
  return res.json();
}

export async function updateLabel(id: string, data: { name?: string; color?: string }): Promise<Label> {
  const res = await fetchWithAuth(`${API_URL}/labels/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to update label');
  }
  return res.json();
}

export async function deleteLabel(id: string): Promise<void> {
  const res = await fetchWithAuth(`${API_URL}/labels/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to delete label');
  }
}

export async function addTaskLabel(taskId: string, labelId: string): Promise<void> {
  const res = await fetchWithAuth(`${API_URL}/tasks/${taskId}/labels`, {
    method: 'POST',
    body: JSON.stringify({ labelId }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to add label');
  }
}

export async function removeTaskLabel(taskId: string, labelId: string): Promise<void> {
  const res = await fetchWithAuth(`${API_URL}/tasks/${taskId}/labels/${labelId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to remove label');
  }
}

export async function getAdminStats(): Promise<AdminStats> {
  const res = await fetchWithAuth(`${API_URL}/admin/stats`);
  if (!res.ok) throw new Error('Failed to load admin stats');
  return res.json();
}

export async function getAllUsers() {
  const res = await fetchWithAuth(`${API_URL}/users`);
  if (!res.ok) throw new Error('Failed to load users');
  return res.json();
}

export async function updateUserRole(userId: string, role: 'USER' | 'ADMIN') {
  const res = await fetchWithAuth(`${API_URL}/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to update user');
  }
  return res.json();
}
