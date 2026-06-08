import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { generateSchedule } from '@/lib/scheduler';

export async function POST(req: NextRequest) {
  const { week_start, week_end } = await req.json();
  const db = getDb();

  const pending = db.prepare(`
    SELECT COUNT(*) as cnt FROM pto_requests
    WHERE status = 'pending' AND start_date <= ? AND end_date >= ?
  `).get(week_end, week_start) as any;
  if (pending.cnt > 0) {
    return NextResponse.json(
      { error: `Cannot generate schedule: ${pending.cnt} pending PTO request(s) overlap this period.` },
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

  const employees = db.prepare('SELECT * FROM employees WHERE active = 1').all() as any[];
  for (const emp of employees) {
    emp.departments = db.prepare('SELECT ed.*, d.name as department_name FROM employee_departments ed JOIN departments d ON ed.department_id = d.id WHERE ed.employee_id = ?').all(emp.id);
    emp.availability = db.prepare('SELECT * FROM availability_rules WHERE employee_id = ?').all(emp.id);
    emp.overrides = db.prepare('SELECT * FROM availability_overrides WHERE employee_id = ? AND date BETWEEN ? AND ?').all(emp.id, week_start, week_end);
    emp.approvedPTO = db.prepare("SELECT * FROM pto_requests WHERE employee_id = ? AND status = 'approved' AND start_date <= ? AND end_date >= ?").all(emp.id, week_end, week_start);
  }

  const coverageRules = db.prepare(`
    SELECT dcr.*, d.name as department_name, sd.start_time, sd.end_time
    FROM departments_coverage_rules dcr
    JOIN departments d ON dcr.department_id = d.id
    LEFT JOIN shift_definitions sd ON sd.name = dcr.shift_type AND sd.department_id = dcr.department_id
    WHERE sd.id IS NOT NULL
  `).all() as any[];

  const storeRulesRaw = db.prepare('SELECT * FROM store_rules').all() as any[];
  const storeRules: Record<string, string> = {};
  for (const r of storeRulesRaw) storeRules[r.rule_key] = r.rule_value;

  const { shifts, warnings } = generateSchedule(employees, coverageRules, dates, storeRules);

  const existing = db.prepare('SELECT id FROM schedules WHERE week_start = ?').get(week_start) as any;
  let scheduleId: number;
  if (existing) {
    db.prepare('DELETE FROM schedule_shifts WHERE schedule_id = ?').run(existing.id);
    db.prepare("UPDATE schedules SET status='draft', generated_at=CURRENT_TIMESTAMP WHERE id=?").run(existing.id);
    scheduleId = existing.id;
  } else {
    const res = db.prepare('INSERT INTO schedules (week_start, week_end) VALUES (?, ?)').run(week_start, week_end);
    scheduleId = res.lastInsertRowid as number;
  }

  const insertShift = db.prepare('INSERT INTO schedule_shifts (schedule_id, employee_id, department_id, date, start_time, end_time, position, hours_worked) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  for (const s of shifts) {
    insertShift.run(scheduleId, s.employee_id, s.department_id, s.date, s.start_time, s.end_time, s.position, s.hours);
  }

  return NextResponse.json({ scheduleId, shiftCount: shifts.length, warnings });
}
