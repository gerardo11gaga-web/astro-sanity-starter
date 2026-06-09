import { NextRequest, NextResponse } from 'next/server';
import { run, ensureInit } from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await ensureInit();
  const { id } = await params;
  const rules = await req.json();
  await run('DELETE FROM availability_rules WHERE employee_id = ?', [id]);
  for (const r of rules) {
    await run(
      'INSERT INTO availability_rules (employee_id, day_of_week, start_time, end_time, available, alternating) VALUES (?, ?, ?, ?, ?, ?)',
      [id, r.day_of_week, r.start_time || null, r.end_time || null, r.available ?? 1, r.alternating || 'none']
    );
  }
  return NextResponse.json({ success: true });
}
