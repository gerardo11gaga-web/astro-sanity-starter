'use client';
import { useState, useEffect } from 'react';
import { ManagerLayout } from '@/components/layout/ManagerLayout';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Plus, Trash2, Save } from 'lucide-react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function SettingsPage() {
  const [storeRules, setStoreRules] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [coverage, setCoverage] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [newShift, setNewShift] = useState({ name: '', start_time: '', end_time: '', department_id: '' });
  const [newCoverage, setNewCoverage] = useState({ department_id: '', day_of_week: '1', shift_type: '', minimum_staff: '1' });
  const [newDept, setNewDept] = useState({ name: '', color: '#9B2335' });

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    const [rulesRes, shiftsRes, coverageRes, deptRes] = await Promise.all([
      fetch('/api/store-rules'),
      fetch('/api/shift-definitions'),
      fetch('/api/coverage-rules'),
      fetch('/api/departments'),
    ]);
    if (rulesRes.ok) setStoreRules(await rulesRes.json());
    if (shiftsRes.ok) setShifts(await shiftsRes.json());
    if (coverageRes.ok) setCoverage(await coverageRes.json());
    if (deptRes.ok) setDepartments(await deptRes.json());
  }

  async function saveRules() {
    setSaving(true);
    await fetch('/api/store-rules', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(storeRules),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function addShift() {
    if (!newShift.name || !newShift.start_time || !newShift.end_time) return;
    await fetch('/api/shift-definitions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newShift),
    });
    setNewShift({ name: '', start_time: '', end_time: '', department_id: '' });
    fetchAll();
  }

  async function deleteShift(id: number) {
    await fetch('/api/shift-definitions', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchAll();
  }

  async function addCoverage() {
    if (!newCoverage.department_id || !newCoverage.shift_type) return;
    await fetch('/api/coverage-rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCoverage),
    });
    setNewCoverage({ department_id: '', day_of_week: '1', shift_type: '', minimum_staff: '1' });
    fetchAll();
  }

  async function deleteCoverage(id: number) {
    await fetch('/api/coverage-rules', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchAll();
  }

  async function addDept() {
    if (!newDept.name) return;
    await fetch('/api/departments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newDept),
    });
    setNewDept({ name: '', color: '#9B2335' });
    fetchAll();
  }

  async function deleteDept(id: number) {
    await fetch('/api/departments', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchAll();
  }

  return (
    <ManagerLayout title="Settings">
      <div className="max-w-4xl space-y-6">
        {/* Store Rules */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h3 className="font-semibold" style={{ color: 'var(--text)' }}>Store Rules</h3>
            <Button size="sm" onClick={saveRules} loading={saving}>
              <Save size={14} /> {saved ? 'Saved!' : 'Save Rules'}
            </Button>
          </CardHeader>
          <CardBody className="space-y-4">
            {storeRules.map((rule, idx) => (
              <div key={rule.id} className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                    {rule.rule_key.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{rule.description}</p>
                </div>
                <input
                  type="number"
                  value={rule.rule_value}
                  onChange={e => setStoreRules(prev => prev.map((r, i) => i === idx ? { ...r, rule_value: e.target.value } : r))}
                  style={{
                    width: '96px', padding: '0.375rem 0.75rem',
                    border: '1px solid var(--border)', borderRadius: '8px',
                    fontSize: '0.875rem', textAlign: 'right', outline: 'none',
                    background: 'var(--surface)', color: 'var(--text)',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                />
              </div>
            ))}
          </CardBody>
        </Card>

        {/* Departments */}
        <Card>
          <CardHeader><h3 className="font-semibold" style={{ color: 'var(--text)' }}>Departments</h3></CardHeader>
          <CardBody className="space-y-3">
            <div className="flex flex-wrap gap-2 mb-4">
              {departments.map(d => (
                <div key={d.id} style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.375rem 0.75rem', borderRadius: '9999px',
                  border: '1px solid var(--border)', background: 'var(--surface-alt)',
                }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: d.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text)' }}>{d.name}</span>
                  <button onClick={() => deleteDept(d.id)} style={{ color: 'var(--text-light)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--danger)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-light)')}>
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-3 items-end">
              <Input label="Department Name" value={newDept.name} onChange={e => setNewDept(f => ({ ...f, name: e.target.value }))} placeholder="New Department" className="flex-1" />
              <div className="flex flex-col gap-1">
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>Color</label>
                <input type="color" value={newDept.color} onChange={e => setNewDept(f => ({ ...f, color: e.target.value }))}
                  style={{ width: '40px', height: '40px', borderRadius: '8px', border: '1px solid var(--border)', cursor: 'pointer' }} />
              </div>
              <Button onClick={addDept}><Plus size={16} /> Add</Button>
            </div>
          </CardBody>
        </Card>

        {/* Shift Definitions */}
        <Card>
          <CardHeader><h3 className="font-semibold" style={{ color: 'var(--text)' }}>Shift Definitions</h3></CardHeader>
          <CardBody className="space-y-3">
            <div className="space-y-2">
              {shifts.map(s => (
                <div key={s.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.75rem', background: 'var(--surface-alt)', borderRadius: '8px',
                  border: '1px solid var(--border)',
                }}>
                  <div>
                    <span style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--text)' }}>{s.name}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginLeft: '0.5rem' }}>{s.start_time}–{s.end_time}</span>
                    {s.department_name && <Badge className="ml-2">{s.department_name}</Badge>}
                  </div>
                  <button onClick={() => deleteShift(s.id)} style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <Input label="Shift Name" value={newShift.name} onChange={e => setNewShift(f => ({ ...f, name: e.target.value }))} placeholder="Morning" />
              <Input label="Start Time" type="time" value={newShift.start_time} onChange={e => setNewShift(f => ({ ...f, start_time: e.target.value }))} />
              <Input label="End Time" type="time" value={newShift.end_time} onChange={e => setNewShift(f => ({ ...f, end_time: e.target.value }))} />
              <Select label="Department" value={newShift.department_id} onChange={e => setNewShift(f => ({ ...f, department_id: e.target.value }))}>
                <option value="">Any</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </Select>
            </div>
            <Button size="sm" onClick={addShift}><Plus size={14} /> Add Shift Definition</Button>
          </CardBody>
        </Card>

        {/* Coverage Rules */}
        <Card>
          <CardHeader><h3 className="font-semibold" style={{ color: 'var(--text)' }}>Coverage Rules</h3></CardHeader>
          <CardBody className="space-y-3">
            <div className="space-y-2">
              {coverage.map(c => (
                <div key={c.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.75rem', background: 'var(--surface-alt)', borderRadius: '8px',
                  border: '1px solid var(--border)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <Badge>{DAYS[c.day_of_week]}</Badge>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text)' }}>{c.department_name}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>— {c.shift_type}</span>
                    <Badge variant="info">min {c.minimum_staff}</Badge>
                  </div>
                  <button onClick={() => deleteCoverage(c.id)} style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <Select label="Department" value={newCoverage.department_id} onChange={e => setNewCoverage(f => ({ ...f, department_id: e.target.value }))}>
                <option value="">Select...</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </Select>
              <Select label="Day" value={newCoverage.day_of_week} onChange={e => setNewCoverage(f => ({ ...f, day_of_week: e.target.value }))}>
                {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
              </Select>
              <Select label="Shift Type" value={newCoverage.shift_type} onChange={e => setNewCoverage(f => ({ ...f, shift_type: e.target.value }))}>
                <option value="">Select shift...</option>
                {[...new Set(shifts.map(s => s.name))].map(name => (
                  <option key={name as string} value={name as string}>{name as string}</option>
                ))}
              </Select>
              <Input label="Min Staff" type="number" value={newCoverage.minimum_staff} onChange={e => setNewCoverage(f => ({ ...f, minimum_staff: e.target.value }))} min="1" />
            </div>
            <Button size="sm" onClick={addCoverage}><Plus size={14} /> Add Coverage Rule</Button>
          </CardBody>
        </Card>
      </div>
    </ManagerLayout>
  );
}
