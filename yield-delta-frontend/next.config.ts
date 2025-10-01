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
  
  // Aggressive webpack optimization for build speed
  webpack: (config, { isServer }) => {
    // Reduce bundle analysis overhead
    config.infrastructureLogging = { level: 'error' };
    config.stats = 'errors-only';
    
    // Cloudflare-specific optimizations
    const isCloudflare = process.env.NEXT_PUBLIC_CLOUDFLARE_BUILD === 'true' || 
                        process.env.CF_PAGES === '1';
    
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
      
      // Remove GSAP externalization since it's needed at runtime
      // config.externals = config.externals || {};
      // config.externals = {
      //   ...config.externals,
      //   'three': 'three',
      //   'gsap': 'gsap',
      // };
    }
    
    // Disable problematic optimizations for Cloudflare compatibility
    config.optimization = {
      ...config.optimization,
      minimize: false, // Disable minification to prevent concatenation issues
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
        },
      },
    };
    
    // Additional Cloudflare-specific optimizations
    if (isCloudflare) {
      console.log('🔧 Applying Cloudflare-specific webpack optimizations...');
      
      // More conservative optimization settings for Cloudflare
      config.optimization.usedExports = false;
      config.optimization.sideEffects = false;
      config.optimization.concatenateModules = false;
      
      // Disable problematic plugins
      config.plugins = config.plugins.filter((plugin: any) => {
        return plugin.constructor.name !== 'ModuleConcatenationPlugin';
      });
    }

    // Fix for esbuild bundling issues in Cloudflare
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

    // Add custom plugin to fix concatenation issues (only if available)
    try {
      const FixConcatenationPlugin = require('./webpack-plugins/fix-concatenation-plugin');
      config.plugins = config.plugins || [];
      config.plugins.push(new FixConcatenationPlugin());
    } catch (error) {
      console.warn('⚠️  FixConcatenationPlugin not available, will rely on postbuild script');
    }
    
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
  
  // Output configuration for Cloudflare Pages
  output: 'export',
  trailingSlash: true,
}

export default nextConfig