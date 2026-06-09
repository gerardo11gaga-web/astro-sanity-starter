import { NextRequest, NextResponse } from 'next/server';
import { run, ensureInit } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await ensureInit();
  const { id } = await params;
  const body = await req.json();
  const result = await run(
    `INSERT INTO schedule_shifts (schedule_id, employee_id, department_id, date, start_time, end_time, position, notes, hours_worked)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, body.employee_id, body.department_id || null, body.date, body.start_time, body.end_time, body.position || null, body.notes || null, body.hours_worked || null]
  );
  return NextResponse.json({ id: result.lastInsertRowid });
}

export async function PUT(req: NextRequest) {
  await ensureInit();
  const body = await req.json();
  await run(
    `UPDATE schedule_shifts SET employee_id=?, department_id=?, start_time=?, end_time=?, position=?, notes=? WHERE id=?`,
    [body.employee_id, body.department_id, body.start_time, body.end_time, body.position, body.notes, body.shift_id]
  );
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  await ensureInit();
  const { shift_id } = await req.json();
  await run('DELETE FROM schedule_shifts WHERE id = ?', [shift_id]);
  return NextResponse.json({ success: true });
}
