'use client';
import { useEffect, useState } from 'react';
import { ManagerLayout } from '@/components/layout/ManagerLayout';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import { Users, Calendar, ClipboardList, DollarSign, ArrowRight } from 'lucide-react';

export default function ManagerDashboard() {
  const [stats, setStats] = useState({ employees: 0, pendingPTO: 0, scheduleStatus: 'none' });
  const [recentPTO, setRecentPTO] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [empRes, ptoRes, schedRes] = await Promise.all([
          fetch('/api/employees'),
          fetch('/api/pto?status=pending'),
          fetch('/api/schedule'),
        ]);
        const employees = empRes.ok ? await empRes.json() : [];
        const pto = ptoRes.ok ? await ptoRes.json() : [];
        const scheds = schedRes.ok ? await schedRes.json() : [];
        setStats({
          employees: employees.filter((e: any) => e.active).length,
          pendingPTO: pto.length,
          scheduleStatus: scheds[0]?.status || 'none',
        });
        setRecentPTO(pto.slice(0, 5));
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const statusBadge = (s: string) => {
    const map: Record<string, any> = { draft: 'warning', approved: 'info', published: 'success', none: 'default' };
    return <Badge variant={map[s] || 'default'}>{s === 'none' ? 'None' : s}</Badge>;
  };

  const ptoTypeBadge = (t: string) => {
    const map: Record<string, any> = { vacation: 'info', sick: 'warning', personal: 'default', schedule_exception: 'danger' };
    return <Badge variant={map[t] || 'default'}>{t.replace('_', ' ')}</Badge>;
  };

  return (
    <ManagerLayout title="Dashboard">
      <div className="max-w-6xl space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardBody className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#3b82f620' }}>
                <Users size={22} style={{ color: '#3b82f6' }} />
              </div>
              <div>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>Active Employees</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{loading ? '—' : stats.employees}</p>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#f59e0b20' }}>
                <ClipboardList size={22} style={{ color: '#f59e0b' }} />
              </div>
              <div>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>Pending PTO</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{loading ? '—' : stats.pendingPTO}</p>
                {stats.pendingPTO > 0 && <p className="text-xs" style={{ color: '#f59e0b' }}>Needs review</p>}
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#6366f120' }}>
                <Calendar size={22} style={{ color: '#6366f1' }} />
              </div>
              <div>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>Schedule Status</p>
                <div className="mt-1">{statusBadge(stats.scheduleStatus)}</div>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent PTO */}
          <Card>
            <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
              <h3 className="font-semibold" style={{ color: 'var(--text)' }}>Pending PTO Requests</h3>
              <Link href="/manager/pto-queue" className="text-sm flex items-center gap-1 hover:underline" style={{ color: '#6366f1' }}>
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <CardBody>
              {recentPTO.length === 0 ? (
                <p className="text-sm text-center py-4" style={{ color: 'var(--muted)' }}>No pending requests</p>
              ) : (
                <div className="space-y-3">
                  {recentPTO.map((pto: any) => (
                    <div key={pto.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm" style={{ color: 'var(--text)' }}>{pto.first_name} {pto.last_name}</p>
                        <p className="text-xs" style={{ color: 'var(--muted)' }}>{pto.start_date} — {pto.end_date}</p>
                      </div>
                      {ptoTypeBadge(pto.request_type)}
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Quick Actions */}
          <Card>
            <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <h3 className="font-semibold" style={{ color: 'var(--text)' }}>Quick Actions</h3>
            </div>
            <CardBody className="space-y-2">
              {[
                { href: '/manager/schedule', icon: Calendar, label: 'Manage Schedule', desc: 'Generate or view weekly schedule', accent: '#6366f1' },
                { href: '/manager/pto-queue', icon: ClipboardList, label: 'Review PTO', desc: 'Approve or deny time-off requests', accent: '#f59e0b' },
                { href: '/manager/employees', icon: Users, label: 'Manage Employees', desc: 'Manage your team members', accent: '#10b981' },
                { href: '/manager/payroll', icon: DollarSign, label: 'Run Payroll', desc: 'Generate payroll reports', accent: '#ec4899' },
              ].map(({ href, icon: Icon, label, desc, accent }) => (
                <Link key={href} href={href} className="flex items-center gap-3 p-3 rounded-xl transition-colors group" style={{ background: 'transparent' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: accent + '20' }}>
                    <Icon size={18} style={{ color: accent }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm" style={{ color: 'var(--text)' }}>{label}</p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>{desc}</p>
                  </div>
                  <ArrowRight size={16} style={{ color: 'var(--muted)' }} />
                </Link>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </ManagerLayout>
  );
}
