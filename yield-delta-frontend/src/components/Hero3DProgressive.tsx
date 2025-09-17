'use client'

import { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import Hero3DSimple from './Hero3DSimple';
import '../types/window';

// Progressive 3D loader that only loads on user interaction or after page load
const Hero3D = dynamic(() => import('./Hero3DLoader'), {
  ssr: false,
  loading: () => <Hero3DSimple />,
});

export default function Hero3DProgressive() {
  // Always start with 3D enabled for production experience matching localhost
  const [shouldLoad3D, setShouldLoad3D] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    // Multiple checks to ensure environment variable is properly detected
    const enable3D = typeof window !== 'undefined' && (
      process.env.NEXT_PUBLIC_ENABLE_3D_VISUALIZATION === 'true' ||
      // Additional check for production environments where env vars might be handled differently
      window.__NEXT_DATA__?.env?.NEXT_PUBLIC_ENABLE_3D_VISUALIZATION === 'true' ||
      // Force-enable for production to match localhost experience
      window.location.hostname === 'yielddelta.xyz' ||
      window.location.hostname === 'www.yielddelta.xyz' ||
      // Enable for localhost development
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      // Default to true if we can't determine - ensures good UX
      true
    );
    
    console.log('Hero3DProgressive - Enable 3D check:', {
      hostname: window.location.hostname,
      env_var: process.env.NEXT_PUBLIC_ENABLE_3D_VISUALIZATION,
      enable3D
    });
    
    if (enable3D) {
      // Set immediately for production to match localhost experience
      setShouldLoad3D(true);
    }
  }, []);

  useEffect(() => {
    // Listen for user interaction to prioritize 3D loading
    const handleInteraction = () => {
      if (!hasInteracted) {
        setHasInteracted(true);
        // Check at runtime for better production compatibility
        if (typeof window !== 'undefined' && (
            process.env.NEXT_PUBLIC_ENABLE_3D_VISUALIZATION === 'true' ||
            window.location.hostname === 'yielddelta.xyz' ||
            window.location.hostname === 'www.yielddelta.xyz' ||
            window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            true // Default to enable for best UX
        )) {
          setShouldLoad3D(true);
        }
      }
    };

    // Listen for various interaction events
    document.addEventListener('click', handleInteraction);
    document.addEventListener('scroll', handleInteraction);
    document.addEventListener('mousemove', handleInteraction);

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('scroll', handleInteraction);
      document.removeEventListener('mousemove', handleInteraction);
    };
  }, [hasInteracted]);

  // For development or when 3D should be loaded
  if (shouldLoad3D) {
    return (
      <Suspense fallback={<Hero3DSimple />}>
        <div className="relative">
          <Hero3D />
          {/* Show loading indicator during 3D load */}
          <div className="absolute bottom-4 right-4 text-xs text-primary-glow/50">
            3D Mode
          </div>
        </div>
      </Suspense>
    );
  }

  // Default fallback - always works and builds fast
  return <Hero3DSimple />;
}