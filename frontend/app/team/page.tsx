'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMyProfile, getMyTeams, getTeamMembers, getTeamLabels } from '@/lib/api';
import TeamHeader from '@/components/team/TeamHeader';
import TeamMembers from '@/components/team/TeamMembers';
import InviteUserModal from '@/components/team/InviteUserModal';
import LabelPicker from '@/components/labels/LabelPicker';
import MainLayout from '@/components/layout/MainLayout';
import { Label } from '@/types/label';
import { User } from '@/types/user';
import { Tag, Users, AlertCircle, ChevronDown } from 'lucide-react';

interface TeamMemberWithRole {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  teamRole: 'OWNER' | 'MANAGER' | 'MEMBER';
}

interface Team {
  id: string;
  name: string;
  slug: string;
  description?: string;
  adminUserId?: string;
  userRole?: 'OWNER' | 'MANAGER' | 'MEMBER';
  userCount?: number;
  createdAt: string;
  updatedAt: string;
}

type TabId = 'members' | 'labels';

export default function TeamDashboard() {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [members, setMembers] = useState<TeamMemberWithRole[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('members');

  useEffect(() => { loadTeamData(); }, []);
  useEffect(() => { if (selectedTeamId) loadTeamDetails(selectedTeamId); }, [selectedTeamId]);

  const loadTeamData = async () => {
    try {
      setLoading(true);
      setError('');
      const userData = await getMyProfile();
      setCurrentUser(userData);
      const teamsData = await getMyTeams();
      const teamsArray: Team[] = Array.isArray(teamsData) ? teamsData : [teamsData];
      setTeams(teamsArray);
      if (teamsArray.length > 0) setSelectedTeamId(teamsArray[0].id);
    } catch (err: any) {
      if (err.message?.includes('401') || err.message?.includes('Unauthorized')) { router.push('/login'); return; }
      setError(err.message || 'Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  const loadTeamDetails = async (teamId: string) => {
    try {
      const [labelsData, membersData] = await Promise.allSettled([getTeamLabels(teamId), getTeamMembers(teamId)]);
      if (labelsData.status === 'fulfilled') setLabels(labelsData.value);
      if (membersData.status === 'fulfilled') setMembers(membersData.value);
    } catch { /* ignore */ }
  };

  const handleInviteSuccess = async () => {
    setShowInviteModal(false);
    if (selectedTeamId) {
      try { setMembers(await getTeamMembers(selectedTeamId)); } catch { /* ignore */ }
    }
  };

  const getDisplayName = (user: User | null) => {
    if (!user) return 'User';
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
    if (user.firstName) return user.firstName;
    return user.email.split('@')[0];
  };

  const team = teams.find(t => t.id === selectedTeamId) ?? null;
  const isAdmin = currentUser?.role === 'ADMIN' || team?.userRole === 'OWNER' || team?.userRole === 'MANAGER';

  const tabs: { id: TabId; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'members', label: 'Members', icon: <Users className="w-4 h-4" />, count: members.length },
    { id: 'labels', label: 'Labels', icon: <Tag className="w-4 h-4" />, count: labels.length },
  ];

  if (loading) {
    return (
      <MainLayout userName={getDisplayName(currentUser)} userEmail={currentUser?.email} userRole={currentUser?.role as 'ADMIN' | 'USER'}>
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-gray-100 rounded-2xl" />
          <div className="h-64 bg-gray-100 rounded-2xl" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout userName={getDisplayName(currentUser)} userEmail={currentUser?.email} userRole={currentUser?.role as 'ADMIN' | 'USER'}>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Team</h1>
            <p className="mt-1 text-sm text-gray-500">Manage your team members and labels</p>
          </div>

          {/* Team selector */}
          {teams.length > 1 && (
            <div className="relative">
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 text-sm bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
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

        {team ? (
          <>
            <TeamHeader
              team={team}
              currentUser={currentUser}
              isAdmin={isAdmin}
              onInviteClick={() => setShowInviteModal(true)}
            />

            {/* Tabs */}
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
              <div className="flex border-b border-gray-100">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-600 text-blue-600 bg-blue-50/30'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                    {tab.count !== undefined && (
                      <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
                        activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeTab === 'members' && (
                  <TeamMembers
                    members={members}
                    currentUserId={currentUser?.id}
                    isAdmin={isAdmin}
                    teamId={selectedTeamId}
                    onRefresh={() => loadTeamDetails(selectedTeamId)}
                  />
                )}
                {activeTab === 'labels' && (
                  <div>
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-gray-900">Labels</h3>
                      <p className="text-xs text-gray-400 mt-0.5">Colored labels to categorize tasks in this team</p>
                    </div>
                    <LabelPicker
                      teamId={team.id}
                      labels={labels}
                      onLabelsChanged={setLabels}
                      canManage={isAdmin}
                    />
                  </div>
                )}
              </div>
            </div>
          </>
        ) : teams.length === 0 && !error ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white border border-gray-100 rounded-2xl">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-base font-semibold text-gray-700">No team found</h3>
            <p className="mt-2 text-sm text-gray-400">You are not a member of any team yet.</p>
          </div>
        ) : null}

        {/* Invite Modal */}
        {showInviteModal && team && (
          <InviteUserModal
            teamId={team.id}
            onClose={() => setShowInviteModal(false)}
            onSuccess={handleInviteSuccess}
          />
        )}
      </div>
    </MainLayout>
  );
}
