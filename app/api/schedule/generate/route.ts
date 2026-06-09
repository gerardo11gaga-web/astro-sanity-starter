import { NextRequest, NextResponse } from 'next/server';
import { query, run, ensureInit } from '@/lib/db';
import { generateSchedule } from '@/lib/scheduler';

export async function POST(req: NextRequest) {
  await ensureInit();
  const { week_start, week_end } = await req.json();

  const pendingRows = await query(`
    SELECT COUNT(*) as cnt FROM pto_requests
    WHERE status = 'pending' AND start_date <= ? AND end_date >= ?
  `, [week_end, week_start]);
  const cnt = (pendingRows[0]?.cnt as number) || 0;
  if (cnt > 0) {
    return NextResponse.json(
      { error: `Cannot generate schedule: ${cnt} pending PTO request(s) overlap this period.` },
      { status: 409 }
    );
  }

  const dates: string[] = [];
  const start = new Date(week_start + 'T12:00:00');
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }

  const employees = await query('SELECT * FROM employees WHERE active = 1') as any[];
  for (const emp of employees) {
    emp.departments = await query(
      'SELECT ed.*, d.name as department_name FROM employee_departments ed JOIN departments d ON ed.department_id = d.id WHERE ed.employee_id = ?',
      [emp.id]
    );
    emp.availability = await query('SELECT * FROM availability_rules WHERE employee_id = ?', [emp.id]);
    emp.overrides = await query(
      'SELECT * FROM availability_overrides WHERE employee_id = ? AND date BETWEEN ? AND ?',
      [emp.id, week_start, week_end]
    );
    emp.approvedPTO = await query(
      "SELECT * FROM pto_requests WHERE employee_id = ? AND status = 'approved' AND start_date <= ? AND end_date >= ?",
      [emp.id, week_end, week_start]
    );
  }

  const coverageRules = await query(`
    SELECT dcr.*, d.name as department_name, sd.start_time, sd.end_time
    FROM departments_coverage_rules dcr
    JOIN departments d ON dcr.department_id = d.id
    LEFT JOIN shift_definitions sd ON sd.name = dcr.shift_type AND sd.department_id = dcr.department_id
    WHERE sd.id IS NOT NULL
  `) as any[];

  const storeRulesRaw = await query('SELECT * FROM store_rules') as any[];
  const storeRules: Record<string, string> = {};
  for (const r of storeRulesRaw) storeRules[r.rule_key as string] = r.rule_value as string;

  const { shifts, warnings } = generateSchedule(employees, coverageRules, dates, storeRules);

  const existingRows = await query('SELECT id FROM schedules WHERE week_start = ?', [week_start]);
  const existing = existingRows[0] as any;
  let scheduleId: number;
  if (existing) {
    await run('DELETE FROM schedule_shifts WHERE schedule_id = ?', [existing.id]);
    await run("UPDATE schedules SET status='draft', generated_at=CURRENT_TIMESTAMP WHERE id=?", [existing.id]);
    scheduleId = existing.id as number;
  } else {
    const res = await run('INSERT INTO schedules (week_start, week_end) VALUES (?, ?)', [week_start, week_end]);
    scheduleId = res.lastInsertRowid as number;
  }

  for (const s of shifts) {
    await run(
      'INSERT INTO schedule_shifts (schedule_id, employee_id, department_id, date, start_time, end_time, position, hours_worked) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [scheduleId, s.employee_id, s.department_id, s.date, s.start_time, s.end_time, s.position, s.hours]
    );
  }

  return NextResponse.json({ scheduleId, shiftCount: shifts.length, warnings });
}
