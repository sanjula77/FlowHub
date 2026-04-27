'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMyProfile, getAllUsers, updateUserRole, removeUser } from '@/lib/api';
import { User } from '@/types/user';
import MainLayout from '@/components/layout/MainLayout';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import LoadingState from '@/components/ui/LoadingState';
import Alert from '@/components/ui/Alert';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Users, Trash2, ShieldCheck, ShieldOff } from 'lucide-react';

export default function AdminUsersPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const userData = await getMyProfile();
      setCurrentUser(userData);
      if (userData.role !== 'ADMIN') { router.push('/dashboard'); return; }
      const usersData = await getAllUsers();
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (err: any) {
      if (err.message?.includes('401')) { router.push('/login'); return; }
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRole = async (user: User) => {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!confirm(`Change ${user.email}'s role to ${newRole}?`)) return;
    setUpdatingId(user.id);
    try {
      const updated = await updateUserRole(user.id, newRole as 'USER' | 'ADMIN');
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, role: updated.role } : u));
    } catch (err: any) {
      setError(err.message || 'Failed to update role');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (user: User) => {
    if (!confirm(`Remove user ${user.email}? This cannot be undone.`)) return;
    setUpdatingId(user.id);
    try {
      await removeUser(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (err: any) {
      setError(err.message || 'Failed to remove user');
    } finally {
      setUpdatingId(null);
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
        <LoadingState message="Loading users..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout userName={getUserDisplayName(currentUser)} userEmail={currentUser?.email} userRole="ADMIN">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Users className="w-7 h-7 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-sm text-gray-500">{users.length} registered users</p>
          </div>
        </div>

        {error && <Alert variant="error" onClose={() => setError('')}>{error}</Alert>}

        <Card>
          <CardHeader title="All Users" />
          <CardContent>
            {users.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No users found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-2 font-medium text-gray-500">Name</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-500">Email</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-500">Role</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-500">Joined</th>
                      <th className="text-right py-3 px-2 font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-2 font-medium text-gray-900">
                          {getUserDisplayName(user)}
                        </td>
                        <td className="py-3 px-2 text-gray-600">{user.email}</td>
                        <td className="py-3 px-2">
                          <Badge variant={user.role === 'ADMIN' ? 'error' : 'gray'} size="sm">
                            {user.role}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-gray-400">
                          {new Date(user.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'short', day: 'numeric',
                          })}
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center justify-end gap-2">
                            {user.id !== currentUser?.id && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={updatingId === user.id}
                                  onClick={() => handleToggleRole(user)}
                                  leftIcon={
                                    user.role === 'ADMIN'
                                      ? <ShieldOff className="w-3.5 h-3.5" />
                                      : <ShieldCheck className="w-3.5 h-3.5" />
                                  }
                                >
                                  {user.role === 'ADMIN' ? 'Demote' : 'Promote'}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={updatingId === user.id}
                                  onClick={() => handleRemove(user)}
                                  leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  Remove
                                </Button>
                              </>
                            )}
                            {user.id === currentUser?.id && (
                              <span className="text-xs text-gray-400 italic">You</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
