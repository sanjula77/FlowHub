'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getProjects, getMyProfile, getTasks, getMyTeam, getTeamMembers } from '@/lib/api';
import { Project } from '@/types/project';
import { User } from '@/types/user';
import { Task, TaskStatus } from '@/types/task';
import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';
import {
  FolderKanban,
  CheckSquare,
  Users,
  TrendingUp,
  Clock,
  ArrowRight,
  Plus,
  BarChart3,
  Settings,
  AlertCircle,
} from 'lucide-react';

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => { loadDashboardData(); }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const userData = await getMyProfile();
      setCurrentUser(userData);

      const [projectsData, tasksData] = await Promise.all([
        getProjects().catch(() => []),
        getTasks().catch(() => []),
      ]);
      setProjects(projectsData);
      setTasks(tasksData);

      try {
        const team = await getMyTeam();
        const members = await getTeamMembers(team.id).catch(() => []);
        setTeamMembers(members);
      } catch {
        setTeamMembers([]);
      }
    } catch (err: any) {
      if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        router.push('/login');
        return;
      }
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = currentUser?.role === 'ADMIN';
  const activeTasks = tasks.filter(t => t.status === TaskStatus.TODO || t.status === TaskStatus.IN_PROGRESS).length;
  const completedTasks = tasks.filter(t => t.status === TaskStatus.DONE).length;
  const thisWeekTasks = tasks.filter(t => {
    const d = new Date(t.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return d >= weekAgo;
  }).length;

  const getDisplayName = (user: User | null) => {
    if (!user) return 'User';
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
    if (user.firstName) return user.firstName;
    return user.email.split('@')[0];
  };

  const getInitials = (user: User | null) => {
    if (!user) return 'U';
    if (user.firstName) return `${user.firstName[0]}${user.lastName?.[0] ?? ''}`.toUpperCase();
    return user.email[0].toUpperCase();
  };

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      TODO: 'bg-slate-100 text-slate-600',
      IN_PROGRESS: 'bg-blue-50 text-blue-700',
      IN_REVIEW: 'bg-amber-50 text-amber-700',
      DONE: 'bg-green-50 text-green-700',
    };
    return map[status] ?? 'bg-gray-100 text-gray-600';
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      TODO: 'To Do', IN_PROGRESS: 'In Progress', IN_REVIEW: 'In Review', DONE: 'Done',
    };
    return map[status] ?? status;
  };

  if (loading) {
    return (
      <MainLayout userName={getDisplayName(currentUser)} userEmail={currentUser?.email} userRole={currentUser?.role as 'ADMIN' | 'USER'}>
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-gray-100 rounded-lg" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-2xl" />)}
          </div>
          <div className="h-64 bg-gray-100 rounded-2xl" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout userName={getDisplayName(currentUser)} userEmail={currentUser?.email} userRole={currentUser?.role as 'ADMIN' | 'USER'}>
      <div className="space-y-8">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
              {currentUser?.firstName ?? getDisplayName(currentUser)} 👋
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          {isAdmin && (
            <Link href="/projects" className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm">
              <Plus className="w-4 h-4" />
              New project
            </Link>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Projects', value: projects.length, icon: FolderKanban, color: 'text-blue-600', bg: 'bg-blue-50', href: '/projects' },
            { label: 'Active Tasks', value: activeTasks, icon: CheckSquare, color: 'text-violet-600', bg: 'bg-violet-50', href: '/tasks' },
            { label: 'Team Members', value: teamMembers.length, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50', href: '/team' },
            { label: 'This Week', value: thisWeekTasks, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50', href: '/tasks' },
          ].map(({ label, value, icon: Icon, color, bg, href }) => (
            <Link key={label} href={href}
              className="group bg-white border border-gray-100 rounded-2xl p-5 hover:border-gray-200 hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
                </div>
                <div className={`${bg} p-2.5 rounded-xl`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs text-gray-400 group-hover:text-blue-600 transition-colors">
                <span>View all</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          ))}
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Recent Projects */}
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Recent Projects</h2>
                <p className="text-xs text-gray-400 mt-0.5">{projects.length} total</p>
              </div>
              <Link href="/projects" className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {projects.slice(0, 5).length > 0 ? (
                projects.slice(0, 5).map((project) => (
                  <Link key={project.id} href={`/projects/${project.id}`}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors group">
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FolderKanban className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {project.name}
                      </p>
                      {project.description && (
                        <p className="text-xs text-gray-400 truncate mt-0.5">{project.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-300 group-hover:text-blue-400 transition-colors flex-shrink-0">
                      <Clock className="w-3 h-3" />
                      <span>Recently updated</span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-3">
                    <FolderKanban className="w-6 h-6 text-gray-300" />
                  </div>
                  <p className="text-sm font-medium text-gray-500">No projects yet</p>
                  <p className="text-xs text-gray-400 mt-1">Create your first project to get started</p>
                  {isAdmin && (
                    <Link href="/projects" className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors">
                      Create project
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Task summary */}
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50">
                <h2 className="text-sm font-semibold text-gray-900">Task Overview</h2>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { label: 'Active', value: activeTasks, color: 'bg-blue-500' },
                  { label: 'Completed', value: completedTasks, color: 'bg-emerald-500' },
                  { label: 'This week', value: thisWeekTasks, color: 'bg-violet-500' },
                ].map(({ label, value, color }) => (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-gray-500">{label}</span>
                      <span className="text-xs font-semibold text-gray-700">{value}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${color} rounded-full transition-all`}
                        style={{ width: tasks.length > 0 ? `${Math.min((value / tasks.length) * 100, 100)}%` : '0%' }}
                      />
                    </div>
                  </div>
                ))}
                <Link href="/tasks"
                  className="flex items-center justify-center gap-2 w-full mt-2 py-2 text-xs font-medium text-gray-500 hover:text-blue-600 border border-gray-100 hover:border-blue-200 rounded-xl transition-all">
                  View all tasks <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Team */}
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
                <h2 className="text-sm font-semibold text-gray-900">Team</h2>
                <Link href="/team" className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">
                  Manage
                </Link>
              </div>
              <div className="p-4">
                {teamMembers.length > 0 ? (
                  <div className="space-y-2">
                    {teamMembers.slice(0, 5).map((member: any) => (
                      <div key={member.userId ?? member.id} className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                          {(member.firstName?.[0] ?? member.email?.[0] ?? '?').toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-700 truncate">
                            {member.firstName && member.lastName ? `${member.firstName} ${member.lastName}` : member.email}
                          </p>
                          <p className="text-xs text-gray-400 truncate">{member.teamRole ?? 'Member'}</p>
                        </div>
                      </div>
                    ))}
                    {teamMembers.length > 5 && (
                      <p className="text-xs text-gray-400 text-center pt-1">+{teamMembers.length - 5} more</p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 text-center py-4">No team members yet</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Admin quick actions */}
        {isAdmin && (
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50">
              <h2 className="text-sm font-semibold text-gray-900">Admin</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4">
              {[
                { href: '/team', icon: Users, label: 'Manage Teams' },
                { href: '/admin/settings', icon: Settings, label: 'System Settings' },
                { href: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
                { href: '/admin', icon: CheckSquare, label: 'Admin Panel' },
              ].map(({ href, icon: Icon, label }) => (
                <Link key={href} href={href}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
                  <div className="w-8 h-8 bg-gray-50 group-hover:bg-blue-100 rounded-lg flex items-center justify-center transition-colors">
                    <Icon className="w-4 h-4 text-gray-500 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <span className="text-xs font-medium text-gray-600 group-hover:text-blue-700 text-center transition-colors">{label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
