import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  env: {
    BASE_URL: process.env.BASE_URL,
    API_URL: process.env.API_URL,
    SUPPORT_LINK: process.env.SUPPORT_LINK,
    SESSION_PASSWORD: process.env.SESSION_PASSWORD
  }
};

export default nextConfig;
