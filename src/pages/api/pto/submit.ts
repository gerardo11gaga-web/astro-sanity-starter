export const prerender = false;

import type { APIRoute } from 'astro';
import { writeClient } from '../../../utils/sanity-write-client';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { employeeId, requestType, startDate, endDate, reason } = body;

    if (!employeeId || !requestType || !startDate || !endDate) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    const ptoRequest = await writeClient.create({
      _type: 'ptoRequest',
      employee: { _type: 'reference', _ref: employeeId },
      requestType,
      startDate,
      endDate,
      reason: reason || '',
      status: 'pending',
      submissionDate: new Date().toISOString(),
    });

    // Find managers to notify
    const managers = await writeClient.fetch(`*[_type == "employee" && role == "manager"]{ _id, name }`);

    for (const manager of managers) {
      await writeClient.create({
        _type: 'notification',
        recipient: { _type: 'reference', _ref: manager._id },
        type: 'pto-submitted',
        message: `New PTO request submitted for ${startDate} to ${endDate}.`,
        isRead: false,
        relatedDocument: { _type: 'ptoRequest', _id: ptoRequest._id },
        createdAt: new Date().toISOString(),
      });
    }

    return new Response(JSON.stringify({ success: true, id: ptoRequest._id }), { status: 201 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
