import { NextRequest, NextResponse } from 'next/server';
import { query, run } from '@/lib/db';

export async function GET() {
  const rows = await query('SELECT * FROM departments ORDER BY name');
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const { name, color } = await req.json();
  const result = await run('INSERT INTO departments (name, color) VALUES (?, ?)', [name, color || '#6366f1']);
  return NextResponse.json({ id: result.lastInsertRowid });
}

export async function PUT(req: NextRequest) {
  const { id, name, color } = await req.json();
  await run('UPDATE departments SET name=?, color=? WHERE id=?', [name, color, id]);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await run('DELETE FROM departments WHERE id = ?', [id]);
  return NextResponse.json({ success: true });
}
