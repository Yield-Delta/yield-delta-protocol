import React from 'react'
import DocsSidebar from '@/components/DocsSidebar'
import DocsBreadcrumb from '@/components/DocsBreadcrumb'

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="docs-layout-wrapper min-h-screen bg-background">
      {/* Enhanced layout with sidebar integration */}
      <div className="docs-layout">
        {/* Sidebar */}
        <DocsSidebar className="docs-layout-sidebar" />
        
        {/* Main content area */}
        <main className="docs-layout-main min-w-0 flex-1">
          <div className="docs-content">
            {/* Global breadcrumb for all documentation pages */}
            <DocsBreadcrumb className="docs-animate-in mb-6" />
            {children}
          </div>
        </main>
      </div>
      
      {/* Background enhancements */}
      <div className="docs-background-overlay fixed inset-0 -z-10 pointer-events-none">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20"></div>
        
        {/* Animated background elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Grid overlay for visual structure */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--border)) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        ></div>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Yield Delta Documentation',
  description: 'Complete guide to Yield Delta - AI-powered yield optimization on SEI Network',
}