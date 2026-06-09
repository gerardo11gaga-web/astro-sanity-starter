'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Users, Calendar, DollarSign, Settings,
  Store, ClipboardList, X, Menu, LogOut, ChevronLeft,
} from 'lucide-react';
import { useState } from 'react';
import { signOut, useSession } from 'next-auth/react';

const navItems = [
  { href: '/manager', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/manager/schedule', label: 'Schedule', icon: Calendar },
  { href: '/manager/employees', label: 'Employees', icon: Users },
  { href: '/manager/pto-queue', label: 'PTO Queue', icon: ClipboardList },
  { href: '/manager/payroll', label: 'Payroll', icon: DollarSign },
  { href: '/manager/settings', label: 'Settings', icon: Settings },
];

function NavContent({ collapsed, onClose }: { collapsed?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-[#334155]">
        <div className="w-9 h-9 bg-[#6366f1] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-900/40 text-lg">
          🏪
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[#f1f5f9] text-sm tracking-tight truncate">CLL Carniceria</p>
            <p className="text-[10px] text-[#94a3b8] truncate">Workforce Management</p>
          </div>
        )}
        {onClose && (
          <button onClick={onClose} className="ml-auto text-[#94a3b8] hover:text-[#f1f5f9] p-1">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/manager' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-[#6366f1] text-white shadow-lg shadow-indigo-900/30'
                  : 'text-[#94a3b8] hover:bg-[#334155] hover:text-[#f1f5f9]'
              )}
            >
              <Icon size={17} className="flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}

        {!collapsed && (
          <div className="pt-2 mt-2 border-t border-[#334155]">
            <Link
              href="/"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#94a3b8] hover:bg-[#334155] hover:text-[#f1f5f9] transition-all duration-150"
            >
              <LayoutDashboard size={17} className="flex-shrink-0" />
              <span>HQ Dashboard</span>
            </Link>
          </div>
        )}
      </nav>

      {/* User / Sign out */}
      {!collapsed && (
        <div className="p-3 border-t border-[#334155]">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[#334155]/50">
            <div className="w-8 h-8 rounded-full bg-[#6366f1] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {session?.user?.email?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[#f1f5f9] truncate">{session?.user?.email || 'admin@store.com'}</p>
              <p className="text-[10px] text-[#94a3b8] capitalize">{(session?.user as any)?.role || 'admin'}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="text-[#94a3b8] hover:text-[#ef4444] transition-colors p-1 flex-shrink-0"
              title="Sign out"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={cn(
        'hidden md:flex flex-col bg-[#1e293b] border-r border-[#334155] transition-all duration-300 min-h-screen relative',
        collapsed ? 'w-16' : 'w-[260px]'
      )}>
        <NavContent collapsed={collapsed} />
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-[#334155] border border-[#475569] rounded-full flex items-center justify-center text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#6366f1] transition-all z-10"
        >
          <ChevronLeft size={12} className={cn('transition-transform', collapsed && 'rotate-180')} />
        </button>
      </aside>

      {/* Mobile hamburger */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-[#1e293b] border border-[#334155] rounded-xl flex items-center justify-center text-[#94a3b8] hover:text-[#f1f5f9] shadow-lg"
        onClick={() => setMobileOpen(true)}
      >
        <Menu size={18} />
      </button>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-10 w-[280px] bg-[#1e293b] border-r border-[#334155] h-full">
            <NavContent onClose={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
