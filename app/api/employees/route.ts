import { NextRequest, NextResponse } from 'next/server';
import { query, run, ensureInit } from '@/lib/db';

export async function GET() {
  await ensureInit();
  const employees = await query(`
    SELECT e.*, GROUP_CONCAT(d.name) as department_names
    FROM employees e
    LEFT JOIN employee_departments ed ON e.id = ed.employee_id
    LEFT JOIN departments d ON ed.department_id = d.id
    GROUP BY e.id ORDER BY e.first_name, e.last_name
  `);
  return NextResponse.json(employees);
}

export async function POST(req: NextRequest) {
  await ensureInit();
  const body = await req.json();
  const result = await run(
    `INSERT INTO employees (first_name, last_name, phone, email, employee_type, max_hours_per_week, hire_date, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      body.first_name, body.last_name, body.phone || null, body.email || null,
      body.employee_type || 'hourly', body.max_hours_per_week || 40,
      body.hire_date || null, body.notes || null,
    ]
  );
  return NextResponse.json({ id: result.lastInsertRowid });
}
