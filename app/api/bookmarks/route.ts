import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  return NextResponse.json(getDb().prepare('SELECT * FROM bookmarks ORDER BY sort_order, id').all());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const db = getDb();
  const result = db.prepare('INSERT INTO bookmarks (title, url, icon, color, sort_order) VALUES (?, ?, ?, ?, ?)')
    .run(body.title, body.url, body.icon || '🔗', body.color || '#6366f1', body.sort_order || 99);
  return NextResponse.json({ id: result.lastInsertRowid });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  getDb().prepare('UPDATE bookmarks SET title=?, url=?, icon=?, color=?, sort_order=? WHERE id=?')
    .run(body.title, body.url, body.icon, body.color, body.sort_order, body.id);
  return NextResponse.json({ success: true });
}
