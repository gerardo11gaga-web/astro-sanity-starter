import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const emp = db.prepare('SELECT * FROM employees WHERE id = ?').get(id);
  if (!emp) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const departments = db.prepare(`
    SELECT ed.*, d.name as department_name FROM employee_departments ed
    JOIN departments d ON ed.department_id = d.id WHERE ed.employee_id = ?
  `).all(id);
  const availability = db.prepare('SELECT * FROM availability_rules WHERE employee_id = ? ORDER BY day_of_week').all(id);
  return NextResponse.json({ ...(emp as object), departments, availability });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const db = getDb();
  db.prepare(`UPDATE employees SET first_name=?, last_name=?, phone=?, email=?, employee_type=?, max_hours_per_week=?, hire_date=?, notes=?, active=? WHERE id=?`)
    .run(body.first_name, body.last_name, body.phone, body.email, body.employee_type, body.max_hours_per_week, body.hire_date, body.notes, body.active ?? 1, id);
  return NextResponse.json({ success: true });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  getDb().prepare('UPDATE employees SET active = 0 WHERE id = ?').run(id);
  return NextResponse.json({ success: true });
}
