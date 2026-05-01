'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getMyProfile, getProjects, getTasks, updateTaskStatus } from '@/lib/api';
import KanbanBoard from '@/components/tasks/KanbanBoard';
import TaskDetailModal from '@/components/tasks/TaskDetailModal';
import CreateTaskModal from '@/components/tasks/CreateTaskModal';
import AssignTaskModal from '@/components/tasks/AssignTaskModal';
import MainLayout from '@/components/layout/MainLayout';
import LoadingState from '@/components/ui/LoadingState';
import { User } from '@/types/user';
import { Project } from '@/types/project';
import { Task, TaskStatus } from '@/types/task';
import { CheckSquare, Plus, AlertCircle, ChevronDown } from 'lucide-react';

function TasksDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectIdParam = searchParams.get('projectId');

  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(projectIdParam);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [assigningTaskId, setAssigningTaskId] = useState<string | null>(null);

  useEffect(() => { loadDashboardData(); }, []);
  useEffect(() => { if (!loading) loadTasks(); }, [selectedProjectId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const [userData, projectsData] = await Promise.all([getMyProfile(), getProjects()]);
      setCurrentUser(userData);
      setProjects(projectsData);
      await loadTasks();
    } catch (err: any) {
      if (err.message?.includes('401') || err.message?.includes('Unauthorized')) { router.push('/login'); return; }
      setError(err.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async () => {
    try {
      const data = await getTasks(selectedProjectId || undefined);
      setTasks(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load tasks');
    }
  };

  const handleCreateTask = (newTask: Task) => {
    setTasks(prev => [newTask, ...prev]);
    setShowCreateModal(false);
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    try {
      await updateTaskStatus(taskId, newStatus);
    } catch (err: any) {
      setError(err.message || 'Failed to update task status');
      await loadTasks();
    }
  };

  const handleTaskUpdated = (updated: Task) => {
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
    setSelectedTask(updated);
  };

  const getDisplayName = (user: User | null) => {
    if (!user) return 'User';
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
    if (user.firstName) return user.firstName;
    return user.email.split('@')[0];
  };

  const isAdmin = currentUser?.role === 'ADMIN';
  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const statusCounts = {
    todo: tasks.filter(t => t.status === TaskStatus.TODO).length,
    inProgress: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
    done: tasks.filter(t => t.status === TaskStatus.DONE).length,
  };

  if (loading) {
    return (
      <MainLayout userName={getDisplayName(currentUser)} userEmail={currentUser?.email} userRole={currentUser?.role as 'ADMIN' | 'USER'}>
        <div className="animate-pulse space-y-6">
          <div className="flex items-center justify-between">
            <div className="h-8 w-24 bg-gray-100 rounded-lg" />
            <div className="h-9 w-32 bg-gray-100 rounded-xl" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <div key={i} className="h-64 bg-gray-100 rounded-2xl" />)}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout userName={getDisplayName(currentUser)} userEmail={currentUser?.email} userRole={currentUser?.role as 'ADMIN' | 'USER'}>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
            <p className="mt-1 text-sm text-gray-500">
              {isAdmin ? 'All tasks across projects' : 'Tasks in your team'} · {tasks.length} total
            </p>
          </div>
          <button
            onClick={() => {
              if (!selectedProjectId && projects.length > 0) {
                setError('Please select a project first to create a task');
              } else if (projects.length === 0) {
                setError('No projects available. Please create a project first.');
              } else {
                setShowCreateModal(true);
              }
            }}
            disabled={projects.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            New task
          </button>
        </div>

        {/* Filters + stats bar */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Project filter */}
          <div className="relative">
            <select
              value={selectedProjectId || ''}
              onChange={(e) => {
                const id = e.target.value || null;
                setSelectedProjectId(id);
                router.push(id ? `/tasks?projectId=${id}` : '/tasks');
              }}
              className="appearance-none pl-3 pr-8 py-2 text-sm bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="">All projects</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>

          {/* Status pills */}
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full font-medium">{statusCounts.todo} To Do</span>
            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">{statusCounts.inProgress} In Progress</span>
            <span className="px-2.5 py-1 bg-green-50 text-green-700 rounded-full font-medium">{statusCounts.done} Done</span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
            <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600 text-lg leading-none">×</button>
          </div>
        )}

        {/* Kanban board */}
        {tasks.length > 0 ? (
          <KanbanBoard
            tasks={tasks}
            onStatusChange={handleStatusChange}
            onTaskClick={(task) => setSelectedTask(task)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white border border-gray-100 rounded-2xl">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
              <CheckSquare className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-base font-semibold text-gray-700">No tasks found</h3>
            <p className="mt-2 text-sm text-gray-400 max-w-xs">
              {selectedProjectId ? 'No tasks in this project yet.' : 'Select a project or create your first task.'}
            </p>
            {projects.length > 0 && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-6 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create task
              </button>
            )}
          </div>
        )}

        {/* Modals */}
        {selectedTask && currentUser && (
          <TaskDetailModal
            task={selectedTask}
            currentUser={currentUser}
            onClose={() => setSelectedTask(null)}
            onTaskUpdated={handleTaskUpdated}
          />
        )}
        {showCreateModal && (
          <CreateTaskModal
            projectId={selectedProjectId || undefined}
            projects={projects.map(p => ({ id: p.id, name: p.name }))}
            onClose={() => setShowCreateModal(false)}
            onSuccess={handleCreateTask}
          />
        )}
        {assigningTaskId && selectedProject && (
          <AssignTaskModal
            taskId={assigningTaskId}
            teamId={selectedProject.teamId}
            currentAssignedToId={tasks.find(t => t.id === assigningTaskId)?.assignedToId}
            onClose={() => setAssigningTaskId(null)}
            onSuccess={() => { setAssigningTaskId(null); loadTasks(); }}
          />
        )}
      </div>
    </MainLayout>
  );
}

export default function TasksDashboard() {
  return (
    <Suspense fallback={<LoadingState fullScreen message="Loading..." />}>
      <TasksDashboardContent />
    </Suspense>
  );
}
