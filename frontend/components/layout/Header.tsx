'use client';

import { Bell, Search, Settings, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { logout } from '@/lib/auth';

interface HeaderProps {
  userName?: string;
  userEmail?: string;
  userRole?: 'ADMIN' | 'USER';
}

export default function Header({ userName = 'User', userEmail, userRole = 'USER' }: HeaderProps) {
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleSignOut = async () => {
    await logout();
    router.push('/login');
  };

  const initials = mounted && userName
    ? userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">

        {/* Search */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects, tasks..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-100 rounded-xl placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 ml-auto">

          {/* Notification bell */}
          <button
            className="relative w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full" />
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
              aria-label="User menu"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-semibold">{initials}</span>
              </div>
              {mounted && (
                <div className="hidden md:block text-left">
                  <p className="text-xs font-semibold text-gray-800 leading-tight">{userName}</p>
                  {userRole === 'ADMIN' && (
                    <p className="text-xs text-blue-600 leading-tight">Admin</p>
                  )}
                </div>
              )}
            </button>

            {/* Dropdown */}
            {mounted && showUserMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} aria-hidden="true" />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-lg border border-gray-100 z-50 overflow-hidden">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-semibold">{initials}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
                        {userEmail && <p className="text-xs text-gray-400 truncate">{userEmail}</p>}
                      </div>
                    </div>
                    {userRole === 'ADMIN' && (
                      <span className="mt-2 inline-flex px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                        Administrator
                      </span>
                    )}
                  </div>

                  {/* Menu items */}
                  <div className="p-1.5">
                    <Link
                      href="/settings"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      <Settings className="w-4 h-4 text-gray-400" />
                      Settings
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
