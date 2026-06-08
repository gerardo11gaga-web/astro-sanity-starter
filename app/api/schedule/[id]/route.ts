import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const schedule = db.prepare('SELECT * FROM schedules WHERE id = ?').get(id);
  if (!schedule) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const shifts = db.prepare(`
    SELECT ss.*, e.first_name, e.last_name, d.name as department_name, d.color as department_color
    FROM schedule_shifts ss
    JOIN employees e ON ss.employee_id = e.id
    LEFT JOIN departments d ON ss.department_id = d.id
    WHERE ss.schedule_id = ?
    ORDER BY ss.date, ss.start_time
  `).all(id);
  return NextResponse.json({ ...(schedule as object), shifts });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { status } = await req.json();
  const db = getDb();
  if (status === 'approved') {
    db.prepare("UPDATE schedules SET status='approved', approved_at=CURRENT_TIMESTAMP WHERE id=?").run(id);
  } else if (status === 'published') {
    db.prepare("UPDATE schedules SET status='published', published_at=CURRENT_TIMESTAMP WHERE id=?").run(id);
  }
  return NextResponse.json({ success: true });
}
