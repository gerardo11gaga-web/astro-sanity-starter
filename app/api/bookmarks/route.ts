import { NextRequest, NextResponse } from 'next/server';
import { query, run, ensureInit } from '@/lib/db';

export async function GET() {
  await ensureInit();
  const rows = await query('SELECT * FROM bookmarks ORDER BY sort_order, id');
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  await ensureInit();
  const body = await req.json();
  const result = await run(
    'INSERT INTO bookmarks (title, url, icon, color, sort_order) VALUES (?, ?, ?, ?, ?)',
    [body.title, body.url, body.icon || '🔗', body.color || '#6366f1', body.sort_order ?? 99]
  );
  return NextResponse.json({ id: result.lastInsertRowid });
}

export async function PUT(req: NextRequest) {
  await ensureInit();
  const body = await req.json();
  await run(
    'UPDATE bookmarks SET title=?, url=?, icon=?, color=?, sort_order=? WHERE id=?',
    [body.title, body.url, body.icon, body.color, body.sort_order, body.id]
  );
  return NextResponse.json({ success: true });
}
