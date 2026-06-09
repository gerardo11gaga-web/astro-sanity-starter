import { NextRequest, NextResponse } from 'next/server';
import { run, ensureInit } from '@/lib/db';

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await ensureInit();
  const { id } = await params;
  await run('DELETE FROM bookmarks WHERE id = ?', [id]);
  return NextResponse.json({ success: true });
}
