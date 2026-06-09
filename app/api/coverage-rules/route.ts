import { NextRequest, NextResponse } from 'next/server';
import { query, run } from '@/lib/db';

export async function GET() {
  const rows = await query(`
    SELECT dcr.*, d.name as department_name FROM departments_coverage_rules dcr
    JOIN departments d ON dcr.department_id = d.id ORDER BY dcr.day_of_week, d.name
  `);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await run(
    'INSERT INTO departments_coverage_rules (department_id, day_of_week, shift_type, minimum_staff) VALUES (?, ?, ?, ?)',
    [body.department_id, body.day_of_week, body.shift_type, body.minimum_staff ?? 1]
  );
  return NextResponse.json({ id: result.lastInsertRowid });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await run('DELETE FROM departments_coverage_rules WHERE id = ?', [id]);
  return NextResponse.json({ success: true });
}
