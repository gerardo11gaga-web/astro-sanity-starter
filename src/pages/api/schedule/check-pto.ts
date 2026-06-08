export const prerender = false;

import type { APIRoute } from 'astro';
import { writeClient } from '../../../utils/sanity-write-client';

export const GET: APIRoute = async ({ url }) => {
  try {
    const weekStart = url.searchParams.get('weekStart');
    const weekEnd = url.searchParams.get('weekEnd');

    if (!weekStart || !weekEnd) {
      return new Response(JSON.stringify({ error: 'weekStart and weekEnd required' }), { status: 400 });
    }

    const pending = await writeClient.fetch(
      `*[_type == "ptoRequest" && status == "pending" && startDate <= $weekEnd && endDate >= $weekStart]{ _id }`,
      { weekStart, weekEnd }
    );

    return new Response(JSON.stringify({ hasPending: pending.length > 0, pendingCount: pending.length }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
