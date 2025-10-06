'use client'

// Import polyfills for SSR compatibility
import '@/lib/polyfills'

import { Web3Provider } from '@/components/providers/Web3Provider'

/**
 * Client-side providers wrapper
 * This component is a client component that wraps all client-side providers
 * The polyfills imported above ensure SSR compatibility
 */
export function ClientProviders({ children }: { children: React.ReactNode }) {
  return <Web3Provider>{children}</Web3Provider>
}
