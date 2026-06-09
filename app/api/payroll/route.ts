import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { start_date, end_date } = await req.json();

  const shifts = await query(`
    SELECT ss.employee_id, ss.department_id, ss.hours_worked, ss.date,
           e.first_name, e.last_name, e.employee_type, e.max_hours_per_week,
           d.name as department_name,
           ed.pay_rate
    FROM schedule_shifts ss
    JOIN employees e ON ss.employee_id = e.id
    LEFT JOIN departments d ON ss.department_id = d.id
    LEFT JOIN employee_departments ed ON ed.employee_id = ss.employee_id AND ed.department_id = ss.department_id
    WHERE ss.date BETWEEN ? AND ?
    ORDER BY e.last_name, e.first_name, ss.date
  `, [start_date, end_date]) as any[];

  const byEmployee: Record<number, any> = {};
  for (const s of shifts) {
    if (!byEmployee[s.employee_id]) {
      byEmployee[s.employee_id] = {
        employee_id: s.employee_id,
        name: `${s.first_name} ${s.last_name}`,
        employee_type: s.employee_type,
        departments: {},
        total_hours: 0,
        regular_hours: 0,
        overtime_hours: 0,
        gross_pay: 0,
      };
    }
    const emp = byEmployee[s.employee_id];
    const hours = s.hours_worked || 0;
    emp.total_hours += hours;
    if (!emp.departments[s.department_id]) {
      emp.departments[s.department_id] = { name: s.department_name, hours: 0, pay_rate: s.pay_rate || 0, subtotal: 0 };
    }
    emp.departments[s.department_id].hours += hours;
  }

  const overtimeThreshold = 40;
  for (const emp of Object.values(byEmployee) as any[]) {
    emp.regular_hours = Math.min(emp.total_hours, overtimeThreshold);
    emp.overtime_hours = Math.max(0, emp.total_hours - overtimeThreshold);
    for (const dept of Object.values(emp.departments) as any[]) {
      dept.subtotal = dept.hours * dept.pay_rate;
      emp.gross_pay += dept.subtotal;
    }
    emp.departments = Object.values(emp.departments);
  }

  return NextResponse.json({ employees: Object.values(byEmployee), start_date, end_date });
}
