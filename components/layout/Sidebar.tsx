'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Users, Calendar, DollarSign, Settings,
  ClipboardList, X, Menu, LogOut, ChevronLeft,
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

const CathedralLogo = () => (
  <svg width="36" height="36" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <circle cx="28" cy="28" r="27" stroke="#C9A84C" strokeWidth="1.5"/>
    <g stroke="#9B2335" strokeWidth="1.2" fill="none">
      <rect x="18" y="30" width="20" height="16"/>
      <path d="M18 30 L28 20 L38 30"/>
      <rect x="24" y="36" width="8" height="10"/>
      <rect x="26" y="22" width="4" height="6"/>
      <line x1="28" y1="16" x2="28" y2="20"/>
      <line x1="26" y1="18" x2="30" y2="18"/>
      <rect x="14" y="34" width="6" height="12"/>
      <path d="M14 34 L17 28 L20 34"/>
      <rect x="36" y="34" width="6" height="12"/>
      <path d="M36 34 L39 28 L42 34"/>
    </g>
  </svg>
);

function NavContent({ collapsed, onClose }: { collapsed?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        padding: '1.25rem 1rem', borderBottom: '1px solid var(--border)',
      }}>
        <CathedralLogo />
        {!collapsed && (
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: 'var(--text)', fontSize: '0.9375rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              CLL Scheduler
            </p>
            <p style={{ fontSize: '0.6875rem', color: 'var(--text-light)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Carniceria La Lupita
            </p>
          </div>
        )}
        {onClose && (
          <button onClick={onClose} style={{ marginLeft: 'auto', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/manager' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.625rem 0.75rem', borderRadius: '8px',
                fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none',
                transition: 'all 0.15s',
                background: active ? 'var(--primary-light)' : 'transparent',
                color: active ? 'var(--primary)' : 'var(--text-muted)',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--surface-alt)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
            >
              <Icon size={17} style={{ flexShrink: 0 }} />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}

        {!collapsed && (
          <div style={{ paddingTop: '0.5rem', marginTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
            <Link
              href="/"
              onClick={onClose}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.625rem 0.75rem', borderRadius: '8px',
                fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none',
                color: 'var(--text-muted)', transition: 'all 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-alt)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <LayoutDashboard size={17} style={{ flexShrink: 0 }} />
              <span>HQ Dashboard</span>
            </Link>
          </div>
        )}
      </nav>

      {/* User / Sign out */}
      {!collapsed && (
        <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.625rem 0.75rem', borderRadius: '8px',
            background: 'var(--surface-alt)',
          }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
            }}>
              {session?.user?.email?.[0]?.toUpperCase() || 'A'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {session?.user?.email || 'admin@store.com'}
              </p>
              <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                {(session?.user as any)?.role || 'admin'}
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              style={{ color: 'var(--text-light)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexShrink: 0, padding: '0.25rem' }}
              title="Sign out"
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--danger)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-light)')}
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
      <aside style={{
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        minHeight: '100vh',
        position: 'relative',
        transition: 'width 0.3s',
        width: collapsed ? '4rem' : '260px',
        flexShrink: 0,
        display: 'none',
      }} className="md:flex flex-col">
        <NavContent collapsed={collapsed} />
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            position: 'absolute', right: '-12px', top: '5rem',
            width: '24px', height: '24px',
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-muted)', cursor: 'pointer', zIndex: 10,
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
        >
          <ChevronLeft size={12} className={cn('transition-transform', collapsed && 'rotate-180')} />
        </button>
      </aside>

      {/* Mobile hamburger */}
      <button
        style={{
          position: 'fixed', top: '1rem', left: '1rem', zIndex: 50,
          width: '40px', height: '40px',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-muted)', cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}
        className="md:hidden"
        onClick={() => setMobileOpen(true)}
      >
        <Menu size={18} />
      </button>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="md:hidden" style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }}>
          <div
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
            onClick={() => setMobileOpen(false)}
          />
          <aside style={{
            position: 'relative', zIndex: 10, width: '280px',
            background: 'var(--surface)', borderRight: '1px solid var(--border)', height: '100%',
          }}>
            <NavContent onClose={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
