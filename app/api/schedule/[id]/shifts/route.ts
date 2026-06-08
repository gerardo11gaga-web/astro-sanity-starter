import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO schedule_shifts (schedule_id, employee_id, department_id, date, start_time, end_time, position, notes, hours_worked)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, body.employee_id, body.department_id || null, body.date, body.start_time, body.end_time, body.position || null, body.notes || null, body.hours_worked || null);
  return NextResponse.json({ id: result.lastInsertRowid });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const db = getDb();
  db.prepare(`UPDATE schedule_shifts SET employee_id=?, department_id=?, start_time=?, end_time=?, position=?, notes=? WHERE id=?`)
    .run(body.employee_id, body.department_id, body.start_time, body.end_time, body.position, body.notes, body.shift_id);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const { shift_id } = await req.json();
  getDb().prepare('DELETE FROM schedule_shifts WHERE id = ?').run(shift_id);
  return NextResponse.json({ success: true });
}
