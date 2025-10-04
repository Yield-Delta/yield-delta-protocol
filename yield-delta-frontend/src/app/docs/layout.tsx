import React from 'react'

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Yield Delta Documentation',
  description: 'Complete guide to Yield Delta - AI-powered yield optimization on SEI Network',
}