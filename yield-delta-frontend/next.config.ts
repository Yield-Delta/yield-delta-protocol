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
  
  // Production-optimized webpack config for 3D libraries
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Performance optimizations
    config.optimization = {
      ...config.optimization,
      moduleIds: 'deterministic',
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          // Separate chunk for Three.js and 3D libraries
          threejs: {
            test: /[\\/]node_modules[\\/](three|@react-three)[\\/]/,
            name: 'threejs',
            chunks: 'all',
            priority: 20,
          },
          // Separate chunk for GSAP
          gsap: {
            test: /[\\/]node_modules[\\/]gsap[\\/]/,
            name: 'gsap',
            chunks: 'all',
            priority: 20,
          },
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
      // MetaMask SDK fallbacks
      '@react-native-async-storage/async-storage': false,
    };

    // Add global polyfills for SSR 
    config.plugins.push(
      new webpack.DefinePlugin({
        'global.self': 'global',
        'globalThis.self': 'globalThis',
      })
    );

    // Client-side specific optimizations
    if (!isServer) {
      
      // Fix Three.js imports for v0.178.0+
      config.resolve.alias = {
        ...config.resolve.alias,
        'three/examples/jsm': 'three/examples/jsm',
        'three$': 'three/src/Three.js',
      };
    }

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
      'three',
      '@react-three/fiber',
      '@react-three/drei',
      'gsap',
      'nextra',
      'nextra-theme-docs',
      'lucide-react',
      '@radix-ui/react-accordion',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
    ],
    webpackBuildWorker: true,
    optimizeCss: true,
    mdxRs: true,
    instrumentationHook: true,
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