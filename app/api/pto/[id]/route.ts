import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { status, manager_notes } = await req.json();
  const db = getDb();
  db.prepare('UPDATE pto_requests SET status = ?, manager_notes = ? WHERE id = ?').run(status, manager_notes || null, id);

  if (status === 'approved') {
    const pto = db.prepare('SELECT * FROM pto_requests WHERE id = ?').get(id) as any;
    if (pto) {
      const start = new Date(pto.start_date + 'T12:00:00');
      const end = new Date(pto.end_date + 'T12:00:00');
      const stmt = db.prepare('INSERT OR REPLACE INTO availability_overrides (employee_id, date, available, reason) VALUES (?, ?, 0, ?)');
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        stmt.run(pto.employee_id, d.toISOString().split('T')[0], `PTO: ${pto.request_type}`);
      }
    }
  }
  return NextResponse.json({ success: true });
}
