import { NextRequest, NextResponse } from 'next/server';
import { query, ensureInit } from '@/lib/db';

export async function GET(req: NextRequest) {
  await ensureInit();
  const { searchParams } = new URL(req.url);
  const weekStart = searchParams.get('week_start');
  if (weekStart) {
    const rows = await query('SELECT * FROM schedules WHERE week_start = ? ORDER BY generated_at DESC LIMIT 1', [weekStart]);
    return NextResponse.json(rows[0] || null);
  }
  const rows = await query('SELECT * FROM schedules ORDER BY week_start DESC LIMIT 20');
  return NextResponse.json(rows);
}
