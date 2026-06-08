import { createClient, type ClientConfig, type SanityClient } from '@sanity/client';

const SANITY_PROJECT_ID = process.env.SANITY_PROJECT_ID || '';
const SANITY_DATASET = process.env.SANITY_DATASET || 'production';
const SANITY_TOKEN = process.env.SANITY_TOKEN || '';
const STACKBIT_PREVIEW = process.env.STACKBIT_PREVIEW || '';
const SANITY_PREVIEW_DRAFTS = process.env.SANITY_PREVIEW_DRAFTS || '';

const isDeployPreview = process.env.CONTEXT === 'deploy-preview';
const previewDrafts = STACKBIT_PREVIEW?.toLowerCase() === 'true' || SANITY_PREVIEW_DRAFTS?.toLowerCase() === 'true';

export const sanityConfig: ClientConfig = {
    projectId: SANITY_PROJECT_ID,
    dataset: SANITY_DATASET,
    useCdn: false,
    apiVersion: '2024-01-31',
    token: SANITY_TOKEN,
    perspective: isDeployPreview || previewDrafts ? 'previewDrafts' : 'published'
};

export const client = createClient(sanityConfig);
