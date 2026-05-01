'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMyProfile, updateMyProfile } from '@/lib/api';
import MainLayout from '@/components/layout/MainLayout';
import { User } from '@/types/user';
import { Mail, Calendar, ShieldCheck, Check, AlertCircle } from 'lucide-react';

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

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getMyProfile();
      setUser(data);
      setFirstName(data.firstName ?? '');
      setLastName(data.lastName ?? '');
      setEmail(data.email ?? '');
    } catch (err: any) {
      if (err.message?.includes('401') || err.message?.includes('Unauthorized')) { router.push('/login'); return; }
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!firstName.trim()) { setError('First name is required'); return; }
    setSaving(true);
    try {
      const updated = await updateMyProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim() || undefined,
        email: email.trim() !== user?.email ? email.trim() : undefined,
      });
      setUser(updated);
      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const isDirty = firstName !== (user?.firstName ?? '') || lastName !== (user?.lastName ?? '') || email !== (user?.email ?? '');

  const getDisplayName = () => {
    if (!user) return 'User';
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
    if (user.firstName) return user.firstName;
    return user.email.split('@')[0];
  };

  const getInitials = () => {
    if (user?.firstName) return `${user.firstName[0]}${user.lastName?.[0] ?? ''}`.toUpperCase();
    return user?.email[0].toUpperCase() ?? 'U';
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const inputClass = "w-full px-4 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all";

  if (loading) {
    return (
      <MainLayout userName={getDisplayName()} userEmail={user?.email} userRole={user?.role as 'ADMIN' | 'USER'}>
        <div className="max-w-2xl animate-pulse space-y-6">
          <div className="h-8 w-32 bg-gray-100 rounded-lg" />
          <div className="h-24 bg-gray-100 rounded-2xl" />
          <div className="h-64 bg-gray-100 rounded-2xl" />
          <div className="h-40 bg-gray-100 rounded-2xl" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout userName={getDisplayName()} userEmail={user?.email} userRole={user?.role as 'ADMIN' | 'USER'}>
      <div className="max-w-2xl space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your account and preferences</p>
        </div>

        {/* Alerts */}
        {success && (
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-xl">
            <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
            <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600 text-lg leading-none">×</button>
          </div>
        )}

        {/* Profile card */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
              {getInitials()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold text-gray-900">{getDisplayName()}</p>
              <p className="text-sm text-gray-400 truncate">{user?.email}</p>
              <span className={`inline-flex items-center mt-1.5 px-2 py-0.5 text-xs font-medium rounded-full ${
                user?.role === 'ADMIN' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {user?.role === 'ADMIN' ? 'Administrator' : 'User'}
              </span>
            </div>
          </div>
        </div>

        {/* Edit profile */}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-gray-900">Profile</h2>
            <p className="text-xs text-gray-400 mt-0.5">Update your name and email address</p>
          </div>
          <form onSubmit={handleSave} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1.5">
                  First name <span className="text-red-500">*</span>
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  maxLength={100}
                  required
                  placeholder="First name"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1.5">Last name</label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  maxLength={100}
                  placeholder="Last name"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  Email address
                </span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className={inputClass}
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving || !isDirty}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving...
                  </>
                ) : 'Save changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Account details */}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-gray-900">Account details</h2>
            <p className="text-xs text-gray-400 mt-0.5">Read-only information about your account</p>
          </div>
          <div className="divide-y divide-gray-50">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <ShieldCheck className="w-4 h-4" />
                Platform role
              </div>
              <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                user?.role === 'ADMIN' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {user?.role === 'ADMIN' ? 'Administrator' : 'User'}
              </span>
            </div>
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                Member since
              </div>
              <span className="text-sm text-gray-700">{formatDate(user?.createdAt)}</span>
            </div>
            {user?.lastLoginAt && (
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  Last login
                </div>
                <span className="text-sm text-gray-700">{formatDate(user.lastLoginAt)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
