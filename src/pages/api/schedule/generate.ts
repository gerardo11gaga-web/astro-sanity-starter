export const prerender = false;

import type { APIRoute } from 'astro';
import { writeClient } from '../../../utils/sanity-write-client';
import { generateSchedule } from '../../../utils/scheduleGenerator';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { weekStart, weekEnd } = await request.json();

    if (!weekStart || !weekEnd) {
      return new Response(JSON.stringify({ error: 'weekStart and weekEnd required' }), { status: 400 });
    }

    // Final PTO check before generation
    const pendingPTO = await writeClient.fetch(
      `*[_type == "ptoRequest" && status == "pending" && startDate <= $weekEnd && endDate >= $weekStart]{ _id }`,
      { weekStart, weekEnd }
    );

    if (pendingPTO.length > 0) {
      return new Response(
        JSON.stringify({ error: 'Cannot generate schedule: pending PTO requests exist for this period', pendingCount: pendingPTO.length }),
        { status: 409 }
      );
    }

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

    return new Response(
      JSON.stringify({ success: true, scheduleId: schedule._id, warnings: result.warnings }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
