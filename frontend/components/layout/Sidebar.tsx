'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  FolderKanban,
  CheckSquare,
  Users,
  Settings,
  ShieldCheck,
  BarChart3,
  UsersRound,
  ChevronDown,
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface SidebarProps {
  userRole?: 'ADMIN' | 'USER';
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: ('ADMIN' | 'USER')[];
  children?: { label: string; href: string; icon: React.ComponentType<{ className?: string }> }[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: Home, roles: ['ADMIN', 'USER'] },
  { label: 'Projects', href: '/projects', icon: FolderKanban, roles: ['ADMIN', 'USER'] },
  { label: 'Tasks', href: '/tasks', icon: CheckSquare, roles: ['ADMIN', 'USER'] },
  { label: 'Team', href: '/team', icon: Users, roles: ['ADMIN', 'USER'] },
  {
    label: 'Admin',
    href: '/admin',
    icon: ShieldCheck,
    roles: ['ADMIN'],
    children: [
      { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
      { label: 'Users', href: '/admin/users', icon: UsersRound },
      { label: 'Settings', href: '/admin/settings', icon: Settings },
    ],
  },
];

export default function Sidebar({ userRole = 'USER' }: SidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const filtered = navItems.filter(item => !item.roles || item.roles.includes(userRole));

  const isActive = (href: string) => {
    if (!mounted) return false;
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname?.startsWith(href);
  };

  return (
    <>
      {/* Mobile toggle */}
      {mounted && (
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="lg:hidden fixed top-4 left-4 z-50 w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileOpen ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-100
        transform transition-transform duration-300 ease-in-out z-40
        ${mounted && isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="flex flex-col h-full">

          {/* Logo */}
          <div className="flex items-center gap-3 px-5 h-16 border-b border-gray-100">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-base">F</span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900 leading-tight">FlowHub</h1>
              <p className="text-xs text-gray-400 leading-tight">Project Management</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
            {filtered.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <div key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    aria-current={active ? 'page' : undefined}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all
                      ${active
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${active ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className="flex-1">{item.label}</span>
                    {item.children && (
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${active ? 'rotate-180 text-blue-400' : 'text-gray-300'}`} />
                    )}
                    {active && !item.children && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    )}
                  </Link>

                  {/* Sub-links */}
                  {item.children && active && (
                    <div className="ml-4 mt-0.5 pl-4 border-l border-gray-100 space-y-0.5">
                      {item.children.map((child) => {
                        const ChildIcon = child.icon;
                        const childActive = mounted && pathname === child.href;
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setIsMobileOpen(false)}
                            className={`
                              flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all
                              ${childActive
                                ? 'bg-blue-50 text-blue-700 font-medium'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                              }
                            `}
                          >
                            <ChildIcon className={`w-3.5 h-3.5 flex-shrink-0 ${childActive ? 'text-blue-500' : 'text-gray-400'}`} />
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Bottom — settings */}
          <div className="px-3 py-3 border-t border-gray-100">
            <Link
              href="/settings"
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                pathname === '/settings'
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Settings className={`w-[18px] h-[18px] ${pathname === '/settings' ? 'text-blue-600' : 'text-gray-400'}`} />
              Settings
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mounted && isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
