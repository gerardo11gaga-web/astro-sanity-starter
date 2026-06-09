import { NextRequest, NextResponse } from 'next/server';
import { query, run, ensureInit } from '@/lib/db';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await ensureInit();
  const { id } = await params;
  const scheduleRows = await query('SELECT * FROM schedules WHERE id = ?', [id]);
  const schedule = scheduleRows[0];
  if (!schedule) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const shifts = await query(`
    SELECT ss.*, e.first_name, e.last_name, d.name as department_name, d.color as department_color
    FROM schedule_shifts ss
    JOIN employees e ON ss.employee_id = e.id
    LEFT JOIN departments d ON ss.department_id = d.id
    WHERE ss.schedule_id = ?
    ORDER BY ss.date, ss.start_time
  `, [id]);
  return NextResponse.json({ ...schedule, shifts });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await ensureInit();
  const { id } = await params;
  const { status } = await req.json();
  if (status === 'approved') {
    await run("UPDATE schedules SET status='approved', approved_at=CURRENT_TIMESTAMP WHERE id=?", [id]);
  } else if (status === 'published') {
    await run("UPDATE schedules SET status='published', published_at=CURRENT_TIMESTAMP WHERE id=?", [id]);
  }
  return NextResponse.json({ success: true });
}
