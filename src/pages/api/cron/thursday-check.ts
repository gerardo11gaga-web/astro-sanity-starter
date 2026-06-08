export const prerender = false;

import type { APIRoute } from 'astro';
import { writeClient } from '../../../utils/sanity-write-client';
import { generateSchedule } from '../../../utils/scheduleGenerator';

export const POST: APIRoute = async () => {
  try {
    const today = new Date();
    // 4 = Thursday
    if (today.getUTCDay() !== 4) {
      return new Response(JSON.stringify({ message: 'Not Thursday, skipping' }), { status: 200 });
    }

    // Calculate next week's dates
    const daysUntilNextMonday = (8 - today.getUTCDay()) % 7 || 7;
    const nextMonday = new Date(today);
    nextMonday.setUTCDate(today.getUTCDate() + daysUntilNextMonday);
    const nextSunday = new Date(nextMonday);
    nextSunday.setUTCDate(nextMonday.getUTCDate() + 6);

    const weekStart = nextMonday.toISOString().split('T')[0];
    const weekEnd = nextSunday.toISOString().split('T')[0];

    // Check pending PTO
    const pendingPTO = await writeClient.fetch(
      `*[_type == "ptoRequest" && status == "pending" && startDate <= $weekEnd && endDate >= $weekStart]`,
      { weekStart, weekEnd }
    );

    const managers = await writeClient.fetch(`*[_type == "employee" && role == "manager"]{ _id }`);

    if (pendingPTO.length > 0) {
      for (const manager of managers) {
        await writeClient.create({
          _type: 'notification',
          recipient: { _type: 'reference', _ref: manager._id },
          type: 'schedule-blocked',
          message: `Schedule generation for week of ${weekStart} is blocked by ${pendingPTO.length} pending PTO request(s). Please review PTO requests before schedule can be generated.`,
          isRead: false,
          relatedDocument: { _type: 'ptoRequest', _id: pendingPTO[0]._id },
          createdAt: new Date().toISOString(),
        });
      }
      return new Response(JSON.stringify({ message: 'Pending PTO found, managers notified', pendingCount: pendingPTO.length }), { status: 200 });
    }

    // Generate schedule
    const [employees, approvedPTO, availabilityOverrides, recurringAvailability] = await Promise.all([
      writeClient.fetch(`*[_type == "employee"]{ _id, name, department, maxHoursPerWeek, qualifications, alternatingScheduleGroup }`),
      writeClient.fetch(
        `*[_type == "ptoRequest" && status == "approved" && startDate <= $weekEnd && endDate >= $weekStart]{ _id, employee, startDate, endDate, status }`,
        { weekStart, weekEnd }
      ),
      writeClient.fetch(
        `*[_type == "availabilityOverride" && date >= $weekStart && date <= $weekEnd]{ _id, employee, date, isAvailable, startTime, endTime }`,
        { weekStart, weekEnd }
      ),
      writeClient.fetch(`*[_type == "availability" && isRecurring == true]{ _id, employee, dayOfWeek, startTime, endTime, isRecurring }`),
    ]);

    const result = generateSchedule({ weekStart, weekEnd, employees, approvedPTO, availabilityOverrides, recurringAvailability });

    const schedule = await writeClient.create({
      _type: 'schedule',
      weekStartDate: weekStart,
      weekEndDate: weekEnd,
      status: 'draft',
      generatedAt: new Date().toISOString(),
      shifts: result.shifts,
    });

    for (const manager of managers) {
      await writeClient.create({
        _type: 'notification',
        recipient: { _type: 'reference', _ref: manager._id },
        type: 'schedule-generated',
        message: `Draft schedule for week of ${weekStart} has been automatically generated. Please review and approve.`,
        isRead: false,
        relatedDocument: { _type: 'schedule', _id: schedule._id },
        createdAt: new Date().toISOString(),
      });
    }

    return new Response(
      JSON.stringify({ message: 'Schedule generated', scheduleId: schedule._id, warnings: result.warnings }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
