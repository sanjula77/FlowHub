'use client';

import { useState } from 'react';
import { updateTeamMemberRole } from '@/lib/api';

interface TeamMember {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  teamRole: 'OWNER' | 'MANAGER' | 'MEMBER';
}

interface TeamMembersProps {
  members: TeamMember[];
  currentUserId?: string;
  isAdmin: boolean;
  teamId: string;
  onRefresh: () => void;
}

const ROLE_COLORS: Record<string, string> = {
  OWNER: 'bg-purple-100 text-purple-700 border-purple-200',
  MANAGER: 'bg-blue-100 text-blue-700 border-blue-200',
  MEMBER: 'bg-gray-100 text-gray-700 border-gray-200',
};

export default function TeamMembers({
  members,
  currentUserId,
  isAdmin,
  teamId,
  onRefresh,
}: TeamMembersProps) {
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);

  const handleRoleChange = async (userId: string, newRole: 'OWNER' | 'MANAGER' | 'MEMBER') => {
    try {
      setUpdatingRole(userId);
      await updateTeamMemberRole(teamId, userId, newRole);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to update role');
    } finally {
      setUpdatingRole(null);
    }
  };

  const getDisplayName = (m: TeamMember) => {
    if (m.firstName && m.lastName) return `${m.firstName} ${m.lastName}`;
    if (m.firstName) return m.firstName;
    return m.email;
  };

  const getInitials = (m: TeamMember) => {
    if (m.firstName) return `${m.firstName.charAt(0)}${m.lastName?.charAt(0) ?? ''}`;
    return m.email.charAt(0).toUpperCase();
  };

  if (members.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <p className="text-gray-500 text-lg">No members found</p>
        <p className="text-gray-400 text-sm mt-2">Team members will appear here</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
        <p className="text-sm text-gray-500 mt-1">{members.length} member(s)</p>
      </div>

      <div className="divide-y divide-gray-200">
        {members.map((member) => {
          const isCurrentUser = member.userId === currentUserId;
          const isOwner = member.teamRole === 'OWNER';

          return (
            <div key={member.userId} className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {getInitials(member)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {getDisplayName(member)}
                      </p>
                      {isCurrentUser && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">{member.email}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {isAdmin && !isCurrentUser ? (
                      <select
                        value={member.teamRole}
                        disabled={updatingRole === member.userId || isOwner}
                        onChange={(e) => handleRoleChange(member.userId, e.target.value as 'OWNER' | 'MANAGER' | 'MEMBER')}
                        className="text-xs border border-gray-300 rounded-lg px-2 py-1 bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        title={isOwner ? "Cannot change the OWNER's role here" : "Change team role"}
                      >
                        <option value="OWNER">OWNER</option>
                        <option value="MANAGER">MANAGER</option>
                        <option value="MEMBER">MEMBER</option>
                      </select>
                    ) : (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${ROLE_COLORS[member.teamRole] ?? ROLE_COLORS.MEMBER}`}>
                        {member.teamRole}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
