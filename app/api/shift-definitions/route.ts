import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  return NextResponse.json(getDb().prepare('SELECT sd.*, d.name as department_name FROM shift_definitions sd LEFT JOIN departments d ON sd.department_id = d.id ORDER BY sd.start_time').all());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const db = getDb();
  const result = db.prepare('INSERT INTO shift_definitions (name, start_time, end_time, department_id) VALUES (?, ?, ?, ?)')
    .run(body.name, body.start_time, body.end_time, body.department_id || null);
  return NextResponse.json({ id: result.lastInsertRowid });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  getDb().prepare('DELETE FROM shift_definitions WHERE id = ?').run(id);
  return NextResponse.json({ success: true });
}
