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
        stream: require.resolve('stream-browserify'),
        crypto: require.resolve('crypto-browserify'),
        path: require.resolve('path-browserify'),
        os: require.resolve('os-browserify/browser'),
        https: require.resolve('https-browserify'),
      };
      
      // Externalize heavy libraries for faster builds
      config.externals = config.externals || {};
      config.externals = {
        ...config.externals,
        'three': 'three',
        'gsap': 'gsap',
      };
    }
    
    // Reduce memory usage and improve compatibility
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

    // Fix for esbuild bundling issues in Cloudflare
    config.resolve.alias = {
      ...config.resolve.alias,
      'stream': 'stream-browserify',
      'crypto': 'crypto-browserify',
      'path': 'path-browserify',
      'os': 'os-browserify/browser',
      'https': 'https-browserify'
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