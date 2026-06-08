export const prerender = false;

import type { APIRoute } from 'astro';
import { writeClient } from '../../../utils/sanity-write-client';

export const GET: APIRoute = async ({ url }) => {
  try {
    const status = url.searchParams.get('status');
    const weekStart = url.searchParams.get('weekStart');
    const weekEnd = url.searchParams.get('weekEnd');

    let filter = `_type == "ptoRequest"`;
    if (status) filter += ` && status == "${status}"`;
    if (weekStart && weekEnd) {
      filter += ` && startDate <= "${weekEnd}" && endDate >= "${weekStart}"`;
    }

    const requests = await writeClient.fetch(
      `*[${filter}] | order(submissionDate desc) {
        _id, requestType, startDate, endDate, reason, status, submissionDate, managerNotes, clarificationMessage,
        employee->{ _id, name, email, department }
      }`
    );

    return new Response(JSON.stringify(requests), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
