'use client';
import { useState, useEffect, use } from 'react';
import { ManagerLayout } from '@/components/layout/ManagerLayout';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [employee, setEmployee] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [allDepts, setAllDepts] = useState<any[]>([]);
  const [availability, setAvailability] = useState<any[]>([]);
  const [ptoHistory, setPtoHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newDeptId, setNewDeptId] = useState('');
  const [newPayRate, setNewPayRate] = useState('');

  useEffect(() => {
    fetchEmployee();
    fetchAllDepts();
    fetchPTO();
  }, [id]);

  async function fetchEmployee() {
    const res = await fetch(`/api/employees/${id}`);
    if (res.ok) {
      const data = await res.json();
      setEmployee(data);
      setDepartments(data.departments || []);
      // Initialize availability for all 7 days
      const existing = data.availability || [];
      const avail = DAYS.map((_, i) => {
        const found = existing.find((a: any) => a.day_of_week === i);
        return found || { day_of_week: i, available: 0, start_time: '09:00', end_time: '17:00', alternating: 'none' };
      });
      setAvailability(avail);
    }
  }

  async function fetchAllDepts() {
    const res = await fetch('/api/departments');
    if (res.ok) setAllDepts(await res.json());
  }

  async function fetchPTO() {
    const res = await fetch(`/api/pto?employee_id=${id}`);
    if (res.ok) setPtoHistory(await res.json());
  }

  async function handleSave() {
    setLoading(true);
    await fetch(`/api/employees/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employee),
    });
    await fetch(`/api/employees/${id}/availability`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(availability.filter(a => a.available)),
    });
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function addDept() {
    if (!newDeptId) return;
    await fetch(`/api/employees/${id}/departments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ department_id: Number(newDeptId), pay_rate: Number(newPayRate) || 0 }),
    });
    setNewDeptId('');
    setNewPayRate('');
    fetchEmployee();
  }

  async function removeDept(dept_id: number) {
    await fetch(`/api/employees/${id}/departments`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ department_id: dept_id }),
    });
    fetchEmployee();
  }

  function updateAvail(idx: number, field: string, value: any) {
    setAvailability(prev => prev.map((a, i) => i === idx ? { ...a, [field]: value } : a));
  }

  if (!employee) return <ManagerLayout title="Employee"><div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" /></div></ManagerLayout>;

  return (
    <ManagerLayout title={`${employee.first_name} ${employee.last_name}`}>
      <div className="max-w-4xl space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/manager/employees">
            <Button variant="ghost" size="sm"><ArrowLeft size={16} /> Back</Button>
          </Link>
          <h2 className="text-xl font-bold text-gray-900">{employee.first_name} {employee.last_name}</h2>
          <Badge variant={employee.active ? 'success' : 'default'}>{employee.active ? 'Active' : 'Inactive'}</Badge>
        </div>

        {/* Basic Info */}
        <Card>
          <CardHeader><h3 className="font-semibold text-gray-900">Basic Information</h3></CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="First Name" value={employee.first_name || ''} onChange={e => setEmployee((emp: any) => ({ ...emp, first_name: e.target.value }))} />
              <Input label="Last Name" value={employee.last_name || ''} onChange={e => setEmployee((emp: any) => ({ ...emp, last_name: e.target.value }))} />
              <Input label="Phone" value={employee.phone || ''} onChange={e => setEmployee((emp: any) => ({ ...emp, phone: e.target.value }))} />
              <Input label="Email" type="email" value={employee.email || ''} onChange={e => setEmployee((emp: any) => ({ ...emp, email: e.target.value }))} />
              <Select label="Employee Type" value={employee.employee_type || 'hourly'} onChange={e => setEmployee((emp: any) => ({ ...emp, employee_type: e.target.value }))}>
                <option value="hourly">Hourly</option>
                <option value="salary">Salary</option>
                <option value="flat_rate">Flat Rate</option>
                <option value="cash">Cash</option>
              </Select>
              <Input label="Max Hours/Week" type="number" value={employee.max_hours_per_week || 40} onChange={e => setEmployee((emp: any) => ({ ...emp, max_hours_per_week: Number(e.target.value) }))} />
              <Input label="Hire Date" type="date" value={employee.hire_date || ''} onChange={e => setEmployee((emp: any) => ({ ...emp, hire_date: e.target.value }))} />
            </div>
          </CardBody>
        </Card>

        {/* Departments */}
        <Card>
          <CardHeader><h3 className="font-semibold text-gray-900">Department Assignments</h3></CardHeader>
          <CardBody className="space-y-3">
            {departments.map((d: any) => (
              <div key={d.department_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-sm">{d.department_name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">${d.pay_rate}/hr</span>
                  <button onClick={() => removeDept(d.department_id)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <select
                value={newDeptId}
                onChange={e => setNewDeptId(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-indigo-500"
              >
                <option value="">Select department...</option>
                {allDepts.filter(d => !departments.some((ed: any) => ed.department_id === d.id)).map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Pay rate"
                value={newPayRate}
                onChange={e => setNewPayRate(e.target.value)}
                className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-indigo-500"
              />
              <Button size="sm" onClick={addDept} disabled={!newDeptId}><Plus size={15} /> Add</Button>
            </div>
          </CardBody>
        </Card>

        {/* Availability */}
        <Card>
          <CardHeader><h3 className="font-semibold text-gray-900">Weekly Availability</h3></CardHeader>
          <CardBody className="space-y-3">
            {availability.map((avail, idx) => (
              <div key={idx} className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 w-28">
                  <input
                    type="checkbox"
                    checked={avail.available === 1}
                    onChange={e => updateAvail(idx, 'available', e.target.checked ? 1 : 0)}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">{DAYS[idx].slice(0, 3)}</span>
                </div>
                {avail.available === 1 && (
                  <>
                    <input type="time" value={avail.start_time || '09:00'} onChange={e => updateAvail(idx, 'start_time', e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm outline-none focus:border-indigo-500" />
                    <span className="text-gray-400 text-sm">to</span>
                    <input type="time" value={avail.end_time || '17:00'} onChange={e => updateAvail(idx, 'end_time', e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm outline-none focus:border-indigo-500" />
                    <select value={avail.alternating || 'none'} onChange={e => updateAvail(idx, 'alternating', e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm outline-none focus:border-indigo-500">
                      <option value="none">Every week</option>
                      <option value="even">Even weeks</option>
                      <option value="odd">Odd weeks</option>
                    </select>
                  </>
                )}
              </div>
            ))}
          </CardBody>
        </Card>

        {/* PTO History */}
        <Card>
          <CardHeader><h3 className="font-semibold text-gray-900">PTO History</h3></CardHeader>
          <CardBody>
            {ptoHistory.length === 0 ? (
              <p className="text-gray-500 text-sm">No PTO requests</p>
            ) : (
              <div className="space-y-2">
                {ptoHistory.map((pto: any) => (
                  <div key={pto.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium text-sm capitalize">{pto.request_type.replace('_', ' ')}</span>
                      <p className="text-xs text-gray-500">{pto.start_date} — {pto.end_date}</p>
                      {pto.reason && <p className="text-xs text-gray-400">{pto.reason}</p>}
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

        <div className="flex gap-3">
          <Button loading={loading} onClick={handleSave} className="flex-1">
            {saved ? '✓ Saved!' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </ManagerLayout>
  );
}
