export const prerender = false;

import type { APIRoute } from 'astro';
import { writeClient } from '../../../../utils/sanity-write-client';

export const POST: APIRoute = async ({ params }) => {
  try {
    const id = params.id!;
    await writeClient.patch(id).set({ isRead: true }).commit();
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
