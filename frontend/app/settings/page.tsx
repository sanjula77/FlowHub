'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMyProfile, updateMyProfile } from '@/lib/api';
import MainLayout from '@/components/layout/MainLayout';
import LoadingState from '@/components/ui/LoadingState';
import Alert from '@/components/ui/Alert';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { User } from '@/types/user';
import { Mail, Calendar, ShieldCheck } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getMyProfile();
      setUser(data);
      setFirstName(data.firstName ?? '');
      setLastName(data.lastName ?? '');
      setEmail(data.email ?? '');
    } catch (err: any) {
      if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        router.push('/login');
        return;
      }
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!firstName.trim()) {
      setError('First name is required');
      return;
    }

    setSaving(true);
    try {
      const updated = await updateMyProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim() || undefined,
        email: email.trim() !== user?.email ? email.trim() : undefined,
      });
      setUser(updated);
      setSuccess('Profile updated successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const isDirty =
    firstName !== (user?.firstName ?? '') ||
    lastName !== (user?.lastName ?? '') ||
    email !== (user?.email ?? '');

  const getUserDisplayName = () => {
    if (!user) return 'User';
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
    if (user.firstName) return user.firstName;
    return user.email.split('@')[0];
  };

  const getInitials = () => {
    if (user?.firstName) {
      return `${user.firstName.charAt(0)}${user.lastName?.charAt(0) ?? ''}`.toUpperCase();
    }
    return user?.email.charAt(0).toUpperCase() ?? 'U';
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <MainLayout
        userName={getUserDisplayName()}
        userEmail={user?.email}
        userRole={user?.role as 'ADMIN' | 'USER'}
      >
        <LoadingState message="Loading settings..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout
      userName={getUserDisplayName()}
      userEmail={user?.email}
      userRole={user?.role as 'ADMIN' | 'USER'}
    >
      <div className="max-w-2xl space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your account profile and preferences</p>
        </div>

        {success && (
          <Alert variant="success" onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}
        {error && (
          <Alert variant="error" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Avatar + account summary */}
        <Card>
          <CardContent>
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                {getInitials()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-lg font-semibold text-gray-900 truncate">{getUserDisplayName()}</p>
                <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge variant={user?.role === 'ADMIN' ? 'warning' : 'primary'} size="sm">
                    {user?.role === 'ADMIN' ? 'Admin' : 'User'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit profile */}
        <Card>
          <CardHeader
            title="Profile"
            subtitle="Update your name and email address"
          />
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    maxLength={100}
                    required
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    maxLength={100}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Last name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    Email address
                  </span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="you@example.com"
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={saving || !isDirty}
                >
                  {saving ? 'Saving...' : 'Save changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Account details (read-only) */}
        <Card>
          <CardHeader
            title="Account details"
            subtitle="Information about your account"
          />
          <CardContent>
            <dl className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Platform role
                </dt>
                <dd>
                  <Badge variant={user?.role === 'ADMIN' ? 'warning' : 'primary'}>
                    {user?.role === 'ADMIN' ? 'Administrator' : 'User'}
                  </Badge>
                </dd>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Member since
                </dt>
                <dd className="text-sm text-gray-700">{formatDate(user?.createdAt)}</dd>
              </div>

              {user?.lastLoginAt && (
                <div className="flex items-center justify-between py-2">
                  <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Last login
                  </dt>
                  <dd className="text-sm text-gray-700">{formatDate(user.lastLoginAt)}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
