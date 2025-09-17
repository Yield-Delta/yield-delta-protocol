import nextra from 'nextra'
import type { NextConfig } from 'next'

const withNextra = nextra({
  // Nextra v4 configuration - theme and themeConfig are no longer supported here
  // Theme configuration is now handled via the theme.config.tsx file directly
  mdxOptions: {
    // Configure MDX options if needed
  },
})

const nextConfig: NextConfig = {
  // Your existing Next.js config
  reactStrictMode: true,
  transpilePackages: ['@sei-js/core'],
  
  // Headers for API responses
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
    ]
  },
  
  // Environment variables for API
  env: {
    SEI_CHAIN_ID: '713715',
    SEI_RPC_URL: 'https://evm-rpc-arctic-1.sei-apis.com',
    API_VERSION: '1.0.0',
  },
  
  // Images configuration
  images: {
    domains: ['ipfs.io', 'seiprotocol.infura-ipfs.io'],
  },

  // Webpack configuration optimized for Cloudflare Pages
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        os: require.resolve('os-browserify'),
        path: require.resolve('path-browserify'),
      };
    }

    // Aggressive 3D library optimization for build performance
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        ...config.optimization.splitChunks,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          // Make 3D libraries completely separate and async
          three: {
            test: /[\\/]node_modules[\\/](three|@react-three)[\\/]/,
            name: 'three',
            chunks: 'async', // Only load when needed
            priority: 30,
            enforce: true,
          },
          gsap: {
            test: /[\\/]node_modules[\\/]gsap[\\/]/,
            name: 'gsap',
            chunks: 'async', // Only load when needed
            priority: 25,
            enforce: true,
          },
        },
      },
    };

    // Reduce bundle analysis and logging for faster builds
    config.infrastructureLogging = { level: 'error' };
    config.stats = 'errors-only';
    
    // Cloudflare Pages build optimization
    if (process.env.CF_PAGES) {
      config.optimization.minimize = true;
      // Ensure proper three.js resolution for production builds
      config.resolve.alias = {
        ...config.resolve.alias,
        'three': require.resolve('three'),
      };
    }
    
    return config;
  },

  // Enable MDX for documentation
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],

  // Experimental features for MDX support and performance
  experimental: {
    mdxRs: false, // Disable Rust-based MDX for better compatibility with Nextra
    optimizeCss: true, // Enable CSS optimization
  },
  
  
  // Route configuration
  async redirects() {
    return [
      {
        source: '/documentation',
        destination: '/docs',
        permanent: true,
      },
    ];
  },
}

export default withNextra(nextConfig)