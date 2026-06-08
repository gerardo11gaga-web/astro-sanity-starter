import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  return NextResponse.json(getDb().prepare(`
    SELECT dcr.*, d.name as department_name FROM departments_coverage_rules dcr
    JOIN departments d ON dcr.department_id = d.id ORDER BY dcr.day_of_week, d.name
  `).all());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const db = getDb();
  const result = db.prepare('INSERT INTO departments_coverage_rules (department_id, day_of_week, shift_type, minimum_staff) VALUES (?, ?, ?, ?)')
    .run(body.department_id, body.day_of_week, body.shift_type, body.minimum_staff || 1);
  return NextResponse.json({ id: result.lastInsertRowid });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  getDb().prepare('DELETE FROM departments_coverage_rules WHERE id = ?').run(id);
  return NextResponse.json({ success: true });
}
