'use client';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { LogOut, Calendar, Clock, Plus } from 'lucide-react';

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function EmployeePortal() {
  const { data: session } = useSession();
  const [shifts, setShifts] = useState<any[]>([]);
  const [ptoRequests, setPtoRequests] = useState<any[]>([]);
  const [showPTO, setShowPTO] = useState(false);
  const [ptoForm, setPtoForm] = useState({ request_type: 'vacation', start_date: '', end_date: '', reason: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchShifts();
    fetchPTO();
  }, []);

  async function fetchShifts() {
    // Get published schedule for this week
    const weekStart = getWeekStart(new Date()).toISOString().split('T')[0];
    const res = await fetch(`/api/schedule?week_start=${weekStart}`);
    if (res.ok) {
      const sched = await res.json();
      if (sched && sched.status === 'published') {
        const full = await fetch(`/api/schedule/${sched.id}`);
        if (full.ok) {
          const data = await full.json();
          setShifts(data.shifts || []);
        }
      }
    }
  }

  async function fetchPTO() {
    const res = await fetch('/api/pto');
    if (res.ok) setPtoRequests(await res.json());
  }

  async function submitPTO() {
    if (!ptoForm.start_date || !ptoForm.end_date) return;
    setLoading(true);
    // For demo, use first employee - in real app would use session employee_id
    await fetch('/api/pto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...ptoForm, employee_id: 1 }),
    });
    setLoading(false);
    setShowPTO(false);
    setPtoForm({ request_type: 'vacation', start_date: '', end_date: '', reason: '' });
    fetchPTO();
  }

  const today = new Date().toISOString().split('T')[0];
  const upcomingShifts = shifts.filter(s => s.date >= today).slice(0, 7);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Calendar size={16} className="text-white" />
          </div>
          <span className="font-bold text-gray-900">My Schedule</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">{session?.user?.email}</span>
          <button onClick={() => signOut({ callbackUrl: '/login' })} className="text-gray-400 hover:text-gray-600">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Upcoming Shifts */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Clock size={18} className="text-indigo-500" /> My Upcoming Shifts
            </h2>
          </CardHeader>
          <CardBody>
            {upcomingShifts.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No upcoming shifts scheduled</p>
            ) : (
              <div className="space-y-3">
                {upcomingShifts.map((shift: any) => (
                  <div key={shift.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: shift.department_color || '#6366f1' }}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900">
                        {new Date(shift.date + 'T12:00').toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-xs text-gray-500">{shift.start_time} – {shift.end_time} · {shift.department_name}</p>
                    </div>
                    <Badge>{shift.position || 'General'}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* PTO */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Time Off Requests</h2>
            <Button size="sm" onClick={() => setShowPTO(true)}>
              <Plus size={14} /> Request Time Off
            </Button>
          </CardHeader>
          <CardBody>
            {ptoRequests.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No PTO requests yet</p>
            ) : (
              <div className="space-y-3">
                {ptoRequests.map((pto: any) => (
                  <div key={pto.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm capitalize">{pto.request_type.replace('_', ' ')}</p>
                      <p className="text-xs text-gray-500">{pto.start_date} — {pto.end_date}</p>
                      {pto.reason && <p className="text-xs text-gray-400">{pto.reason}</p>}
                      {pto.manager_notes && <p className="text-xs text-indigo-600">Manager: {pto.manager_notes}</p>}
                    </div>
                    <Badge variant={pto.status === 'approved' ? 'success' : pto.status === 'denied' ? 'danger' : 'warning'}>
                      {pto.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </main>

      <Modal open={showPTO} onClose={() => setShowPTO(false)} title="Request Time Off">
        <div className="space-y-4">
          <Select label="Request Type" value={ptoForm.request_type} onChange={e => setPtoForm(f => ({ ...f, request_type: e.target.value }))}>
            <option value="vacation">Vacation</option>
            <option value="sick">Sick Leave</option>
            <option value="personal">Personal</option>
            <option value="schedule_exception">Schedule Exception</option>
          </Select>
          <Input label="Start Date" type="date" value={ptoForm.start_date} onChange={e => setPtoForm(f => ({ ...f, start_date: e.target.value }))} />
          <Input label="End Date" type="date" value={ptoForm.end_date} onChange={e => setPtoForm(f => ({ ...f, end_date: e.target.value }))} />
          <Textarea label="Reason (optional)" value={ptoForm.reason} onChange={e => setPtoForm(f => ({ ...f, reason: e.target.value }))} placeholder="Explain your request..." rows={3} />
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowPTO(false)}>Cancel</Button>
            <Button className="flex-1" loading={loading} onClick={submitPTO}>Submit Request</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
