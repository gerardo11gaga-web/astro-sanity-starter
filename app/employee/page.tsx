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
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <header style={{
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '32px', height: '32px', background: 'var(--primary)',
            borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Calendar size={16} color="white" />
          </div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: 'var(--text)', fontSize: '1rem' }}>
            My Schedule
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{session?.user?.email}</span>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            style={{ color: 'var(--text-light)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-light)')}
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '48rem', margin: '0 auto', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Upcoming Shifts */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2" style={{ color: 'var(--text)' }}>
              <Clock size={18} style={{ color: 'var(--primary)' }} /> My Upcoming Shifts
            </h2>
          </CardHeader>
          <CardBody>
            {upcomingShifts.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '1rem 0' }}>
                No upcoming shifts scheduled
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingShifts.map((shift: any) => (
                  <div key={shift.id} style={{
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    padding: '0.75rem', background: 'var(--surface-alt)', borderRadius: '8px',
                    border: '1px solid var(--border)',
                  }}>
                    <div
                      style={{ width: '12px', height: '12px', borderRadius: '50%', flexShrink: 0, backgroundColor: shift.department_color || 'var(--primary)' }}
                    />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--text)' }}>
                        {new Date(shift.date + 'T12:00').toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{shift.start_time} – {shift.end_time} · {shift.department_name}</p>
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
            <h2 className="font-semibold" style={{ color: 'var(--text)' }}>Time Off Requests</h2>
            <Button size="sm" onClick={() => setShowPTO(true)}>
              <Plus size={14} /> Request Time Off
            </Button>
          </CardHeader>
          <CardBody>
            {ptoRequests.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '1rem 0' }}>
                No PTO requests yet
              </p>
            ) : (
              <div className="space-y-3">
                {ptoRequests.map((pto: any) => (
                  <div key={pto.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.75rem', background: 'var(--surface-alt)', borderRadius: '8px',
                    border: '1px solid var(--border)',
                  }}>
                    <div>
                      <p style={{ fontWeight: 500, fontSize: '0.875rem', textTransform: 'capitalize', color: 'var(--text)' }}>
                        {pto.request_type.replace('_', ' ')}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{pto.start_date} — {pto.end_date}</p>
                      {pto.reason && <p style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{pto.reason}</p>}
                      {pto.manager_notes && <p style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>Manager: {pto.manager_notes}</p>}
                    </div>
                    <Badge variant={pto.status === 'approved' ? 'approved' : pto.status === 'denied' ? 'denied' : 'pending'}>
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
