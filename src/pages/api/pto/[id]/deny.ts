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

    await writeClient.patch(id).set({ status: 'denied', managerNotes }).commit();

    await writeClient.create({
      _type: 'notification',
      recipient: { _type: 'reference', _ref: pto.employee._id },
      type: 'pto-denied',
      message: `Your PTO request for ${pto.startDate} to ${pto.endDate} has been denied.${managerNotes ? ' Note: ' + managerNotes : ''}`,
      isRead: false,
      relatedDocument: { _type: 'ptoRequest', _id: id },
      createdAt: new Date().toISOString(),
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
