'use client';
import { useState, useEffect } from 'react';
import { ManagerLayout } from '@/components/layout/ManagerLayout';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Textarea } from '@/components/ui/Input';
import { Table, Thead, Tbody, Th, Td } from '@/components/ui/Table';
import { CheckCircle, XCircle } from 'lucide-react';

export default function PTOQueuePage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [filter, setFilter] = useState('pending');
  const [selected, setSelected] = useState<any | null>(null);
  const [action, setAction] = useState<'approved' | 'denied' | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchRequests(); }, [filter]);

  async function fetchRequests() {
    const res = await fetch(`/api/pto${filter !== 'all' ? `?status=${filter}` : ''}`);
    if (res.ok) setRequests(await res.json());
  }

  async function handleDecision() {
    if (!selected || !action) return;
    setLoading(true);
    await fetch(`/api/pto/${selected.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: action, manager_notes: notes }),
    });
    setLoading(false);
    setSelected(null);
    setAction(null);
    setNotes('');
    fetchRequests();
  }

  const typeBadge = (t: string) => {
    const v: Record<string, any> = { vacation: 'info', sick: 'warning', personal: 'default', schedule_exception: 'danger' };
    return <Badge variant={v[t] || 'default'}>{t.replace('_', ' ')}</Badge>;
  };

  const statusBadge = (s: string) => {
    const v: Record<string, any> = { pending: 'pending', approved: 'approved', denied: 'denied' };
    return <Badge variant={v[s] || 'default'}>{s}</Badge>;
  };

  return (
    <ManagerLayout title="PTO Queue">
      <div className="max-w-6xl space-y-4">
        <div className="flex gap-2">
          {['pending', 'approved', 'denied', 'all'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 500,
                textTransform: 'capitalize', cursor: 'pointer', border: 'none', transition: 'all 0.15s',
                background: filter === s ? 'var(--primary)' : 'var(--surface)',
                color: filter === s ? 'white' : 'var(--text-muted)',
                boxShadow: filter === s ? 'none' : '0 0 0 1px var(--border)',
              }}
              onMouseEnter={e => { if (filter !== s) e.currentTarget.style.background = 'var(--surface-alt)'; }}
              onMouseLeave={e => { if (filter !== s) e.currentTarget.style.background = 'var(--surface)'; }}
            >
              {s}
            </button>
          ))}
        </div>

        <Table>
          <Thead>
            <tr>
              <Th>Employee</Th>
              <Th>Type</Th>
              <Th>Dates</Th>
              <Th>Reason</Th>
              <Th>Submitted</Th>
              <Th>Status</Th>
              {filter === 'pending' && <Th>Actions</Th>}
            </tr>
          </Thead>
          <Tbody>
            {requests.map((r, i) => (
              <tr key={r.id}
                style={{ background: i % 2 === 1 ? 'var(--surface-alt)' : 'var(--surface)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-alt)')}
                onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 1 ? 'var(--surface-alt)' : 'var(--surface)')}>
                <Td><span className="font-medium">{r.first_name} {r.last_name}</span></Td>
                <Td>{typeBadge(r.request_type)}</Td>
                <Td>{r.start_date} — {r.end_date}</Td>
                <Td className="max-w-[200px]">
                  <span style={{ color: 'var(--text-muted)' }} className="truncate block">{r.reason || '—'}</span>
                </Td>
                <Td>{new Date(r.submission_date).toLocaleDateString()}</Td>
                <Td>{statusBadge(r.status)}</Td>
                {filter === 'pending' && (
                  <Td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setSelected(r); setAction('approved'); }}
                        style={{ color: 'var(--success)', background: 'none', border: 'none', cursor: 'pointer' }}
                        title="Approve"
                      >
                        <CheckCircle size={18} />
                      </button>
                      <button
                        onClick={() => { setSelected(r); setAction('denied'); }}
                        style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer' }}
                        title="Deny"
                      >
                        <XCircle size={18} />
                      </button>
                    </div>
                  </Td>
                )}
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <Td colSpan={filter === 'pending' ? 7 : 6} className="text-center py-8" style={{ color: 'var(--text-light)' }}>
                  No requests found
                </Td>
              </tr>
            )}
          </Tbody>
        </Table>
      </div>

      <Modal
        open={!!selected && !!action}
        onClose={() => { setSelected(null); setAction(null); setNotes(''); }}
        title={action === 'approved' ? 'Approve PTO Request' : 'Deny PTO Request'}
      >
        {selected && (
          <div className="space-y-4">
            <div style={{ padding: '1rem', background: 'var(--surface-alt)', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <p className="font-medium" style={{ color: 'var(--text)' }}>{selected.first_name} {selected.last_name}</p>
              <p className="text-sm capitalize" style={{ color: 'var(--text-muted)' }}>{selected.request_type.replace('_', ' ')}: {selected.start_date} — {selected.end_date}</p>
              {selected.reason && <p className="text-sm mt-1" style={{ color: 'var(--text-light)' }}>Reason: {selected.reason}</p>}
            </div>
            <Textarea
              label="Manager Notes (optional)"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add any notes for the employee..."
              rows={3}
            />
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => { setSelected(null); setAction(null); }}>Cancel</Button>
              <Button
                className="flex-1"
                variant={action === 'approved' ? 'primary' : 'danger'}
                loading={loading}
                onClick={handleDecision}
              >
                {action === 'approved' ? 'Approve' : 'Deny'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </ManagerLayout>
  );
}
