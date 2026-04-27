'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMyProfile, getAdminStats } from '@/lib/api';
import { AdminStats } from '@/types/admin';
import { User } from '@/types/user';
import MainLayout from '@/components/layout/MainLayout';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import LoadingState from '@/components/ui/LoadingState';
import Alert from '@/components/ui/Alert';
import { Users, FolderKanban, CheckSquare, UsersRound, BarChart3, Activity } from 'lucide-react';

function StatCard({
  label,
  value,
  sub,
  icon,
  color,
}: {
  label: string;
  value: number;
  sub?: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
            {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
          </div>
          <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const userData = await getMyProfile();
      setCurrentUser(userData);
      if (userData.role !== 'ADMIN') { router.push('/dashboard'); return; }
      const statsData = await getAdminStats();
      setStats(statsData);
    } catch (err: any) {
      if (err.message?.includes('401')) { router.push('/login'); return; }
      setError(err.message || 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  const getUserDisplayName = (user: User | null) => {
    if (!user) return 'User';
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
    return user.email.split('@')[0];
  };

  if (loading) {
    return (
      <MainLayout userName={getUserDisplayName(currentUser)} userEmail={currentUser?.email} userRole="ADMIN">
        <LoadingState message="Loading analytics..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout userName={getUserDisplayName(currentUser)} userEmail={currentUser?.email} userRole="ADMIN">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-7 h-7 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-sm text-gray-500">Platform-wide statistics</p>
          </div>
        </div>

        {error && <Alert variant="error" onClose={() => setError('')}>{error}</Alert>}

        {stats && (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Total Users"
                value={stats.users.total}
                sub={`${stats.users.admins} admin${stats.users.admins !== 1 ? 's' : ''}`}
                icon={<Users className="w-6 h-6 text-blue-600" />}
                color="bg-blue-100"
              />
              <StatCard
                label="Teams"
                value={stats.teams.total}
                icon={<UsersRound className="w-6 h-6 text-purple-600" />}
                color="bg-purple-100"
              />
              <StatCard
                label="Projects"
                value={stats.projects.total}
                icon={<FolderKanban className="w-6 h-6 text-indigo-600" />}
                color="bg-indigo-100"
              />
              <StatCard
                label="Total Tasks"
                value={stats.tasks.total}
                icon={<CheckSquare className="w-6 h-6 text-green-600" />}
                color="bg-green-100"
              />
            </div>

            {/* Task status breakdown */}
            <Card>
              <CardHeader title="Task Status Breakdown" />
              <CardContent>
                <div className="space-y-3">
                  {[
                    { label: 'To Do', value: stats.tasks.todo, total: stats.tasks.total, color: 'bg-gray-400' },
                    { label: 'In Progress', value: stats.tasks.inProgress, total: stats.tasks.total, color: 'bg-blue-500' },
                    { label: 'Done', value: stats.tasks.done, total: stats.tasks.total, color: 'bg-green-500' },
                  ].map((row) => {
                    const pct = stats.tasks.total > 0 ? Math.round((row.value / stats.tasks.total) * 100) : 0;
                    return (
                      <div key={row.label}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="font-medium text-gray-700">{row.label}</span>
                          <span className="text-gray-500">{row.value} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className={`${row.color} h-2 rounded-full transition-all duration-500`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recent activity */}
            <Card>
              <CardHeader
                title="Recent Activity"
                subtitle="Last 10 audit log entries"
                action={<Activity className="w-5 h-5 text-gray-400" />}
              />
              <CardContent>
                {stats.recentActivity.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">No activity yet.</p>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {stats.recentActivity.map((entry) => (
                      <div key={entry.id} className="py-3 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                          <Activity className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-800">
                            <span className="font-medium">{entry.action}</span>
                            {' '}on{' '}
                            <span className="text-gray-600">{entry.entityType}</span>
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(entry.createdAt).toLocaleString('en-US', {
                              month: 'short', day: 'numeric',
                              hour: '2-digit', minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </MainLayout>
  );
}
