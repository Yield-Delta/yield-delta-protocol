import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Minimal config for stable production builds
  reactStrictMode: false, // Disable for faster builds
  transpilePackages: ['@sei-js/core', 'gsap'],
  
  // Basic environment variables
  env: {
    SEI_CHAIN_ID: '713715',
    SEI_RPC_URL: 'https://evm-rpc-arctic-1.sei-apis.com',
    API_VERSION: '1.0.0',
  },
  
  // Simplified webpack config for Cloudflare Pages with Functions
  webpack: (config, { isServer }) => {
    // Basic polyfills for browser compatibility
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        stream: require.resolve('stream-browserify'),
        crypto: require.resolve('crypto-browserify'),
        path: require.resolve('path-browserify'),
        os: require.resolve('os-browserify/browser'),
        https: require.resolve('https-browserify'),
      };
    }

    // Fix for esbuild bundling issues
    config.resolve.alias = {
      ...config.resolve.alias,
      'stream': 'stream-browserify',
      'crypto': 'crypto-browserify',
      'path': 'path-browserify',
      'os': 'os-browserify/browser',
      'https': 'https-browserify',
    };

    // Add specific rules to handle problematic modules
    config.module.rules.push({
      test: /\.m?js$/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false,
      },
    });
    
    return config;
  },

  // Disable experimental features for Cloudflare compatibility
  experimental: {
    optimizeCss: false,
  },
  
  // Disable image optimization for Cloudflare compatibility
  images: {
    unoptimized: true,
  },
  
  // For Cloudflare Pages with Functions - use default SSR output
  trailingSlash: true,
}

export default nextConfig