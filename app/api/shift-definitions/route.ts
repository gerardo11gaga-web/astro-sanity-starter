import { NextRequest, NextResponse } from 'next/server';
import { query, run, ensureInit } from '@/lib/db';

export async function GET() {
  await ensureInit();
  const rows = await query('SELECT sd.*, d.name as department_name FROM shift_definitions sd LEFT JOIN departments d ON sd.department_id = d.id ORDER BY sd.start_time');
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  await ensureInit();
  const body = await req.json();
  const result = await run(
    'INSERT INTO shift_definitions (name, start_time, end_time, department_id) VALUES (?, ?, ?, ?)',
    [body.name, body.start_time, body.end_time, body.department_id || null]
  );
  return NextResponse.json({ id: result.lastInsertRowid });
}

export async function DELETE(req: NextRequest) {
  await ensureInit();
  const { id } = await req.json();
  await run('DELETE FROM shift_definitions WHERE id = ?', [id]);
  return NextResponse.json({ success: true });
}
