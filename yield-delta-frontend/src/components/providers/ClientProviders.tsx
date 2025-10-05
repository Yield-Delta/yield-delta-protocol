'use client'

// Import polyfills for SSR compatibility
import '@/lib/polyfills'

import dynamic from 'next/dynamic'

// Dynamically import Web3Provider with no SSR to prevent wagmi/rainbowkit from loading during build
// This prevents the 'self is not defined' error from @metamask/sdk
const Web3Provider = dynamic(
  () => import('@/components/providers/Web3Provider').then((mod) => mod.Web3Provider),
  { 
    ssr: false,
    loading: () => <div className="min-h-screen" /> // Minimal loading state
  }
)

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return <Web3Provider>{children}</Web3Provider>
}
