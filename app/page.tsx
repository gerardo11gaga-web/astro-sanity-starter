'use client';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, LogOut, Store, X, Check } from 'lucide-react';

interface Bookmark {
  id: number;
  title: string;
  url: string;
  icon: string;
  color: string;
  sort_order: number;
}

const COLORS = [
  '#6366f1', '#22c55e', '#f59e0b', '#ec4899', '#3b82f6',
  '#ef4444', '#8b5cf6', '#64748b', '#06b6d4', '#f97316',
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function HQPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editBookmark, setEditBookmark] = useState<Bookmark | null>(null);
  const [form, setForm] = useState({ title: '', url: '', icon: '🔗', color: '#6366f1' });
  const [time, setTime] = useState(new Date());
  const [pendingPTO, setPendingPTO] = useState(0);
  const [scheduleStatus, setScheduleStatus] = useState<string>('none');
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    fetchBookmarks();
    fetchStats();
  }, []);

  async function fetchBookmarks() {
    const res = await fetch('/api/bookmarks');
    if (res.ok) setBookmarks(await res.json());
  }

  async function fetchStats() {
    try {
      const [ptoRes, schedRes] = await Promise.all([
        fetch('/api/pto?status=pending'),
        fetch('/api/schedule'),
      ]);
      if (ptoRes.ok) {
        const pto = await ptoRes.json();
        setPendingPTO(pto.length);
      }
      if (schedRes.ok) {
        const scheds = await schedRes.json();
        if (scheds.length > 0) setScheduleStatus(scheds[0].status);
      }
    } catch {}
  }

  async function handleSaveBookmark() {
    if (!form.title || !form.url) return;
    if (editBookmark) {
      await fetch('/api/bookmarks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editBookmark, ...form }),
      });
    } else {
      await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    }
    setShowAddModal(false);
    setEditBookmark(null);
    setForm({ title: '', url: '', icon: '🔗', color: '#6366f1' });
    fetchBookmarks();
  }

  async function handleDelete(id: number) {
    await fetch(`/api/bookmarks/${id}`, { method: 'DELETE' });
    fetchBookmarks();
  }

  function openEdit(b: Bookmark) {
    setEditBookmark(b);
    setForm({ title: b.title, url: b.url, icon: b.icon, color: b.color });
    setShowAddModal(true);
  }

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-500 rounded-xl flex items-center justify-center">
            <Store size={20} className="text-white" />
          </div>
          <span className="text-white font-bold text-lg">Store Scheduler</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-sm hidden sm:block">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10"
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">
            {getGreeting()}, {session?.user?.email?.split('@')[0] || 'there'} 👋
          </h1>
          <p className="text-slate-400">
            {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/10">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-1">Pending PTO</p>
            <p className="text-2xl font-bold text-white">{pendingPTO}</p>
            {pendingPTO > 0 && (
              <Link href="/manager/pto-queue" className="text-yellow-400 text-xs hover:underline">Review now →</Link>
            )}
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/10">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-1">Schedule</p>
            <p className="text-2xl font-bold text-white capitalize">{scheduleStatus === 'none' ? '—' : scheduleStatus}</p>
            <Link href="/manager/schedule" className="text-indigo-400 text-xs hover:underline">Manage →</Link>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/10 col-span-2 sm:col-span-1">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-1">Quick Access</p>
            <p className="text-sm text-white mt-1">Your bookmarks below</p>
          </div>
        </div>

        {/* Bookmarks Grid */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-white font-semibold text-lg">Quick Access</h2>
          <button
            onClick={() => {
              setEditBookmark(null);
              setForm({ title: '', url: '', icon: '🔗', color: '#6366f1' });
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm px-4 py-2 rounded-lg transition-colors border border-white/10"
          >
            <Plus size={15} />
            Add Tile
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {bookmarks.map(b => (
            <div
              key={b.id}
              className="relative group"
              onMouseEnter={() => setHoveredId(b.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <Link href={b.url}>
                <div
                  className="rounded-2xl p-5 flex flex-col items-center gap-3 cursor-pointer hover:scale-105 transition-transform shadow-lg border border-white/10"
                  style={{ backgroundColor: b.color + 'dd' }}
                >
                  <span className="text-3xl">{b.icon}</span>
                  <span className="text-white font-semibold text-sm text-center leading-tight">{b.title}</span>
                </div>
              </Link>
              {hoveredId === b.id && (
                <div className="absolute top-2 right-2 flex gap-1">
                  <button
                    onClick={e => { e.preventDefault(); openEdit(b); }}
                    className="w-6 h-6 bg-white/90 rounded-md flex items-center justify-center text-gray-700 hover:bg-white shadow"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    onClick={e => { e.preventDefault(); handleDelete(b.id); }}
                    className="w-6 h-6 bg-white/90 rounded-md flex items-center justify-center text-red-600 hover:bg-white shadow"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-900 text-lg">{editBookmark ? 'Edit Tile' : 'Add Tile'}</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Schedule Manager"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                <input
                  value={form.url}
                  onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                  placeholder="/manager/schedule"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon (emoji)</label>
                <input
                  value={form.icon}
                  onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                  placeholder="📅"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setForm(f => ({ ...f, color: c }))}
                      className="w-8 h-8 rounded-full transition-transform hover:scale-110 flex items-center justify-center"
                      style={{ backgroundColor: c }}
                    >
                      {form.color === c && <Check size={14} className="text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBookmark}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                {editBookmark ? 'Save Changes' : 'Add Tile'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
