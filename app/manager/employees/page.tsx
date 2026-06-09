'use client';
import { useState, useEffect } from 'react';
import { ManagerLayout } from '@/components/layout/ManagerLayout';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Input, Select } from '@/components/ui/Input';
import { Table, Thead, Tbody, Th, Td } from '@/components/ui/Table';
import { Plus, Search, UserCheck, UserX } from 'lucide-react';
import Link from 'next/link';

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  active: number;
  employee_type: string;
  max_hours_per_week: number;
  department_names: string;
}

const defaultForm = { first_name: '', last_name: '', phone: '', email: '', employee_type: 'hourly', max_hours_per_week: 40, hire_date: '', notes: '' };

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchEmployees(); }, []);

  async function fetchEmployees() {
    const res = await fetch('/api/employees');
    if (res.ok) setEmployees(await res.json());
  }

  async function handleAdd() {
    setLoading(true);
    await fetch('/api/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setLoading(false);
    setShowAdd(false);
    setForm(defaultForm);
    fetchEmployees();
  }

  async function toggleActive(emp: Employee) {
    await fetch(`/api/employees/${emp.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...emp, active: emp.active ? 0 : 1 }),
    });
    fetchEmployees();
  }

  const filtered = employees.filter(e =>
    `${e.first_name} ${e.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    e.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ManagerLayout title="Employees">
      <div className="max-w-6xl space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-light)' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search employees..."
              style={{
                width: '100%', paddingLeft: '2.25rem', paddingRight: '1rem', paddingTop: '0.5rem', paddingBottom: '0.5rem',
                border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.875rem',
                background: 'var(--surface)', color: 'var(--text)', outline: 'none',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            />
          </div>
          <Button onClick={() => setShowAdd(true)}>
            <Plus size={16} /> Add Employee
          </Button>
        </div>

        <Table>
          <Thead>
            <tr>
              <Th>Name</Th>
              <Th>Type</Th>
              <Th>Departments</Th>
              <Th>Max Hours</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </Thead>
          <Tbody>
            {filtered.map((emp, i) => (
              <tr key={emp.id} style={{ background: i % 2 === 1 ? 'var(--surface-alt)' : 'var(--surface)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-alt)')}
                onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 1 ? 'var(--surface-alt)' : 'var(--surface)')}>
                <Td>
                  <Link href={`/manager/employees/${emp.id}`} style={{ fontWeight: 500, color: 'var(--primary)' }}
                    className="hover:underline">
                    {emp.first_name} {emp.last_name}
                  </Link>
                  {emp.email && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{emp.email}</p>}
                </Td>
                <Td><Badge>{emp.employee_type}</Badge></Td>
                <Td className="max-w-[200px]">
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{emp.department_names || '—'}</span>
                </Td>
                <Td>{emp.max_hours_per_week}h/wk</Td>
                <Td>
                  <Badge variant={emp.active ? 'approved' : 'default'}>{emp.active ? 'Active' : 'Inactive'}</Badge>
                </Td>
                <Td>
                  <div className="flex gap-2">
                    <Link href={`/manager/employees/${emp.id}`}>
                      <Button size="sm" variant="outline">Edit</Button>
                    </Link>
                    <button
                      onClick={() => toggleActive(emp)}
                      style={{
                        padding: '0.375rem', borderRadius: '6px',
                        color: emp.active ? 'var(--danger)' : 'var(--success)',
                        background: 'none', border: 'none', cursor: 'pointer',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = emp.active ? '#FEE2E2' : '#DCFCE7')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                      title={emp.active ? 'Deactivate' : 'Activate'}
                    >
                      {emp.active ? <UserX size={16} /> : <UserCheck size={16} />}
                    </button>
                  </div>
                </Td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><Td className="text-center py-8" style={{ color: 'var(--text-light)' }} colSpan={6}>No employees found</Td></tr>
            )}
          </Tbody>
        </Table>
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Employee">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="First Name" value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} required />
            <Input label="Last Name" value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} required />
          </div>
          <Input label="Phone" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          <Input label="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          <Select label="Employee Type" value={form.employee_type} onChange={e => setForm(f => ({ ...f, employee_type: e.target.value }))}>
            <option value="hourly">Hourly</option>
            <option value="salary">Salary</option>
            <option value="flat_rate">Flat Rate</option>
            <option value="cash">Cash</option>
          </Select>
          <Input label="Max Hours/Week" type="number" value={form.max_hours_per_week} onChange={e => setForm(f => ({ ...f, max_hours_per_week: Number(e.target.value) }))} />
          <Input label="Hire Date" type="date" value={form.hire_date} onChange={e => setForm(f => ({ ...f, hire_date: e.target.value }))} />
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button className="flex-1" loading={loading} onClick={handleAdd}>Add Employee</Button>
          </div>
        </div>
      </Modal>
    </ManagerLayout>
  );
}
