
export const runtime = 'edge'

import { Inter } from 'next/font/google'
import './globals.css'
import { Web3Provider } from '@/components/providers/Web3Provider'
import { ThemeProvider } from 'next-themes'

const inter = Inter({ subsets: ['latin'] })
// Metadata for SEO and social sharing
export const metadata = {
  title: 'Yield Delta',
  description: 'AI-driven dynamic liquidity vaults on SEI EVM',
  openGraph: {
    title: 'Yield Delta',
    description: 'AI-driven dynamic liquidity vaults on SEI EVM',
    images: [{ url: '/og-image.svg', width: 1200, height: 630, alt: 'Yield Delta' }],
    type: 'website',
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon-32.svg',
    apple: '/favicon-128.svg',
  },
}
// QueryClient is managed internally in Web3Provider

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {/* Client-side web3 and query providers */}
          <Web3Provider>
            {children}
          </Web3Provider>
        </ThemeProvider>
      </body>
    </html>
  )
}
