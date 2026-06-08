'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Users, Calendar, Clock, DollarSign, Settings,
  ChevronLeft, Store, Bell, ClipboardList
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { href: '/manager', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/manager/schedule', label: 'Schedule', icon: Calendar },
  { href: '/manager/employees', label: 'Employees', icon: Users },
  { href: '/manager/pto-queue', label: 'PTO Queue', icon: ClipboardList },
  { href: '/manager/payroll', label: 'Payroll', icon: DollarSign },
  { href: '/manager/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={cn(
      'flex flex-col bg-gray-900 text-white transition-all duration-300 min-h-screen',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-700">
        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <Store size={18} />
        </div>
        {!collapsed && (
          <span className="font-bold text-lg tracking-tight truncate">Store Scheduler</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/manager' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Back to HQ */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-700">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <LayoutDashboard size={14} />
            Back to HQ
          </Link>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="p-4 text-gray-400 hover:text-white transition-colors border-t border-gray-700 flex items-center justify-center"
      >
        <ChevronLeft size={18} className={cn('transition-transform', collapsed && 'rotate-180')} />
      </button>
    </aside>
  );
}
