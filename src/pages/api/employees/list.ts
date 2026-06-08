export const prerender = false;

import type { APIRoute } from 'astro';
import { writeClient } from '../../../utils/sanity-write-client';

export const GET: APIRoute = async () => {
  try {
    const employees = await writeClient.fetch(
      `*[_type == "employee"] | order(name asc) { _id, name, email, role, department, maxHoursPerWeek, qualifications, alternatingScheduleGroup }`
    );
    return new Response(JSON.stringify(employees), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
