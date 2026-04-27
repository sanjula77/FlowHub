'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getMyProfile, getProjects, getTasks, updateTaskStatus, deleteTask } from '@/lib/api';
import KanbanBoard from '@/components/tasks/KanbanBoard';
import TaskDetailModal from '@/components/tasks/TaskDetailModal';
import CreateTaskModal from '@/components/tasks/CreateTaskModal';
import AssignTaskModal from '@/components/tasks/AssignTaskModal';
import MainLayout from '@/components/layout/MainLayout';
import LoadingState from '@/components/ui/LoadingState';
import Alert from '@/components/ui/Alert';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import EmptyState from '@/components/ui/EmptyState';
import { User } from '@/types/user';
import { Project } from '@/types/project';
import { Task, TaskStatus } from '@/types/task';
import { CheckSquare, Plus, Filter } from 'lucide-react';

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

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (!loading) {
      loadTasks();
    }
  }, [selectedProjectId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const [userData, projectsData] = await Promise.all([getMyProfile(), getProjects()]);
      setCurrentUser(userData);
      setProjects(projectsData);
      await loadTasks();
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

  const loadTasks = async () => {
    try {
      const tasksData = await getTasks(selectedProjectId || undefined);
      setTasks(tasksData);
    } catch (err: any) {
      setError(err.message || 'Failed to load tasks');
    }
  };

  const handleCreateTask = (newTask: Task) => {
    setTasks((prev) => [newTask, ...prev]);
    setShowCreateModal(false);
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    // Optimistic update
    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status: newStatus } : t));
    try {
      await updateTaskStatus(taskId, newStatus);
    } catch (err: any) {
      setError(err.message || 'Failed to update task status');
      await loadTasks();
    }
  };

  const handleTaskUpdated = (updated: Task) => {
    setTasks((prev) => prev.map((t) => t.id === updated.id ? updated : t));
    setSelectedTask(updated);
  };

  const handleAssignSuccess = async () => {
    setAssigningTaskId(null);
    await loadTasks();
  };

  const getUserDisplayName = (user: User | null): string => {
    if (!user) return 'User';
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
    if (user.firstName) return user.firstName;
    return user.email.split('@')[0];
  };

  const isAdmin = currentUser?.role === 'ADMIN';
  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  if (loading) {
    return (
      <MainLayout
        userName={getUserDisplayName(currentUser)}
        userEmail={currentUser?.email}
        userRole={currentUser?.role as 'ADMIN' | 'USER'}
      >
        <LoadingState message="Loading tasks..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout
      userName={getUserDisplayName(currentUser)}
      userEmail={currentUser?.email}
      userRole={currentUser?.role as 'ADMIN' | 'USER'}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
            <p className="mt-1 text-sm text-gray-500">
              {isAdmin ? 'Manage all tasks across projects' : 'View and manage tasks in your team'}
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => {
              if (!selectedProjectId && projects.length > 0) {
                setError('Please select a project first to create a task');
              } else if (projects.length === 0) {
                setError('No projects available. Please create a project first.');
              } else {
                setShowCreateModal(true);
              }
            }}
            leftIcon={<Plus className="w-4 h-4" />}
            disabled={projects.length === 0}
          >
            Create Task
          </Button>
        </div>

        {/* Project filter */}
        <Card>
          <CardHeader
            title="Filter by Project"
            action={<Filter className="w-5 h-5 text-gray-400" />}
          />
          <CardContent>
            <div className="max-w-xs">
              <Select
                label="Project"
                value={selectedProjectId || ''}
                onChange={(e) => {
                  const projectId = e.target.value || null;
                  setSelectedProjectId(projectId);
                  if (projectId) {
                    router.push(`/tasks?projectId=${projectId}`);
                  } else {
                    router.push('/tasks');
                  }
                }}
                options={[
                  { value: '', label: 'All Projects' },
                  ...projects.map((p) => ({ value: p.id, label: p.name })),
                ]}
              />
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="error" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Kanban board */}
        {tasks.length > 0 ? (
          <KanbanBoard
            tasks={tasks}
            onStatusChange={handleStatusChange}
            onTaskClick={(task) => setSelectedTask(task)}
          />
        ) : (
          <Card>
            <CardContent>
              <EmptyState
                icon={<CheckSquare className="w-16 h-16 text-gray-300" />}
                title="No tasks found"
                description={
                  selectedProjectId
                    ? 'No tasks in this project. Create your first task to get started.'
                    : 'No tasks found. Select a project or create a new task.'
                }
                action={
                  projects.length > 0 ? (
                    <Button
                      variant="primary"
                      onClick={() => setShowCreateModal(true)}
                      leftIcon={<Plus className="w-4 h-4" />}
                    >
                      Create Task
                    </Button>
                  ) : null
                }
              />
            </CardContent>
          </Card>
        )}

        {/* Task detail modal */}
        {selectedTask && currentUser && (
          <TaskDetailModal
            task={selectedTask}
            currentUser={currentUser}
            onClose={() => setSelectedTask(null)}
            onTaskUpdated={handleTaskUpdated}
          />
        )}

        {/* Create Task Modal */}
        {showCreateModal && (
          <CreateTaskModal
            projectId={selectedProjectId || undefined}
            projects={projects.map((p) => ({ id: p.id, name: p.name }))}
            onClose={() => setShowCreateModal(false)}
            onSuccess={handleCreateTask}
          />
        )}

        {/* Assign Task Modal */}
        {assigningTaskId && selectedProject && (
          <AssignTaskModal
            taskId={assigningTaskId}
            teamId={selectedProject.teamId}
            currentAssignedToId={tasks.find((t) => t.id === assigningTaskId)?.assignedToId}
            onClose={() => setAssigningTaskId(null)}
            onSuccess={handleAssignSuccess}
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
