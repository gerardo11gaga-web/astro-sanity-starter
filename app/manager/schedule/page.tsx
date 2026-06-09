'use client';
import { useState, useEffect } from 'react';
import { ManagerLayout } from '@/components/layout/ManagerLayout';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Input, Select } from '@/components/ui/Input';
import { ChevronLeft, ChevronRight, AlertTriangle, Zap, CheckCheck, Globe, Plus, Pencil, Trash2 } from 'lucide-react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toDateStr(date: Date): string {
  return date.toISOString().split('T')[0];
}

export default function SchedulePage() {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [schedule, setSchedule] = useState<any>(null);
  const [pendingPTO, setPendingPTO] = useState(0);
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [editShift, setEditShift] = useState<any | null>(null);
  const [addShift, setAddShift] = useState<{ date: string } | null>(null);
  const [shiftForm, setShiftForm] = useState<any>({ employee_id: '', department_id: '', start_time: '09:00', end_time: '17:00', position: '' });

  const weekEnd = addDays(weekStart, 6);
  const weekDates = Array.from({ length: 7 }, (_, i) => toDateStr(addDays(weekStart, i)));

  useEffect(() => {
    fetchSchedule();
    fetchPTO();
    fetchEmployees();
    fetchDepts();
  }, [weekStart]);

  async function fetchSchedule() {
    const res = await fetch(`/api/schedule?week_start=${toDateStr(weekStart)}`);
    if (res.ok) {
      const s = await res.json();
      if (s) {
        const full = await fetch(`/api/schedule/${s.id}`);
        if (full.ok) setSchedule(await full.json());
      } else setSchedule(null);
    }
  }

  async function fetchPTO() {
    const res = await fetch(`/api/pto?status=pending`);
    if (res.ok) {
      const data = await res.json();
      const overlap = data.filter((p: any) =>
        p.start_date <= toDateStr(weekEnd) && p.end_date >= toDateStr(weekStart)
      );
      setPendingPTO(overlap.length);
    }
  }

  async function fetchEmployees() {
    const res = await fetch('/api/employees');
    if (res.ok) setEmployees(await res.json());
  }

  async function fetchDepts() {
    const res = await fetch('/api/departments');
    if (res.ok) setDepartments(await res.json());
  }

  async function generateSchedule() {
    setLoading(true);
    const res = await fetch('/api/schedule/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ week_start: toDateStr(weekStart), week_end: toDateStr(weekEnd) }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      alert(data.error);
      return;
    }
    setWarnings(data.warnings?.map((w: any) => w.message) || []);
    fetchSchedule();
  }

  async function updateStatus(status: string) {
    if (!schedule) return;
    await fetch(`/api/schedule/${schedule.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    fetchSchedule();
  }

  async function saveShift() {
    if (!schedule) return;
    if (editShift?.id) {
      await fetch(`/api/schedule/${schedule.id}/shifts`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...shiftForm, shift_id: editShift.id }),
      });
    } else if (addShift) {
      await fetch(`/api/schedule/${schedule.id}/shifts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...shiftForm, date: addShift.date }),
      });
    }
    setEditShift(null);
    setAddShift(null);
    fetchSchedule();
  }

  async function deleteShift(shiftId: number) {
    if (!schedule) return;
    await fetch(`/api/schedule/${schedule.id}/shifts`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shift_id: shiftId }),
    });
    fetchSchedule();
  }

  // Group shifts by employee
  const employeeShifts: Record<number, Record<string, any[]>> = {};
  if (schedule?.shifts) {
    for (const shift of schedule.shifts) {
      if (!employeeShifts[shift.employee_id]) employeeShifts[shift.employee_id] = {};
      if (!employeeShifts[shift.employee_id][shift.date]) employeeShifts[shift.employee_id][shift.date] = [];
      employeeShifts[shift.employee_id][shift.date].push(shift);
    }
  }

  const uniqueEmployees = schedule?.shifts
    ? [...new Map(schedule.shifts.map((s: any) => [s.employee_id, { id: s.employee_id, name: `${s.first_name} ${s.last_name}` }])).values()]
    : [];

  const statusBadge = (s: string) => {
    const map: Record<string, any> = { draft: 'draft', approved: 'approved', published: 'published' };
    return <Badge variant={map[s] || 'default'}>{s}</Badge>;
  };

  return (
    <ManagerLayout title="Schedule Manager">
      <div className="space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '8px', padding: '0.5rem 0.75rem',
          }}>
            <button
              onClick={() => setWeekStart(addDays(weekStart, -7))}
              style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text)', minWidth: '180px', textAlign: 'center' }}>
              {weekStart.toLocaleDateString([], { month: 'short', day: 'numeric' })} – {weekEnd.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <button
              onClick={() => setWeekStart(addDays(weekStart, 7))}
              style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <Button onClick={generateSchedule} loading={loading} variant="primary">
            <Zap size={16} /> Generate Schedule
          </Button>

          {schedule && (
            <>
              {schedule.status === 'draft' && (
                <Button onClick={() => updateStatus('approved')} variant="secondary">
                  <CheckCheck size={16} /> Approve
                </Button>
              )}
              {schedule.status === 'approved' && (
                <Button onClick={() => updateStatus('published')} variant="secondary">
                  <Globe size={16} /> Publish
                </Button>
              )}
              {statusBadge(schedule.status)}
            </>
          )}
        </div>

        {/* Pending PTO Warning */}
        {pendingPTO > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.75rem', background: '#FEF3C7', border: '1px solid #FDE68A',
            borderRadius: '8px', fontSize: '0.875rem',
          }}>
            <AlertTriangle size={16} style={{ color: '#B45309', flexShrink: 0 }} />
            <span style={{ color: '#92400E' }}>{pendingPTO} pending PTO request(s) overlap this week. Review before generating.</span>
          </div>
        )}

        {/* Warnings */}
        {warnings.length > 0 && (
          <div style={{ padding: '0.75rem', background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '8px' }}>
            <p style={{ fontWeight: 500, color: '#92400E', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Schedule Warnings</p>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {warnings.map((w, i) => <li key={i} style={{ fontSize: '0.75rem', color: '#B45309' }}>• {w}</li>)}
            </ul>
          </div>
        )}

        {/* Schedule Table */}
        {schedule ? (
          <div style={{ background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)', overflowX: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <table style={{ minWidth: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                <tr>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', width: '160px' }}>Employee</th>
                  {weekDates.map((date, i) => (
                    <th key={date} style={{ padding: '0.75rem 0.5rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', minWidth: '110px' }}>
                      <div>{DAYS[i]}</div>
                      <div style={{ color: 'var(--text-light)', fontWeight: 400 }}>{new Date(date + 'T12:00').getDate()}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {uniqueEmployees.map((emp: any, i) => (
                  <tr key={emp.id} style={{ borderTop: '1px solid var(--border)', background: i % 2 === 1 ? 'var(--surface-alt)' : 'var(--surface)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text)' }}>{emp.name}</td>
                    {weekDates.map(date => {
                      const shifts = employeeShifts[emp.id]?.[date] || [];
                      return (
                        <td key={date} style={{ padding: '0.5rem', verticalAlign: 'top' }}>
                          {shifts.map((shift: any) => (
                            <div key={shift.id} style={{ marginBottom: '0.25rem', position: 'relative' }} className="group">
                              <div
                                style={{
                                  fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '6px',
                                  color: 'white', fontWeight: 500, lineHeight: 1.3,
                                  backgroundColor: shift.department_color || 'var(--primary)',
                                }}
                              >
                                <div>{shift.start_time}–{shift.end_time}</div>
                                <div style={{ opacity: 0.85, fontSize: '0.625rem' }}>{shift.department_name}</div>
                              </div>
                              <div className="hidden group-hover:flex" style={{ position: 'absolute', top: '-4px', right: '-4px', gap: '2px', zIndex: 10 }}>
                                <button
                                  onClick={() => { setEditShift(shift); setShiftForm({ employee_id: shift.employee_id, department_id: shift.department_id, start_time: shift.start_time, end_time: shift.end_time, position: shift.position || '' }); }}
                                  style={{
                                    width: '20px', height: '20px', background: 'var(--surface)', border: '1px solid var(--border)',
                                    borderRadius: '4px', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                  }}
                                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
                                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                                >
                                  <Pencil size={10} />
                                </button>
                                <button
                                  onClick={() => deleteShift(shift.id)}
                                  style={{
                                    width: '20px', height: '20px', background: 'var(--surface)', border: '1px solid var(--border)',
                                    borderRadius: '4px', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                  }}
                                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--danger)')}
                                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                                >
                                  <Trash2 size={10} />
                                </button>
                              </div>
                            </div>
                          ))}
                          <button
                            onClick={() => { setAddShift({ date }); setShiftForm({ employee_id: emp.id, department_id: '', start_time: '09:00', end_time: '17:00', position: '' }); }}
                            style={{ color: 'var(--text-light)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
                            onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-light)')}
                          >
                            <Plus size={14} />
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {uniqueEmployees.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-light)', padding: '3rem 1rem', fontSize: '0.875rem' }}>
                      No schedule generated for this week. Click &quot;Generate Schedule&quot; to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{
            background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16rem',
          }}>
            <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '1.125rem', fontWeight: 500, marginBottom: '0.25rem' }}>No schedule for this week</p>
              <p style={{ fontSize: '0.875rem' }}>Click &quot;Generate Schedule&quot; to create one</p>
            </div>
          </div>
        )}
      </div>

      {/* Edit/Add Shift Modal */}
      <Modal
        open={!!(editShift || addShift)}
        onClose={() => { setEditShift(null); setAddShift(null); }}
        title={editShift ? 'Edit Shift' : 'Add Shift'}
      >
        <div className="space-y-4">
          {addShift && (
            <Select label="Employee" value={shiftForm.employee_id} onChange={e => setShiftForm((f: any) => ({ ...f, employee_id: Number(e.target.value) }))}>
              <option value="">Select employee...</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
            </Select>
          )}
          <Select label="Department" value={shiftForm.department_id} onChange={e => setShiftForm((f: any) => ({ ...f, department_id: Number(e.target.value) }))}>
            <option value="">Select department...</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </Select>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Start Time" type="time" value={shiftForm.start_time} onChange={e => setShiftForm((f: any) => ({ ...f, start_time: e.target.value }))} />
            <Input label="End Time" type="time" value={shiftForm.end_time} onChange={e => setShiftForm((f: any) => ({ ...f, end_time: e.target.value }))} />
          </div>
          <Input label="Position" value={shiftForm.position} onChange={e => setShiftForm((f: any) => ({ ...f, position: e.target.value }))} placeholder="e.g. Cashier, Stocker..." />
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => { setEditShift(null); setAddShift(null); }}>Cancel</Button>
            <Button className="flex-1" onClick={saveShift}>Save Shift</Button>
          </div>
        </div>
      </Modal>
    </ManagerLayout>
  );
}
