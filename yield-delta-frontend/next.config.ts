import type { NextConfig } from 'next'
import withNextra from 'nextra'

// Configure Nextra with basic options
const withNextraConfig = withNextra({
  // Basic Nextra configuration
})

const nextConfig: NextConfig = {
  // Basic config for Cloudflare Pages with Functions
  reactStrictMode: false,
  
  // Basic environment variables
  env: {
    SEI_CHAIN_ID: '1328',
    SEI_RPC_URL: 'https://evm-rpc-arctic-1.sei-apis.com',
    API_VERSION: '1.0.0',
  },
  
  // Headers for API responses and SEO
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=30, stale-while-revalidate=60' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        source: '/docs/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=300, stale-while-revalidate=600' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
    ]
  },
  
  // Simple webpack config with Nextra compatibility
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
  
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['nextra', 'nextra-theme-docs'],
  },
}

export default withNextraConfig(nextConfig)