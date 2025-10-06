import type { NextConfig } from 'next'
import createMDX from '@next/mdx'

const nextConfig: NextConfig = {
  // Production-optimized config for Cloudflare Pages
  output: 'export',
  trailingSlash: true,
  reactStrictMode: false,
  
  // Environment variables
  env: {
    SEI_CHAIN_ID: '1328',
    SEI_RPC_URL: 'https://evm-rpc-arctic-1.sei-apis.com',
    API_VERSION: '1.0.0',
  },
  
  // Headers disabled for static export
  // async headers() {
  //   return []
  // },
  
  // Simplified webpack config for DeFi protocol
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Basic performance optimizations (no 3D-specific chunks)
    config.optimization = {
      ...config.optimization,
      moduleIds: 'deterministic',
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          // UI libraries
          ui: {
            test: /[\\/]node_modules[\\/](@radix-ui|lucide-react|framer-motion)[\\/]/,
            name: 'ui',
            chunks: 'all',
            priority: 15,
          },
          // Blockchain libraries
          blockchain: {
            test: /[\\/]node_modules[\\/](@sei-js|viem|wagmi|ethers)[\\/]/,
            name: 'blockchain',
            chunks: 'all',
            priority: 15,
          },
          // Default vendor chunk
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
        },
      },
    };

    // Global polyfills for both client and server
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      http: false,
      https: false,
      os: false,
      path: false,
      // Critical: Provide 'global' module for packages that require it
      global: 'global',
      // MetaMask SDK fallbacks
      '@react-native-async-storage/async-storage': false,
    };

    // Simplified polyfills for SSR and build process
    config.plugins.push(
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process/browser',
      })
    );

    // For server-side builds, add externals and prepend polyfills
    if (isServer) {
      // Add externals to prevent problematic packages from being bundled on server
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push(
          // Packages that might reference 'self' and cause build issues
          '@metamask/sdk',
          '@dynamic-labs/sdk-react-core',
          'valtio',
          'use-sync-external-store'
        );
      }

      // Server polyfills removed - using webpack polyfills instead
    }

    // Client-side specific optimizations removed (no 3D dependencies)

    // Memory management
    config.infrastructureLogging = { level: 'error' };
    
    return config;
  },

  // Cloudflare Pages compatibility
  images: {
    unoptimized: true,
  },
  
  // Build optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Experimental features for performance
  experimental: {
    optimizePackageImports: [
      'nextra',
      'nextra-theme-docs',
      'lucide-react',
      '@radix-ui/react-accordion',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
    ],
    webpackBuildWorker: false,
    optimizeCss: false,
    mdxRs: true,
  },
  
  // MDX configuration
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
}

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
})

export default withMDX(nextConfig)