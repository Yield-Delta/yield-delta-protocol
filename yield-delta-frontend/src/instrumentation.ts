/**
 * Next.js Instrumentation Hook
 * 
 * This file is loaded by Next.js before any other code during the build process.
 * It's the perfect place to register polyfills that need to be available during SSR.
 * 
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Load polyfills as early as possible in the build process
  if (typeof window === 'undefined') {
    // Only run polyfills during server-side rendering / build time
    await import('./lib/polyfills');
  }
}