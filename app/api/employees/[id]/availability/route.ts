import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rules = await req.json(); // array of availability rules
  const db = getDb();
  db.prepare('DELETE FROM availability_rules WHERE employee_id = ?').run(id);
  const stmt = db.prepare('INSERT INTO availability_rules (employee_id, day_of_week, start_time, end_time, available, alternating) VALUES (?, ?, ?, ?, ?, ?)');
  for (const r of rules) {
    stmt.run(id, r.day_of_week, r.start_time || null, r.end_time || null, r.available ?? 1, r.alternating || 'none');
  }
  return NextResponse.json({ success: true });
}
