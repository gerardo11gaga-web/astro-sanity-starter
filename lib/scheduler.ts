interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  max_hours_per_week: number;
  departments: { department_id: number; department_name: string; pay_rate: number }[];
  availability: { day_of_week: number; start_time: string; end_time: string; available: number; alternating: string }[];
  overrides: { date: string; available: number; start_time?: string; end_time?: string }[];
  approvedPTO: { start_date: string; end_date: string }[];
}

interface CoverageRule {
  department_id: number;
  department_name: string;
  day_of_week: number;
  shift_type: string;
  minimum_staff: number;
  start_time: string;
  end_time: string;
}

interface GeneratedShift {
  employee_id: number;
  department_id: number;
  date: string;
  start_time: string;
  end_time: string;
  position: string;
  hours: number;
}

interface ScheduleWarning {
  type: 'overtime' | 'coverage_gap' | 'rule_violation';
  message: string;
}

export interface ScheduleResult {
  shifts: GeneratedShift[];
  warnings: ScheduleWarning[];
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function isEmployeeAvailable(employee: Employee, dateStr: string): boolean {
  const date = new Date(dateStr + 'T12:00:00');
  const dayOfWeek = date.getDay();
  const weekNum = getWeekNumber(date);

  for (const pto of employee.approvedPTO) {
    if (dateStr >= pto.start_date && dateStr <= pto.end_date) return false;
  }

  const override = employee.overrides.find(o => o.date === dateStr);
  if (override) return override.available === 1;

  const avail = employee.availability.find(a => a.day_of_week === dayOfWeek);
  if (!avail || avail.available === 0) return false;

  if (avail.alternating === 'even' && weekNum % 2 !== 0) return false;
  if (avail.alternating === 'odd' && weekNum % 2 === 0) return false;

  return true;
}

function calcHours(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return (eh * 60 + em - sh * 60 - sm) / 60;
}

export function generateSchedule(
  employees: Employee[],
  coverageRules: CoverageRule[],
  weekDates: string[],
  storeRules: Record<string, string>
): ScheduleResult {
  const shifts: GeneratedShift[] = [];
  const warnings: ScheduleWarning[] = [];
  const employeeHours: Record<number, number> = {};
  const maxHours = Number(storeRules.max_hours_per_week || 40);
  const minBetween = Number(storeRules.min_hours_between_shifts || 8);

  for (const emp of employees) employeeHours[emp.id] = 0;

  for (const date of weekDates) {
    const dayOfWeek = new Date(date + 'T12:00:00').getDay();
    const dayRules = coverageRules.filter(r => r.day_of_week === dayOfWeek);

    for (const rule of dayRules) {
      const qualified = employees
        .filter(emp => {
          const inDept = emp.departments.some(d => d.department_id === rule.department_id);
          if (!inDept) return false;
          if (!isEmployeeAvailable(emp, date)) return false;
          if (employeeHours[emp.id] >= maxHours) return false;
          const prevDate = weekDates[weekDates.indexOf(date) - 1];
          if (prevDate) {
            const prevShift = shifts.find(s => s.employee_id === emp.id && s.date === prevDate);
            if (prevShift) {
              const prevEndH = Number(prevShift.end_time.split(':')[0]);
              const startH = Number(rule.start_time.split(':')[0]);
              if ((24 - prevEndH + startH) < minBetween) return false;
            }
          }
          return true;
        })
        .sort((a, b) => employeeHours[a.id] - employeeHours[b.id]);

      let assigned = 0;
      for (const emp of qualified) {
        if (assigned >= rule.minimum_staff) break;
        const hours = calcHours(rule.start_time, rule.end_time);
        if (employeeHours[emp.id] + hours > maxHours + 2) continue;
        shifts.push({
          employee_id: emp.id,
          department_id: rule.department_id,
          date,
          start_time: rule.start_time,
          end_time: rule.end_time,
          position: rule.shift_type,
          hours,
        });
        employeeHours[emp.id] += hours;
        if (employeeHours[emp.id] > maxHours) {
          warnings.push({ type: 'overtime', message: `${emp.first_name} ${emp.last_name} scheduled for ${employeeHours[emp.id].toFixed(1)} hours (overtime risk)` });
        }
        assigned++;
      }

      if (assigned < rule.minimum_staff) {
        warnings.push({ type: 'coverage_gap', message: `Coverage gap on ${date}: ${rule.department_name} ${rule.shift_type} needs ${rule.minimum_staff} but only ${assigned} available` });
      }
    }
  }

  return { shifts, warnings };
}
