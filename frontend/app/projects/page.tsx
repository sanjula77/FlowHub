'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMyProfile, getMyTeams, getProjects, deleteProject } from '@/lib/api';
import ProjectList from '@/components/projects/ProjectList';
import CreateProjectModal from '@/components/projects/CreateProjectModal';
import MainLayout from '@/components/layout/MainLayout';
import { User } from '@/types/user';
import { Project } from '@/types/project';
import { FolderKanban, Plus, AlertCircle, Search } from 'lucide-react';

interface Team {
  id: string;
  name: string;
  slug: string;
  adminUserId?: string;
  userRole?: 'OWNER' | 'MANAGER' | 'MEMBER';
}

export default function ProjectsDashboard() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => { loadProjectsData(); }, []);

  const loadProjectsData = async () => {
    try {
      setLoading(true);
      setError('');
      const userData = await getMyProfile();
      setCurrentUser(userData);
      try {
        const teamsData = await getMyTeams();
        setTeams(Array.isArray(teamsData) ? teamsData : [teamsData]);
      } catch { /* no teams */ }
      const projectsData = await getProjects();
      setProjects(projectsData);
    } catch (err: any) {
      if (err.message?.includes('401') || err.message?.includes('Unauthorized')) { router.push('/login'); return; }
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = (newProject: Project) => {
    setProjects([newProject, ...projects]);
    setShowCreateModal(false);
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      setDeleting(projectId);
      await deleteProject(projectId);
      setProjects(projects.filter((p) => p.id !== projectId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete project');
    } finally {
      setDeleting(null);
    }
  };

  const getDisplayName = (user: User | null) => {
    if (!user) return 'User';
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
    if (user.firstName) return user.firstName;
    return user.email.split('@')[0];
  };

  const isAdmin = currentUser?.role === 'ADMIN';
  const privilegedTeam = teams.find(t => t.userRole === 'OWNER' || t.userRole === 'MANAGER') ?? teams[0] ?? null;
  const isTeamPrivileged = teams.some(t => t.userRole === 'OWNER' || t.userRole === 'MANAGER');
  const canCreateProject = isAdmin || isTeamPrivileged;

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description ?? '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <MainLayout userName={getDisplayName(currentUser)} userEmail={currentUser?.email} userRole={currentUser?.role as 'ADMIN' | 'USER'}>
        <div className="animate-pulse space-y-6">
          <div className="flex items-center justify-between">
            <div className="h-8 w-32 bg-gray-100 rounded-lg" />
            <div className="h-9 w-36 bg-gray-100 rounded-xl" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="h-44 bg-gray-100 rounded-2xl" />)}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout userName={getDisplayName(currentUser)} userEmail={currentUser?.email} userRole={currentUser?.role as 'ADMIN' | 'USER'}>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
            <p className="mt-1 text-sm text-gray-500">
              {isAdmin ? 'Manage all projects across teams' : isTeamPrivileged ? 'Manage projects in your team' : 'View projects in your team'}
            </p>
          </div>
          {canCreateProject && privilegedTeam && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              New project
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
            <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600 text-lg leading-none">×</button>
          </div>
        )}

        {/* Search */}
        {projects.length > 0 && (
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        )}

        {/* Project count */}
        {projects.length > 0 && (
          <p className="text-sm text-gray-500">
            {filtered.length === projects.length ? `${projects.length} project${projects.length !== 1 ? 's' : ''}` : `${filtered.length} of ${projects.length} projects`}
          </p>
        )}

        {/* Projects */}
        {filtered.length > 0 ? (
          <ProjectList
            projects={filtered}
            currentUser={currentUser}
            isAdmin={isAdmin}
            onDelete={canCreateProject ? handleDeleteProject : undefined}
            loading={false}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white border border-gray-100 rounded-2xl">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
              <FolderKanban className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-base font-semibold text-gray-700">
              {search ? 'No projects match your search' : 'No projects yet'}
            </h3>
            <p className="mt-2 text-sm text-gray-400 max-w-xs">
              {search ? 'Try a different search term' : isAdmin ? 'Get started by creating your first project.' : 'No projects have been created in your team yet.'}
            </p>
            {!search && canCreateProject && privilegedTeam && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-6 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create your first project
              </button>
            )}
          </div>
        )}

        {/* Modal */}
        {showCreateModal && privilegedTeam && (
          <CreateProjectModal
            teamId={privilegedTeam.id}
            onClose={() => setShowCreateModal(false)}
            onSuccess={handleCreateProject}
          />
        )}
      </div>
    </MainLayout>
  );
}
