'use client';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, LogOut, Bell, X, Check, ExternalLink } from 'lucide-react';

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
      if (ptoRes.ok) setPendingPTO((await ptoRes.json()).length);
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
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f172a' }}>
        <div className="animate-spin w-8 h-8 border-2 border-[#6366f1] border-t-transparent rounded-full" />
      </div>
    );
  }

  const isExternal = (url: string) => url.startsWith('http');

  return (
    <div className="min-h-screen" style={{ background: '#0f172a' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#334155] bg-[#1e293b]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#6366f1] rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/40 text-base">
            🏪
          </div>
          <span className="text-[#f1f5f9] font-bold text-base">CLL Carniceria</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[#94a3b8] text-sm hidden sm:block tabular-nums">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-1.5 text-[#94a3b8] hover:text-[#f1f5f9] text-sm transition-colors px-3 py-1.5 rounded-lg hover:bg-[#334155]"
          >
            <LogOut size={14} />
            <span className="hidden sm:block">Sign out</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#f1f5f9] mb-1">
            {getGreeting()}, {session?.user?.email?.split('@')[0] || 'there'} 👋
          </h1>
          <p className="text-[#94a3b8] text-sm">
            {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-[#1e293b] rounded-2xl p-5 border border-[#334155]">
            <p className="text-[#94a3b8] text-xs font-medium uppercase tracking-wide mb-2">Pending PTO</p>
            <p className="text-3xl font-bold text-[#f1f5f9] mb-1">{pendingPTO}</p>
            {pendingPTO > 0 ? (
              <Link href="/manager/pto-queue" className="text-[#f59e0b] text-xs hover:underline">Review now →</Link>
            ) : (
              <span className="text-[#94a3b8] text-xs">All clear</span>
            )}
          </div>
          <div className="bg-[#1e293b] rounded-2xl p-5 border border-[#334155]">
            <p className="text-[#94a3b8] text-xs font-medium uppercase tracking-wide mb-2">Schedule</p>
            <p className="text-lg font-bold text-[#f1f5f9] capitalize mb-1">
              {scheduleStatus === 'none' ? '—' : scheduleStatus}
            </p>
            <Link href="/manager/schedule" className="text-[#6366f1] text-xs hover:underline">Manage →</Link>
          </div>
          <div className="bg-[#1e293b] rounded-2xl p-5 border border-[#334155] col-span-2 sm:col-span-1">
            <p className="text-[#94a3b8] text-xs font-medium uppercase tracking-wide mb-2">Manager Portal</p>
            <p className="text-[#f1f5f9] text-sm mb-1">Full workforce tools</p>
            <Link href="/manager" className="text-[#6366f1] text-xs hover:underline">Open portal →</Link>
          </div>
        </div>

        {/* Bookmarks */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-[#f1f5f9] font-semibold text-lg">Quick Access</h2>
          <button
            onClick={() => {
              setEditBookmark(null);
              setForm({ title: '', url: '', icon: '🔗', color: '#6366f1' });
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 bg-[#334155] hover:bg-[#475569] text-[#f1f5f9] text-sm px-4 py-2 rounded-xl transition-colors border border-[#475569]"
          >
            <Plus size={14} />
            Add Tile
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {bookmarks.map(b => (
            <div
              key={b.id}
              className="relative group"
              onMouseEnter={() => setHoveredId(b.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <Link
                href={b.url}
                target={isExternal(b.url) ? '_blank' : undefined}
                rel={isExternal(b.url) ? 'noopener noreferrer' : undefined}
              >
                <div
                  className="rounded-2xl p-5 flex flex-col items-center gap-3 cursor-pointer transition-all duration-200 border shadow-lg hover:-translate-y-1 hover:shadow-xl"
                  style={{
                    backgroundColor: b.color + '22',
                    borderColor: b.color + '44',
                  }}
                >
                  <span className="text-3xl">{b.icon}</span>
                  <span className="text-[#f1f5f9] font-medium text-sm text-center leading-tight">{b.title}</span>
                  {isExternal(b.url) && hoveredId === b.id && (
                    <ExternalLink size={12} className="text-[#94a3b8] absolute top-3 right-3" />
                  )}
                </div>
              </Link>
              {hoveredId === b.id && (
                <div className="absolute top-2 right-2 flex gap-1">
                  <button
                    onClick={e => { e.preventDefault(); openEdit(b); }}
                    className="w-6 h-6 bg-[#334155] rounded-lg flex items-center justify-center text-[#94a3b8] hover:text-[#f1f5f9] shadow"
                  >
                    <Pencil size={11} />
                  </button>
                  <button
                    onClick={e => { e.preventDefault(); handleDelete(b.id); }}
                    className="w-6 h-6 bg-[#334155] rounded-lg flex items-center justify-center text-[#94a3b8] hover:text-[#ef4444] shadow"
                  >
                    <Trash2 size={11} />
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
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-[#1e293b] border border-[#334155] rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-[#f1f5f9] text-lg">{editBookmark ? 'Edit Tile' : 'Add Tile'}</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#94a3b8] hover:text-[#f1f5f9] transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#94a3b8] mb-1.5">Title</label>
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Schedule Manager"
                  className="w-full px-3 py-2.5 bg-[#0f172a] border border-[#334155] rounded-xl text-sm text-[#f1f5f9] placeholder-[#475569] focus:border-[#6366f1] outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#94a3b8] mb-1.5">URL</label>
                <input
                  value={form.url}
                  onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                  placeholder="/manager/schedule or https://..."
                  className="w-full px-3 py-2.5 bg-[#0f172a] border border-[#334155] rounded-xl text-sm text-[#f1f5f9] placeholder-[#475569] focus:border-[#6366f1] outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#94a3b8] mb-1.5">Icon (emoji)</label>
                <input
                  value={form.icon}
                  onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                  placeholder="📅"
                  className="w-full px-3 py-2.5 bg-[#0f172a] border border-[#334155] rounded-xl text-sm text-[#f1f5f9] placeholder-[#475569] focus:border-[#6366f1] outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#94a3b8] mb-2">Color</label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setForm(f => ({ ...f, color: c }))}
                      className="w-8 h-8 rounded-full transition-transform hover:scale-110 flex items-center justify-center border-2"
                      style={{ backgroundColor: c, borderColor: form.color === c ? 'white' : 'transparent' }}
                    >
                      {form.color === c && <Check size={13} className="text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2.5 border border-[#334155] rounded-xl text-sm text-[#94a3b8] hover:bg-[#334155] hover:text-[#f1f5f9] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBookmark}
                className="flex-1 px-4 py-2.5 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-indigo-900/30"
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
