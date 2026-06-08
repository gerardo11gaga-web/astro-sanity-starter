export const prerender = false;

import type { APIRoute } from 'astro';
import { writeClient } from '../../../utils/sanity-write-client';

export const GET: APIRoute = async ({ url }) => {
  try {
    const employeeId = url.searchParams.get('employeeId');
    let filter = `_type == "notification"`;
    if (employeeId) filter += ` && recipient._ref == "${employeeId}"`;

    const notifications = await writeClient.fetch(
      `*[${filter}] | order(createdAt desc) { _id, type, message, isRead, relatedDocument, createdAt, recipient->{ _id, name } }`
    );
    return new Response(JSON.stringify(notifications), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
