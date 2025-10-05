import { http } from 'wagmi'
import { defineChain } from 'viem'
import { createConfig as createWagmiConfig } from 'wagmi'
// Don't import connectors at module level - they contain browser-only code
// import { metaMask, walletConnect, injected } from 'wagmi/connectors'

// SEI Mainnet (Pacific-1)
export const seiMainnet = defineChain({
  id: 1329,
  name: 'SEI',
  nativeCurrency: { name: 'SEI', symbol: 'SEI', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://evm-rpc.sei-apis.com'] }
  },
  blockExplorers: {
    default: { name: 'SeiTrace', url: 'https://seitrace.com' }
  },
  testnet: false
})

// SEI Devnet 
export const seiDevnet = defineChain({
  id: 713715,
  name: 'SEI Devnet',
  nativeCurrency: { name: 'SEI', symbol: 'SEI', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://evm-rpc-arctic-1.sei-apis.com'] }
  },
  blockExplorers: {
    default: { name: 'SeiTrace Devnet', url: 'https://seitrace.com/?chain=devnet' }
  },
  testnet: true
})

// SEI Testnet (Atlantic-2) - Updated for testing
export const seiTestnet = defineChain({
  id: 1328,
  name: 'SEI Atlantic-2',
  nativeCurrency: { name: 'SEI', symbol: 'SEI', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://evm-rpc-testnet.sei-apis.com'] }
  },
  blockExplorers: {
    default: { name: 'SeiTrace Testnet', url: 'https://seitrace.com/atlantic-2' }
  },
  testnet: true
})

// Comprehensive polyfills for SSR/build-time
if (typeof window === 'undefined') {
  // Polyfill self for Node.js environment
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).self = global;
  // Polyfill other browser globals that might be needed
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).window = global;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).document = {}
}

// Singleton pattern to prevent multiple config instantiation
let configInstance: ReturnType<typeof createWagmiConfig> | null = null
let isCreatingConfig = false

function createConfig() {
  // Return null during SSR - config will be created on client side
  if (typeof window === 'undefined') {
    return null as any
  }

  // Prevent race conditions during config creation
  if (isCreatingConfig) {
    // Wait for existing creation to complete
    while (!configInstance && isCreatingConfig) {
      // Busy wait for a short time
    }
    return configInstance!
  }

  if (configInstance) {
    return configInstance
  }

  isCreatingConfig = true

  const projectId = process.env.NEXT_PUBLIC_WC_ID
  
  if (!projectId || projectId === 'dummy-project-id' || projectId === 'your_walletconnect_project_id_here') {
    console.warn('⚠️ WalletConnect Project ID not set. Please add NEXT_PUBLIC_WC_ID to your .env.local file.')
    console.warn('Get your Project ID from: https://walletconnect.com/cloud')
  }

  // Dynamically import connectors only in browser to avoid SSR issues
  // This prevents the metamask-sdk from loading during build time
  const { metaMask, walletConnect, injected } = require('wagmi/connectors')

  // Create connectors only in browser
  const connectors = [
    metaMask({
      dappMetadata: {
        name: 'SEI DLP',
        url: window.location.origin
      }
    }),
    walletConnect({
      projectId: projectId || 'fallback-project-id',
      metadata: {
        name: 'SEI DLP',
        description: 'AI-driven dynamic liquidity vaults on SEI EVM',
        url: window.location.origin,
        icons: ['https://yielddelta.xyz/favicon.svg']
      }
    }),
    injected({
      shimDisconnect: true
    })
  ]

  // Create custom config without Coinbase wallet to prevent SDK errors
  configInstance = createWagmiConfig({
    chains: [seiDevnet, seiMainnet, seiTestnet],
    connectors,
    transports: {
      [seiDevnet.id]: http(),
      [seiMainnet.id]: http(),
      [seiTestnet.id]: http()
    },
    ssr: true,
    batch: {
      multicall: false,
    },
    // CRITICAL: Eliminate aggressive polling that causes MetaMask eth_accounts errors
    pollingInterval: 120000, // 2 minutes - very conservative to prevent conflicts
    // Additional config to prevent MetaMask provider conflicts
    syncConnectedChain: false, // Prevents automatic chain switching conflicts
    multiInjectedProviderDiscovery: false, // Prevents conflicts between multiple wallets
  })

  isCreatingConfig = false
  return configInstance
}

// Create a minimal stub config for SSR that won't trigger browser-only dependencies
function createStubConfig() {
  return createWagmiConfig({
    chains: [seiDevnet, seiMainnet, seiTestnet],
    connectors: [], // No connectors during SSR
    transports: {
      [seiDevnet.id]: http(),
      [seiMainnet.id]: http(),
      [seiTestnet.id]: http()
    },
    ssr: true,
  })
}

// Export config - use stub during SSR, real config in browser
export const config = typeof window !== 'undefined' ? createConfig() : createStubConfig()