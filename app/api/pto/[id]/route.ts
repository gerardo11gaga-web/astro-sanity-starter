import { NextRequest, NextResponse } from 'next/server';
import { query, run, ensureInit } from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await ensureInit();
  const { id } = await params;
  const { status, manager_notes } = await req.json();
  await run('UPDATE pto_requests SET status = ?, manager_notes = ? WHERE id = ?', [status, manager_notes || null, id]);

  if (status === 'approved') {
    const ptoRows = await query('SELECT * FROM pto_requests WHERE id = ?', [id]);
    const pto = ptoRows[0] as any;
    if (pto) {
      const start = new Date(pto.start_date + 'T12:00:00');
      const end = new Date(pto.end_date + 'T12:00:00');
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        await run(
          'INSERT OR REPLACE INTO availability_overrides (employee_id, date, available, reason) VALUES (?, ?, 0, ?)',
          [pto.employee_id, d.toISOString().split('T')[0], `PTO: ${pto.request_type}`]
        );
      }
    }
  }
  return NextResponse.json({ success: true });
}
