import { NextRequest, NextResponse } from 'next/server';
import { query, run, ensureInit } from '@/lib/db';

export async function GET(req: NextRequest) {
  await ensureInit();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const employeeId = searchParams.get('employee_id');
  let sql = `SELECT p.*, e.first_name, e.last_name FROM pto_requests p JOIN employees e ON p.employee_id = e.id WHERE 1=1`;
  const args: (string | number | null)[] = [];
  if (status) { sql += ' AND p.status = ?'; args.push(status); }
  if (employeeId) { sql += ' AND p.employee_id = ?'; args.push(employeeId); }
  sql += ' ORDER BY p.submission_date DESC';
  const rows = await query(sql, args);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  await ensureInit();
  const body = await req.json();
  const result = await run(
    `INSERT INTO pto_requests (employee_id, request_type, start_date, end_date, reason) VALUES (?, ?, ?, ?, ?)`,
    [body.employee_id, body.request_type, body.start_date, body.end_date, body.reason || null]
  );
  return NextResponse.json({ id: result.lastInsertRowid });
}
