import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  return NextResponse.json(getDb().prepare('SELECT * FROM store_rules ORDER BY rule_key').all());
}

export async function PUT(req: NextRequest) {
  const rules = await req.json();
  const db = getDb();
  const stmt = db.prepare('UPDATE store_rules SET rule_value = ? WHERE rule_key = ?');
  for (const r of rules) stmt.run(r.rule_value, r.rule_key);
  return NextResponse.json({ success: true });
}
