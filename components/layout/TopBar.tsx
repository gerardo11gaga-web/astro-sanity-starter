'use client';
import { useSession } from 'next-auth/react';

export function TopBar({ title }: { title?: string }) {
  const { data: session } = useSession();

  return (
    <header className="h-14 bg-[#1e293b] border-b border-[#334155] flex items-center justify-between px-6 flex-shrink-0 md:pl-6 pl-16">
      <h1 className="text-base font-semibold text-[#f1f5f9]">{title || 'Manager Portal'}</h1>
      <div className="flex items-center gap-2 text-sm text-[#94a3b8]">
        <span className="hidden sm:block truncate max-w-[200px]">{session?.user?.email}</span>
      </div>
    </header>
  );
}
