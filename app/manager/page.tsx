'use client';
import { useEffect, useState } from 'react';
import { ManagerLayout } from '@/components/layout/ManagerLayout';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import { Users, Calendar, ClipboardList, DollarSign, AlertCircle, ArrowRight } from 'lucide-react';

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
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users size={22} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Employees</p>
                <p className="text-2xl font-bold text-gray-900">{loading ? '—' : stats.employees}</p>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <ClipboardList size={22} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending PTO</p>
                <p className="text-2xl font-bold text-gray-900">{loading ? '—' : stats.pendingPTO}</p>
                {stats.pendingPTO > 0 && <p className="text-xs text-yellow-600">Needs review</p>}
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Calendar size={22} className="text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Schedule Status</p>
                <div className="mt-1">{statusBadge(stats.scheduleStatus)}</div>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent PTO */}
          <Card>
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Pending PTO Requests</h3>
              <Link href="/manager/pto-queue" className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <CardBody>
              {recentPTO.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">No pending requests</p>
              ) : (
                <div className="space-y-3">
                  {recentPTO.map((pto: any) => (
                    <div key={pto.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm text-gray-900">{pto.first_name} {pto.last_name}</p>
                        <p className="text-xs text-gray-500">{pto.start_date} — {pto.end_date}</p>
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
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Quick Actions</h3>
            </div>
            <CardBody className="space-y-3">
              {[
                { href: '/manager/schedule', icon: Calendar, label: 'Manage Schedule', desc: 'Generate or view weekly schedule', color: 'indigo' },
                { href: '/manager/pto-queue', icon: ClipboardList, label: 'Review PTO', desc: 'Approve or deny time-off requests', color: 'yellow' },
                { href: '/manager/employees', icon: Users, label: 'Add Employee', desc: 'Manage your team members', color: 'green' },
                { href: '/manager/payroll', icon: DollarSign, label: 'Run Payroll', desc: 'Generate payroll reports', color: 'pink' },
              ].map(({ href, icon: Icon, label, desc, color }) => (
                <Link key={href} href={href} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                  <div className={`w-10 h-10 bg-${color}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon size={18} className={`text-${color}-600`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900">{label}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                  <ArrowRight size={16} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                </Link>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </ManagerLayout>
  );
}
