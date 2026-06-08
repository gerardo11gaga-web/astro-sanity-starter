import type { NextConfig } from 'next';

const config: NextConfig = {
  serverExternalPackages: ['better-sqlite3', 'bcryptjs'],
};

export default config;
