'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMyProfile, getMyTeams, getTeamMembers, getTeamLabels } from '@/lib/api';
import TeamHeader from '@/components/team/TeamHeader';
import TeamMembers from '@/components/team/TeamMembers';
import InviteUserModal from '@/components/team/InviteUserModal';
import LabelPicker from '@/components/labels/LabelPicker';
import MainLayout from '@/components/layout/MainLayout';
import LoadingState from '@/components/ui/LoadingState';
import Alert from '@/components/ui/Alert';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import { Label } from '@/types/label';
import { User } from '@/types/user';

interface TeamMemberWithRole {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  teamRole: 'OWNER' | 'MANAGER' | 'MEMBER';
}
import { Tag, Users } from 'lucide-react';

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

  useEffect(() => {
    loadTeamData();
  }, []);

  useEffect(() => {
    if (selectedTeamId) {
      loadTeamDetails(selectedTeamId);
    }
  }, [selectedTeamId]);

  const loadTeamData = async () => {
    try {
      setLoading(true);
      setError('');
      const userData = await getMyProfile();
      setCurrentUser(userData);

      const teamsData = await getMyTeams();
      const teamsArray: Team[] = Array.isArray(teamsData) ? teamsData : [teamsData];
      setTeams(teamsArray);

      if (teamsArray.length > 0) {
        setSelectedTeamId(teamsArray[0].id);
      }
    } catch (err: any) {
      if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        router.push('/login');
        return;
      }
      setError(err.message || 'Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  const loadTeamDetails = async (teamId: string) => {
    try {
      const [labelsData, membersData] = await Promise.allSettled([
        getTeamLabels(teamId),
        getTeamMembers(teamId),
      ]);
      if (labelsData.status === 'fulfilled') setLabels(labelsData.value);
      if (membersData.status === 'fulfilled') setMembers(membersData.value);
    } catch {
      // silently ignore
    }
  };

  const handleInviteSuccess = async () => {
    setShowInviteModal(false);
    if (selectedTeamId) {
      try {
        const membersData = await getTeamMembers(selectedTeamId);
        setMembers(membersData);
      } catch {
        // ignore
      }
    }
  };

  const getUserDisplayName = (user: User | null): string => {
    if (!user) return 'User';
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
    if (user.firstName) return user.firstName;
    return user.email.split('@')[0];
  };

  const team = teams.find((t) => t.id === selectedTeamId) ?? null;
  const isAdmin = currentUser?.role === 'ADMIN' || team?.userRole === 'OWNER' || team?.userRole === 'MANAGER';

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'members', label: 'Members', icon: <Users className="w-4 h-4" /> },
    { id: 'labels', label: 'Labels', icon: <Tag className="w-4 h-4" /> },
  ];

  if (loading) {
    return (
      <MainLayout
        userName={getUserDisplayName(currentUser)}
        userEmail={currentUser?.email}
        userRole={currentUser?.role as 'ADMIN' | 'USER'}
      >
        <LoadingState message="Loading team data..." />
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
        {error && (
          <Alert variant="error" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Team selector (if multiple teams) */}
        {teams.length > 1 && (
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Team:</label>
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        )}

        {team && (
          <>
            <TeamHeader
              team={team}
              currentUser={currentUser}
              isAdmin={isAdmin}
              onInviteClick={() => setShowInviteModal(true)}
            />

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex gap-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

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
              <Card>
                <CardHeader
                  title="Labels"
                  subtitle="Colored labels to categorize tasks in this team"
                />
                <CardContent>
                  <LabelPicker
                    teamId={team.id}
                    labels={labels}
                    onLabelsChanged={setLabels}
                    canManage={isAdmin}
                  />
                </CardContent>
              </Card>
            )}
          </>
        )}

        {teams.length === 0 && !error && (
          <Alert variant="error">You are not a member of any team.</Alert>
        )}

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
