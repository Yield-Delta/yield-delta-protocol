'use client'

import dynamic from 'next/dynamic';
import { Suspense, useEffect, useState } from 'react';
import Hero3DSimple from './Hero3DSimple';

// Always import the 3D component dynamically to avoid build-time issues
const Hero3D = dynamic(() => import('./Hero3DLoader'), {
  ssr: false,
  loading: () => <Hero3DSimple />,
});

export default function Hero3DWrapper() {
  const [useHeavy3D, setUseHeavy3D] = useState(false);

  useEffect(() => {
    // Multiple checks to ensure environment variable is properly detected
    const enable3D = typeof window !== 'undefined' && (
      process.env.NEXT_PUBLIC_ENABLE_3D_VISUALIZATION === 'true' ||
      // Additional check for production environments where env vars might be handled differently
      (window as any).__NEXT_DATA__?.env?.NEXT_PUBLIC_ENABLE_3D_VISUALIZATION === 'true' ||
      // Temporary force-enable for production to match localhost (can be removed after debugging)
      window.location.hostname === 'yielddelta.xyz' ||
      window.location.hostname === 'www.yielddelta.xyz'
    );
    
    setUseHeavy3D(enable3D);
  }, []);

  // Always render simple component if 3D is not enabled
  if (!useHeavy3D) {
    return <Hero3DSimple />;
  }

  return (
    <Suspense fallback={<Hero3DSimple />}>
      <Hero3D />
    </Suspense>
  );
}