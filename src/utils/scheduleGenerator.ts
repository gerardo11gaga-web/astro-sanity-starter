export interface Employee {
  _id: string;
  name: string;
  department?: string;
  maxHoursPerWeek?: number;
  qualifications?: string[];
  alternatingScheduleGroup?: string;
}

export interface PTORequest {
  _id: string;
  employee: { _ref: string };
  startDate: string;
  endDate: string;
  status: string;
}

export interface AvailabilityOverride {
  _id: string;
  employee: { _ref: string };
  date: string;
  isAvailable: boolean;
  startTime?: string;
  endTime?: string;
}

export interface Availability {
  _id: string;
  employee: { _ref: string };
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
}

export interface Shift {
  _key?: string;
  employee: { _ref: string; _type: string };
  date: string;
  startTime: string;
  endTime: string;
  department: string;
  position: string;
  notes?: string;
}

export interface Warning {
  type: 'overtime' | 'coverage-gap' | 'rule-violation';
  message: string;
  employeeId?: string;
  date?: string;
  department?: string;
}

export interface GenerationContext {
  weekStart: string;
  weekEnd: string;
  employees: Employee[];
  approvedPTO: PTORequest[];
  availabilityOverrides: AvailabilityOverride[];
  recurringAvailability: Availability[];
  existingShifts?: Shift[];
}

export interface GeneratedSchedule {
  shifts: Shift[];
  warnings: Warning[];
}

function getDatesInRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const current = new Date(start + 'T00:00:00Z');
  const endDate = new Date(end + 'T00:00:00Z');
  while (current <= endDate) {
    dates.push(current.toISOString().split('T')[0]);
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return dates;
}

function hoursFromTimes(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return (eh * 60 + em - (sh * 60 + sm)) / 60;
}

function isOnPTO(employeeId: string, date: string, approvedPTO: PTORequest[]): boolean {
  return approvedPTO.some((r) => {
    if (r.employee._ref !== employeeId) return false;
    return date >= r.startDate && date <= r.endDate;
  });
}

function getOverride(employeeId: string, date: string, overrides: AvailabilityOverride[]): AvailabilityOverride | undefined {
  return overrides.find((o) => o.employee._ref === employeeId && o.date === date);
}

function getRecurring(employeeId: string, dayOfWeek: number, recurring: Availability[]): Availability | undefined {
  return recurring.find((a) => a.employee._ref === employeeId && a.dayOfWeek === dayOfWeek && a.isRecurring);
}

export function generateSchedule(ctx: GenerationContext): GeneratedSchedule {
  const { weekStart, weekEnd, employees, approvedPTO, availabilityOverrides, recurringAvailability } = ctx;
  const dates = getDatesInRange(weekStart, weekEnd);
  const shifts: Shift[] = [];
  const warnings: Warning[] = [];
  const hoursWorked: Record<string, number> = {};

  employees.forEach((e) => { hoursWorked[e._id] = 0; });

  // Alternating schedule: group A works even ISO weeks, group B works odd weeks
  const weekNum = (() => {
    const d = new Date(weekStart + 'T00:00:00Z');
    const dayOfYear = Math.floor((d.getTime() - new Date(Date.UTC(d.getUTCFullYear(), 0, 1)).getTime()) / 86400000);
    return Math.ceil((dayOfYear + 1) / 7);
  })();

  for (const date of dates) {
    const dayOfWeek = new Date(date + 'T00:00:00Z').getUTCDay();
    const departmentMap: Record<string, string[]> = {};

    // Determine available employees for this date
    const availableEmployees = employees.filter((emp) => {
      // Check alternating group
      if (emp.alternatingScheduleGroup) {
        const groupIsA = emp.alternatingScheduleGroup.toLowerCase().includes('a');
        const groupIsB = emp.alternatingScheduleGroup.toLowerCase().includes('b');
        if (groupIsA && weekNum % 2 !== 1) return false;
        if (groupIsB && weekNum % 2 !== 0) return false;
      }

      if (isOnPTO(emp._id, date, approvedPTO)) return false;

      const override = getOverride(emp._id, date, availabilityOverrides);
      if (override) {
        return override.isAvailable;
      }

      const recurring = getRecurring(emp._id, dayOfWeek, recurringAvailability);
      // If no recurring availability defined, assume available Mon-Fri
      if (!recurring) {
        return dayOfWeek >= 1 && dayOfWeek <= 5;
      }
      return true;
    });

    if (availableEmployees.length === 0) {
      warnings.push({ type: 'coverage-gap', message: `No employees available on ${date}`, date });
      continue;
    }

    // Sort by hours worked (least first) for fairness
    availableEmployees.sort((a, b) => (hoursWorked[a._id] || 0) - (hoursWorked[b._id] || 0));

    // Assign shifts
    for (const emp of availableEmployees) {
      const maxHours = emp.maxHoursPerWeek || 40;
      if ((hoursWorked[emp._id] || 0) >= maxHours) {
        warnings.push({ type: 'overtime', message: `${emp.name} has reached max hours (${maxHours}) for this week`, employeeId: emp._id, date });
        continue;
      }

      const override = getOverride(emp._id, date, availabilityOverrides);
      const recurring = getRecurring(emp._id, dayOfWeek, recurringAvailability);

      let startTime = '09:00';
      let endTime = '17:00';

      if (override?.isAvailable && override.startTime && override.endTime) {
        startTime = override.startTime;
        endTime = override.endTime;
      } else if (recurring) {
        startTime = recurring.startTime;
        endTime = recurring.endTime;
      }

      const shiftHours = hoursFromTimes(startTime, endTime);
      const newTotal = (hoursWorked[emp._id] || 0) + shiftHours;

      if (newTotal > maxHours) {
        warnings.push({ type: 'overtime', message: `${emp.name} would exceed max hours on ${date}`, employeeId: emp._id, date });
        continue;
      }

      const dept = emp.department || 'General';
      departmentMap[dept] = departmentMap[dept] || [];
      departmentMap[dept].push(emp._id);

      shifts.push({
        _key: `${emp._id}-${date}`,
        employee: { _ref: emp._id, _type: 'reference' },
        date,
        startTime,
        endTime,
        department: dept,
        position: emp.qualifications?.[0] || 'General',
      });

      hoursWorked[emp._id] = newTotal;
    }

    // Check coverage per department
    const uniqueDepts = [...new Set(employees.map((e) => e.department || 'General'))];
    for (const dept of uniqueDepts) {
      const covered = departmentMap[dept]?.length || 0;
      if (covered === 0) {
        warnings.push({ type: 'coverage-gap', message: `No coverage for department "${dept}" on ${date}`, date, department: dept });
      }
    }
  }

  return { shifts, warnings };
}
