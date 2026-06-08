export const prerender = false;

import type { APIRoute } from 'astro';
import { writeClient } from '../../../../utils/sanity-write-client';

export const POST: APIRoute = async ({ params }) => {
  try {
    const id = params.id!;

    const schedule = await writeClient.fetch(`*[_id == $id][0]{ status }`, { id });
    if (!schedule) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    if (schedule.status !== 'approved') {
      return new Response(JSON.stringify({ error: 'Schedule must be approved before publishing' }), { status: 409 });
    }

    await writeClient.patch(id).set({ status: 'published', publishedAt: new Date().toISOString() }).commit();
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
