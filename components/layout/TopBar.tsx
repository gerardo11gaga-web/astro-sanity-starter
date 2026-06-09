'use client';
import { useSession } from 'next-auth/react';

export function TopBar({ title }: { title?: string }) {
  const { data: session } = useSession();

  return (
    <header style={{
      height: '3.5rem',
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.5rem',
      paddingLeft: 'calc(1.5rem)',
      flexShrink: 0,
    }} className="md:pl-6 pl-16">
      <h1 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: '1rem',
        fontWeight: 600,
        color: 'var(--text)',
      }}>{title || 'Manager Portal'}</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        <span className="hidden sm:block" style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {session?.user?.email}
        </span>
      </div>
    </header>
  );
}
