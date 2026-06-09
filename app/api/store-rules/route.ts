import { NextRequest, NextResponse } from 'next/server';
import { query, run, ensureInit } from '@/lib/db';

export async function GET() {
  await ensureInit();
  const rows = await query('SELECT * FROM store_rules ORDER BY rule_key');
  return NextResponse.json(rows);
}

export async function PUT(req: NextRequest) {
  await ensureInit();
  const rules = await req.json();
  for (const r of rules) {
    await run('UPDATE store_rules SET rule_value = ? WHERE rule_key = ?', [r.rule_value, r.rule_key]);
  }
  return NextResponse.json({ success: true });
}
