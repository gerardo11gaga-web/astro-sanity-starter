import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  const db = getDb();
  const employees = db.prepare(`
    SELECT e.*, GROUP_CONCAT(d.name) as department_names
    FROM employees e
    LEFT JOIN employee_departments ed ON e.id = ed.employee_id
    LEFT JOIN departments d ON ed.department_id = d.id
    GROUP BY e.id ORDER BY e.first_name, e.last_name
  `).all();
  return NextResponse.json(employees);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO employees (first_name, last_name, phone, email, employee_type, max_hours_per_week, hire_date, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    body.first_name, body.last_name, body.phone || null, body.email || null,
    body.employee_type || 'hourly', body.max_hours_per_week || 40,
    body.hire_date || null, body.notes || null
  );
  return NextResponse.json({ id: result.lastInsertRowid });
}
