'use client'

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Hero3DSimple from './Hero3DSimple';

// Conditionally import Hero3D only when explicitly enabled
const Hero3D = dynamic(() => {
  // Only import the heavy 3D component if enabled
  if (process.env.NEXT_PUBLIC_ENABLE_3D_VISUALIZATION === 'true') {
    return import('./Hero3DLoader');
  }
  // Return a resolved promise with the simple component
  return Promise.resolve({ default: Hero3DSimple });
}, {
  ssr: false,
  loading: () => <Hero3DSimple />,
});

// Use environment variable to control 3D rendering
const USE_HEAVY_3D = process.env.NEXT_PUBLIC_ENABLE_3D_VISUALIZATION === 'true';

export default function Hero3DWrapper() {
  // For production builds, use the simple version to avoid timeout issues
  if (!USE_HEAVY_3D) {
    return <Hero3DSimple />;
  }

  return (
    <Suspense fallback={<Hero3DSimple />}>
      <Hero3D />
    </Suspense>
  );
}