export const prerender = false;

import type { APIRoute } from 'astro';
import { writeClient } from '../../../../utils/sanity-write-client';

export const POST: APIRoute = async ({ params, request }) => {
  try {
    const id = params.id!;
    const body = await request.json().catch(() => ({}));
    const managerNotes = body.managerNotes || '';

    const pto = await writeClient.fetch(`*[_id == $id][0]{ _id, startDate, endDate, employee->{ _id } }`, { id });
    if (!pto) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });

    await writeClient.patch(id).set({ status: 'approved', managerNotes }).commit();

    // Create availability override blocking those dates
    const dates = getDatesInRange(pto.startDate, pto.endDate);
    for (const date of dates) {
      await writeClient.create({
        _type: 'availabilityOverride',
        employee: { _type: 'reference', _ref: pto.employee._id },
        date,
        isAvailable: false,
        reason: 'Approved PTO',
      });
    }

    // Notify employee
    await writeClient.create({
      _type: 'notification',
      recipient: { _type: 'reference', _ref: pto.employee._id },
      type: 'pto-approved',
      message: `Your PTO request for ${pto.startDate} to ${pto.endDate} has been approved.`,
      isRead: false,
      relatedDocument: { _type: 'ptoRequest', _id: id },
      createdAt: new Date().toISOString(),
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

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
