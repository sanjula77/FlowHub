export interface AdminStats {
  users: { total: number; admins: number };
  teams: { total: number };
  projects: { total: number };
  tasks: { total: number; todo: number; inProgress: number; done: number };
  recentActivity: {
    id: string;
    action: string;
    userId: string;
    entityType: string;
    entityId: string;
    createdAt: string;
  }[];
}
