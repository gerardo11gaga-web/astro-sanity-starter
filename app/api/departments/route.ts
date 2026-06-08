import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  return NextResponse.json(getDb().prepare('SELECT * FROM departments ORDER BY name').all());
}

export async function POST(req: NextRequest) {
  const { name, color } = await req.json();
  const db = getDb();
  const result = db.prepare('INSERT INTO departments (name, color) VALUES (?, ?)').run(name, color || '#6366f1');
  return NextResponse.json({ id: result.lastInsertRowid });
}

export async function PUT(req: NextRequest) {
  const { id, name, color } = await req.json();
  getDb().prepare('UPDATE departments SET name=?, color=? WHERE id=?').run(name, color, id);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  getDb().prepare('DELETE FROM departments WHERE id = ?').run(id);
  return NextResponse.json({ success: true });
}
