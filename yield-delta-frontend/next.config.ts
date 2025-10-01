import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Basic config for Cloudflare Pages with Functions
  reactStrictMode: false,
  swcMinify: true,
  
  // Basic environment variables
  env: {
    SEI_CHAIN_ID: '1328',
    SEI_RPC_URL: 'https://evm-rpc-arctic-1.sei-apis.com',
    API_VERSION: '1.0.0',
  },
  
  // Simple webpack config
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        os: false,
        path: false,
      };
    }
    return config;
  },

  // Cloudflare compatibility
  images: {
    unoptimized: true,
  },
}

export default nextConfig