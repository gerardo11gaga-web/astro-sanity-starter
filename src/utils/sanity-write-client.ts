import { createClient } from '@sanity/client';
import { sanityConfig } from './sanity-client';

// Client with write token for mutations
export const writeClient = createClient({
  ...sanityConfig,
  token: process.env.SANITY_API_WRITE_TOKEN || import.meta.env.SANITY_API_WRITE_TOKEN || sanityConfig.token,
  useCdn: false,
});
