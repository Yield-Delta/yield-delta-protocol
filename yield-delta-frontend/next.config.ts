import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Minimal config for stable production builds
  reactStrictMode: false, // Disable for faster builds
  transpilePackages: ['@sei-js/core'],
  
  // Basic environment variables
  env: {
    SEI_CHAIN_ID: '713715',
    SEI_RPC_URL: 'https://evm-rpc-arctic-1.sei-apis.com',
    API_VERSION: '1.0.0',
  },
  
  // Aggressive webpack optimization for build speed
  webpack: (config, { isServer }) => {
    // Reduce bundle analysis overhead
    config.infrastructureLogging = { level: 'error' };
    config.stats = 'errors-only';
    
    // Exclude heavy 3D libraries from initial bundle
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
      };
      
      // Externalize heavy libraries for faster builds
      config.externals = config.externals || {};
      config.externals = {
        ...config.externals,
        'three': 'three',
        'gsap': 'gsap',
      };
    }
    
    // Reduce memory usage
    config.optimization = {
      ...config.optimization,
      minimize: false, // Disable minification for faster builds
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
        },
      },
    };
    
    return config;
  },

  // Disable experimental features for stability
  experimental: {
    optimizeCss: false,
  },
  
  // Basic images config
  images: {
    unoptimized: true, // Disable image optimization for faster builds
  },
}

export default nextConfig