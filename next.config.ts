import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'kyufyxtzlujvkdtyqrfm.supabase.co',
      },
    ],
  },
    experimental: {
      serverActions: {
      bodySizeLimit: '5mb', // 必要に応じて値を変更
      },
      },
};

export default nextConfig;
