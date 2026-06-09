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
  '#9B2335', '#C9A84C', '#16803C', '#B45309', '#3b82f6',
  '#8b5cf6', '#ec4899', '#06b6d4', '#64748b', '#f97316',
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const CathedralLogo = () => (
  <svg width="32" height="32" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
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

export default function HQPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editBookmark, setEditBookmark] = useState<Bookmark | null>(null);
  const [form, setForm] = useState({ title: '', url: '', icon: '🔗', color: '#9B2335' });
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
    setForm({ title: '', url: '', icon: '🔗', color: '#9B2335' });
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="animate-spin w-8 h-8 border-2 rounded-full" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  const isExternal = (url: string) => url.startsWith('http');

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.875rem 1.5rem',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <CathedralLogo />
          <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1.125rem', color: 'var(--text)' }}>
            CLL Scheduler
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontVariantNumeric: 'tabular-nums' }} className="hidden sm:block">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {pendingPTO > 0 && (
            <Link href="/manager/pto-queue" style={{ position: 'relative', padding: '0.5rem', color: 'var(--text-muted)', borderRadius: '8px', display: 'flex' }}>
              <Bell size={16} />
              <span style={{
                position: 'absolute', top: '-2px', right: '-2px',
                width: '16px', height: '16px', background: 'var(--warning)',
                borderRadius: '50%', fontSize: '9px', fontWeight: 700,
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{pendingPTO}</span>
            </Link>
          )}
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              color: 'var(--text-muted)', fontSize: '0.875rem',
              padding: '0.375rem 0.75rem', borderRadius: '8px',
              background: 'none', border: 'none', cursor: 'pointer',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-alt)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >
            <LogOut size={14} />
            <span className="hidden sm:block">Sign out</span>
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '72rem', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Greeting */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.75rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.25rem' }}>
            {getGreeting()}, {session?.user?.email?.split('@')[0] || 'there'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4" style={{ marginBottom: '2.5rem' }}>
          {[
            {
              label: 'Pending PTO',
              value: pendingPTO,
              link: pendingPTO > 0 ? { href: '/manager/pto-queue', text: 'Review now →', color: 'var(--warning)' } : null,
              sub: pendingPTO === 0 ? 'All clear' : null,
            },
            {
              label: 'Schedule',
              value: scheduleStatus === 'none' ? '—' : scheduleStatus,
              link: { href: '/manager/schedule', text: 'Manage →', color: 'var(--primary)' },
              valueStyle: { textTransform: 'capitalize' as const, fontSize: '1.125rem' },
            },
            {
              label: 'Manager Portal',
              value: null,
              sub: 'Full workforce tools',
              link: { href: '/manager', text: 'Open portal →', color: 'var(--primary)' },
              colSpan: true,
            },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                background: 'var(--surface)',
                borderRadius: '12px',
                padding: '1.25rem',
                border: '1px solid var(--border)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }}
              className={stat.colSpan ? 'col-span-2 sm:col-span-1' : ''}
            >
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                {stat.label}
              </p>
              {stat.value !== null && (
                <p style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.25rem', ...(stat.valueStyle || {}) }}>
                  {stat.value}
                </p>
              )}
              {stat.sub && (
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{stat.sub}</p>
              )}
              {stat.link && (
                <Link href={stat.link.href} style={{ fontSize: '0.75rem', color: stat.link.color }}>
                  {stat.link.text}
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Bookmarks */}
        <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', fontWeight: 600, color: 'var(--text)' }}>
            Quick Access
          </h2>
          <button
            onClick={() => {
              setEditBookmark(null);
              setForm({ title: '', url: '', icon: '🔗', color: '#9B2335' });
              setShowAddModal(true);
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: 'var(--surface)', color: 'var(--primary)',
              border: '1px solid var(--primary)', borderRadius: '8px',
              padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: 500,
              cursor: 'pointer',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-light)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface)'; }}
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
                  style={{
                    background: 'var(--surface)',
                    border: `1px solid var(--border)`,
                    borderLeft: `4px solid ${b.color}`,
                    borderRadius: '12px',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.75rem',
                    cursor: 'pointer',
                    transition: 'background 0.15s, transform 0.15s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.background = 'var(--surface-alt)';
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.background = 'var(--surface)';
                    (e.currentTarget as HTMLDivElement).style.transform = 'none';
                  }}
                >
                  <span style={{ fontSize: '1.875rem' }}>{b.icon}</span>
                  <span style={{ color: 'var(--text)', fontWeight: 500, fontSize: '0.875rem', textAlign: 'center', lineHeight: 1.3 }}>{b.title}</span>
                  {isExternal(b.url) && hoveredId === b.id && (
                    <ExternalLink size={12} style={{ color: 'var(--text-light)', position: 'absolute', top: '0.75rem', right: '2.5rem' }} />
                  )}
                </div>
              </Link>
              {hoveredId === b.id && (
                <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', display: 'flex', gap: '0.25rem' }}>
                  <button
                    onClick={e => { e.preventDefault(); openEdit(b); }}
                    style={{
                      width: '24px', height: '24px', background: 'var(--surface)', border: '1px solid var(--border)',
                      borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--text-muted)', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    }}
                  >
                    <Pencil size={11} />
                  </button>
                  <button
                    onClick={e => { e.preventDefault(); handleDelete(b.id); }}
                    style={{
                      width: '24px', height: '24px', background: 'var(--surface)', border: '1px solid var(--border)',
                      borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--text-muted)', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--danger)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
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
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setShowAddModal(false)} />
          <div style={{
            position: 'relative',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            width: '100%', maxWidth: '28rem',
            padding: '1.5rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, color: 'var(--text)', fontSize: '1.125rem' }}>
                {editBookmark ? 'Edit Tile' : 'Add Tile'}
              </h3>
              <button onClick={() => setShowAddModal(false)} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {(['title', 'url', 'icon'] as const).map(field => (
                <div key={field}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.375rem', textTransform: 'capitalize' }}>
                    {field === 'icon' ? 'Icon (emoji)' : field === 'url' ? 'URL' : 'Title'}
                  </label>
                  <input
                    value={form[field]}
                    onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                    placeholder={field === 'title' ? 'Schedule Manager' : field === 'url' ? '/manager/schedule or https://...' : '📅'}
                    style={{
                      width: '100%', padding: '0.625rem 0.875rem',
                      background: 'var(--surface)', border: '1px solid var(--border)',
                      borderRadius: '8px', fontSize: '0.875rem', color: 'var(--text)', outline: 'none',
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                  />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Color</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setForm(f => ({ ...f, color: c }))}
                      style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        backgroundColor: c, border: form.color === c ? '2px solid var(--text)' : '2px solid transparent',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'transform 0.1s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
                      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                      {form.color === c && <Check size={13} color="white" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  flex: 1, padding: '0.625rem 1rem',
                  border: '1px solid var(--border)', borderRadius: '8px',
                  fontSize: '0.875rem', color: 'var(--text-muted)', background: 'var(--surface)', cursor: 'pointer',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-alt)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--surface)')}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBookmark}
                style={{
                  flex: 1, padding: '0.625rem 1rem',
                  background: 'var(--primary)', color: '#FFFFFF',
                  border: 'none', borderRadius: '8px',
                  fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--primary-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--primary)')}
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
