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
    const map: Record<string, any> = { draft: 'warning', approved: 'info', published: 'success' };
    return <Badge variant={map[s] || 'default'}>{s}</Badge>;
  };

  return (
    <ManagerLayout title="Schedule Manager">
      <div className="space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
            <button onClick={() => setWeekStart(addDays(weekStart, -7))} className="text-gray-400 hover:text-gray-700">
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-medium text-gray-900 min-w-[180px] text-center">
              {weekStart.toLocaleDateString([], { month: 'short', day: 'numeric' })} – {weekEnd.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <button onClick={() => setWeekStart(addDays(weekStart, 7))} className="text-gray-400 hover:text-gray-700">
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
          <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
            <AlertTriangle size={16} className="text-yellow-600 flex-shrink-0" />
            <span className="text-yellow-800">{pendingPTO} pending PTO request(s) overlap this week. Review before generating.</span>
          </div>
        )}

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="font-medium text-orange-800 text-sm mb-1">Schedule Warnings</p>
            <ul className="space-y-1">
              {warnings.map((w, i) => <li key={i} className="text-xs text-orange-700">• {w}</li>)}
            </ul>
          </div>
        )}

        {/* Schedule Table */}
        {schedule ? (
          <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-40">Employee</th>
                  {weekDates.map((date, i) => (
                    <th key={date} className="px-2 py-3 text-center text-xs font-semibold text-gray-500 uppercase min-w-[110px]">
                      <div>{DAYS[i]}</div>
                      <div className="text-gray-400 font-normal">{new Date(date + 'T12:00').getDate()}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {uniqueEmployees.map((emp: any) => (
                  <tr key={emp.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{emp.name}</td>
                    {weekDates.map(date => {
                      const shifts = employeeShifts[emp.id]?.[date] || [];
                      return (
                        <td key={date} className="px-2 py-2 align-top">
                          {shifts.map((shift: any) => (
                            <div key={shift.id} className="mb-1 relative group">
                              <div
                                className="text-xs px-2 py-1 rounded-md text-white font-medium leading-tight"
                                style={{ backgroundColor: shift.department_color || '#6366f1' }}
                              >
                                <div>{shift.start_time}–{shift.end_time}</div>
                                <div className="opacity-80 text-[10px]">{shift.department_name}</div>
                              </div>
                              <div className="hidden group-hover:flex absolute -top-1 -right-1 gap-0.5 z-10">
                                <button
                                  onClick={() => { setEditShift(shift); setShiftForm({ employee_id: shift.employee_id, department_id: shift.department_id, start_time: shift.start_time, end_time: shift.end_time, position: shift.position || '' }); }}
                                  className="w-5 h-5 bg-white border border-gray-200 rounded text-gray-600 hover:text-indigo-600 flex items-center justify-center shadow-sm"
                                >
                                  <Pencil size={10} />
                                </button>
                                <button
                                  onClick={() => deleteShift(shift.id)}
                                  className="w-5 h-5 bg-white border border-gray-200 rounded text-gray-600 hover:text-red-600 flex items-center justify-center shadow-sm"
                                >
                                  <Trash2 size={10} />
                                </button>
                              </div>
                            </div>
                          ))}
                          <button
                            onClick={() => { setAddShift({ date }); setShiftForm({ employee_id: emp.id, department_id: '', start_time: '09:00', end_time: '17:00', position: '' }); }}
                            className="text-gray-300 hover:text-indigo-500 transition-colors"
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
                    <td colSpan={8} className="text-center text-gray-400 py-12 text-sm">
                      No schedule generated for this week. Click &quot;Generate Schedule&quot; to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 flex items-center justify-center h-64 text-gray-400">
            <div className="text-center">
              <p className="text-lg font-medium mb-1">No schedule for this week</p>
              <p className="text-sm">Click &quot;Generate Schedule&quot; to create one</p>
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
