// Netlify Scheduled Function — runs every Thursday at 8 AM UTC
// Schedule: "0 8 * * 4"

import type { Config } from '@netlify/functions';

export const config: Config = {
  schedule: '0 8 * * 4',
};

export default async function handler() {
  const baseUrl = process.env.URL || 'http://localhost:3000';

  try {
    const res = await fetch(`${baseUrl}/api/cron/thursday-check`, { method: 'POST' });
    const data = await res.json();
    console.log('[thursday-check]', data);
    return { statusCode: 200, body: JSON.stringify(data) };
  } catch (err: any) {
    console.error('[thursday-check] error:', err.message);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
