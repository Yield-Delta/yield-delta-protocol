import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'API Reference - Yield Delta Documentation',
  description: 'Complete API reference for Yield Delta - AI-powered yield optimization on SEI Network',
}

export default function APIReferenceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}