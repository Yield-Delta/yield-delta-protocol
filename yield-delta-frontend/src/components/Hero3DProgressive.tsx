'use client'

import { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import Hero3DSimple from './Hero3DSimple';

// Progressive 3D loader that only loads on user interaction or after page load
const Hero3D = dynamic(() => import('./Hero3DLoader'), {
  ssr: false,
  loading: () => <Hero3DSimple />,
});

export default function Hero3DProgressive() {
  // Initialize shouldLoad3D based on environment variable for immediate loading
  const [shouldLoad3D, setShouldLoad3D] = useState(process.env.NEXT_PUBLIC_ENABLE_3D_VISUALIZATION === 'true');
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    // Only enable 3D if explicitly requested AND page has fully loaded
    const enable3D = process.env.NEXT_PUBLIC_ENABLE_3D_VISUALIZATION === 'true';
    
    if (enable3D) {
      // Load 3D immediately for production to match localhost experience
      const timer = setTimeout(() => {
        setShouldLoad3D(true);
      }, 100); // Much shorter delay for immediate loading

      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    // Listen for user interaction to prioritize 3D loading
    const handleInteraction = () => {
      if (!hasInteracted) {
        setHasInteracted(true);
        if (process.env.NEXT_PUBLIC_ENABLE_3D_VISUALIZATION === 'true') {
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