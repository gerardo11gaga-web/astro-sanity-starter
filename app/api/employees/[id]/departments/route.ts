import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { department_id, pay_rate } = await req.json();
  const db = getDb();
  db.prepare('INSERT OR REPLACE INTO employee_departments (employee_id, department_id, pay_rate) VALUES (?, ?, ?)')
    .run(id, department_id, pay_rate || 0);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { department_id } = await req.json();
  getDb().prepare('DELETE FROM employee_departments WHERE employee_id = ? AND department_id = ?').run(id, department_id);
  return NextResponse.json({ success: true });
}
