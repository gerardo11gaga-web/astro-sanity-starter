import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const weekStart = searchParams.get('week_start');
  const db = getDb();
  if (weekStart) {
    const s = db.prepare('SELECT * FROM schedules WHERE week_start = ? ORDER BY generated_at DESC LIMIT 1').get(weekStart);
    return NextResponse.json(s || null);
  }
  return NextResponse.json(db.prepare('SELECT * FROM schedules ORDER BY week_start DESC LIMIT 20').all());
}
