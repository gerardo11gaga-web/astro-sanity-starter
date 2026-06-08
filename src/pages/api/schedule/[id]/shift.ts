export const prerender = false;

import type { APIRoute } from 'astro';
import { writeClient } from '../../../../utils/sanity-write-client';

// POST = add shift, PUT = update shift, DELETE = remove shift
export const POST: APIRoute = async ({ params, request }) => {
  try {
    const id = params.id!;
    const shift = await request.json();
    const key = `${shift.employee?._ref || 'emp'}-${shift.date}-${Date.now()}`;
    await writeClient.patch(id).append('shifts', [{ ...shift, _key: key }]).commit();
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const id = params.id!;
    const { key, ...updates } = await request.json();
    const patch: Record<string, any> = {};
    for (const [k, v] of Object.entries(updates)) {
      patch[`shifts[_key=="${key}"].${k}`] = v;
    }
    await writeClient.patch(id).set(patch).commit();
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ params, request }) => {
  try {
    const id = params.id!;
    const { key } = await request.json();
    await writeClient.patch(id).unset([`shifts[_key=="${key}"]`]).commit();
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
