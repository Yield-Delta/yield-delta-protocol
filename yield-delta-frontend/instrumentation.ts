/**
 * Next.js Instrumentation Hook
 * 
 * This file is loaded by Next.js before any other code during the build process.
 * It's the perfect place to register polyfills that need to be available during SSR.
 * 
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // CRITICAL: Apply polyfills immediately before any other code loads
  if (typeof globalThis !== 'undefined') {
    // Essential browser globals for wallet SDKs
    if (typeof globalThis.self === 'undefined') {
      // @ts-expect-error - Adding self to globalThis for SSR compatibility
      globalThis.self = globalThis;
    }
    
    if (typeof global !== 'undefined' && typeof global.self === 'undefined') {
      // @ts-expect-error - Adding self to global for SSR compatibility  
      global.self = global;
    }

    // Ensure window is available during build
    if (typeof globalThis.window === 'undefined') {
      // @ts-expect-error - Adding window to globalThis for SSR compatibility
      globalThis.window = globalThis;
    }
  }

  // Load comprehensive polyfills during server-side rendering / build time
  if (typeof window === 'undefined') {
    try {
      await import('./src/lib/polyfills');
    } catch (error) {
      console.warn('Failed to load polyfills during instrumentation:', error);
      // Continue without failing the build
    }
  }
}