'use client';
import { signOut, useSession } from 'next-auth/react';
import { Bell, LogOut, User } from 'lucide-react';

export function TopBar({ title }: { title?: string }) {
  const { data: session } = useSession();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
      <h1 className="text-lg font-semibold text-gray-900">{title || 'Manager Portal'}</h1>
      <div className="flex items-center gap-3">
        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors relative">
          <Bell size={18} />
        </button>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
            <User size={14} className="text-indigo-600" />
          </div>
          <span className="hidden sm:block font-medium">{session?.user?.email}</span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
        >
          <LogOut size={16} />
          <span className="hidden sm:block">Sign out</span>
        </button>
      </div>
    </header>
  );
}
