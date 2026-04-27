'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMyProfile } from '@/lib/api';
import { User } from '@/types/user';
import MainLayout from '@/components/layout/MainLayout';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import LoadingState from '@/components/ui/LoadingState';
import { Settings } from 'lucide-react';

export default function AdminSettingsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyProfile()
      .then((userData) => {
        setCurrentUser(userData);
        if (userData.role !== 'ADMIN') router.push('/dashboard');
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, []);

  const getUserDisplayName = (user: User | null) => {
    if (!user) return 'User';
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
    return user.email.split('@')[0];
  };

  if (loading) {
    return (
      <MainLayout userName={getUserDisplayName(currentUser)} userEmail={currentUser?.email} userRole="ADMIN">
        <LoadingState message="Loading..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout userName={getUserDisplayName(currentUser)} userEmail={currentUser?.email} userRole="ADMIN">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Settings className="w-7 h-7 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
            <p className="text-sm text-gray-500">General configuration</p>
          </div>
        </div>

        <Card>
          <CardHeader title="Platform Info" subtitle="Read-only runtime information" />
          <CardContent>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Platform name', value: 'FlowHub' },
                { label: 'Backend URL', value: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001' },
                { label: 'Auth method', value: 'JWT (HTTP-only cookies)' },
                { label: 'Database', value: 'PostgreSQL (TypeORM)' },
              ].map(({ label, value }) => (
                <div key={label} className="p-4 bg-gray-50 rounded-lg">
                  <dt className="text-xs font-medium text-gray-500 mb-1">{label}</dt>
                  <dd className="text-sm text-gray-900 font-mono">{value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Feature Flags" subtitle="What's enabled on this instance" />
          <CardContent>
            <div className="space-y-2">
              {[
                { label: 'Kanban board', enabled: true },
                { label: 'Task comments', enabled: true },
                { label: 'Task labels', enabled: true },
                { label: 'Team invitations', enabled: true },
                { label: 'Multi-team support', enabled: true },
                { label: 'Audit logging', enabled: true },
              ].map(({ label, enabled }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-700">{label}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
