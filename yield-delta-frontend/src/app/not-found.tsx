import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <div className="space-x-4">
          <Link 
            href="/" 
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Go Home
          </Link>
          <Link 
            href="/docs" 
            className="inline-flex items-center px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
          >
            View Documentation
          </Link>
        </div>
      </div>
    </div>
  )
}