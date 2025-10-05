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
      global: require.resolve('./src/lib/global-polyfill.js'),
      // MetaMask SDK fallbacks
      '@react-native-async-storage/async-storage': false,
    };

    // Enhanced global polyfills for SSR and build process
    config.plugins.push(
      new webpack.DefinePlugin({
        'typeof self': JSON.stringify('object'),
        'typeof window': JSON.stringify('object'),
        'process.browser': JSON.stringify(false),
        'self': isServer ? 'global' : 'self',
        'window': isServer ? 'global' : 'window',
      })
    );

    // Inject polyfills at the very beginning of each entry point
    config.plugins.push(
      new webpack.ProvidePlugin({
        // Provide global references for packages that need them
        global: require.resolve('./src/lib/global-polyfill.js'),
        Buffer: ['buffer', 'Buffer'],
        process: 'process/browser',
        self: require.resolve('./src/lib/global-polyfill.js'),
      })
    );

    // CRITICAL: Inject self polyfill at the module level for all JS chunks only
    config.plugins.push(
      new webpack.BannerPlugin({
        banner: '(function() { if (typeof global !== "undefined" && typeof global.self === "undefined") { global.self = global; global.window = global; } if (typeof self === "undefined") { var self = (typeof global !== "undefined") ? global : this; } })();',
        raw: true,
        entryOnly: false,
        test: /\.js$/,
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