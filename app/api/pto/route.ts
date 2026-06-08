import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const employeeId = searchParams.get('employee_id');
  const db = getDb();
  let query = `SELECT p.*, e.first_name, e.last_name FROM pto_requests p JOIN employees e ON p.employee_id = e.id WHERE 1=1`;
  const queryParams: unknown[] = [];
  if (status) { query += ' AND p.status = ?'; queryParams.push(status); }
  if (employeeId) { query += ' AND p.employee_id = ?'; queryParams.push(employeeId); }
  query += ' ORDER BY p.submission_date DESC';
  return NextResponse.json(db.prepare(query).all(...queryParams));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO pto_requests (employee_id, request_type, start_date, end_date, reason)
    VALUES (?, ?, ?, ?, ?)
  `).run(body.employee_id, body.request_type, body.start_date, body.end_date, body.reason || null);
  return NextResponse.json({ id: result.lastInsertRowid });
}
