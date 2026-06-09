'use client';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { ReactNode } from 'react';

export function ManagerLayout({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <div className="flex min-h-screen" style={{ background: '#0f172a' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar title={title} />
        <main className="flex-1 p-6 overflow-auto md:pt-6 pt-16">
          {children}
        </main>
      </div>
    </div>
  );
}
