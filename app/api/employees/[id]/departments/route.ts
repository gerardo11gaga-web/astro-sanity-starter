import { NextRequest, NextResponse } from 'next/server';
import { run } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { department_id, pay_rate } = await req.json();
  await run(
    'INSERT OR REPLACE INTO employee_departments (employee_id, department_id, pay_rate) VALUES (?, ?, ?)',
    [id, department_id, pay_rate || 0]
  );
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { department_id } = await req.json();
  await run('DELETE FROM employee_departments WHERE employee_id = ? AND department_id = ?', [id, department_id]);
  return NextResponse.json({ success: true });
}
