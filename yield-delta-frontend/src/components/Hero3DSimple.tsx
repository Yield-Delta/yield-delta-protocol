'use client'

import { useRef, useEffect } from 'react';

// Simple animated SVG-based 3D-like visualization as fallback
export default function Hero3DSimple() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      // Simple CSS animation instead of GSAP to reduce bundle size
      containerRef.current.style.opacity = '0';
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.style.transition = 'opacity 1s ease-in-out';
          containerRef.current.style.opacity = '1';
        }
      }, 100);
    }
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full relative flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
      {/* Enhanced SVG-based 3D-like visualization */}
      <svg 
        viewBox="0 0 600 600" 
        className="w-full h-full max-w-[800px] max-h-[800px]"
        style={{ filter: 'drop-shadow(0 0 30px rgba(0, 245, 212, 0.2))' }}
      >
        {/* Background grid with perspective */}
        <defs>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(0, 245, 212, 0.08)" strokeWidth="0.5"/>
          </pattern>
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style={{stopColor:"rgba(0, 245, 212, 0.3)", stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:"rgba(0, 245, 212, 0)", stopOpacity:0}} />
          </radialGradient>
        </defs>
        
        {/* Background grid */}
        <rect width="100%" height="100%" fill="url(#grid)" />
        <circle cx="300" cy="300" r="250" fill="url(#centerGlow)" />
        
        {/* Multiple rotating vault cubes for depth */}
        <g className="animate-spin" style={{ transformOrigin: '300px 300px', animationDuration: '25s' }}>
          {/* Main vault */}
          <g transform="translate(300,300)">
            <rect x="-40" y="-40" width="80" height="80" fill="none" stroke="rgba(0, 245, 212, 0.7)" strokeWidth="2"/>
            <rect x="-35" y="-45" width="80" height="80" fill="none" stroke="rgba(155, 93, 229, 0.5)" strokeWidth="1"/>
            <rect x="-30" y="-35" width="80" height="80" fill="none" stroke="rgba(255, 32, 110, 0.3)" strokeWidth="1"/>
          </g>
        </g>
        
        {/* Orbiting vaults with different sizes and speeds */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <g key={`orbit-${i}`} className="animate-spin" style={{ 
            transformOrigin: '300px 300px', 
            animationDuration: `${20 + i * 8}s`,
            animationDirection: i % 2 === 0 ? 'normal' : 'reverse'
          }}>
            <g transform={`translate(${300 + Math.cos(i * Math.PI / 3) * 120}, ${300 + Math.sin(i * Math.PI / 3) * 120})`}>
              <rect 
                x="-15" y="-15" width="30" height="30" 
                fill="none" 
                stroke={i % 3 === 0 ? 'rgba(0, 245, 212, 0.6)' : i % 3 === 1 ? 'rgba(155, 93, 229, 0.6)' : 'rgba(255, 32, 110, 0.6)'} 
                strokeWidth="1.5"
                className="animate-pulse"
              />
              <rect 
                x="-12" y="-18" width="30" height="30" 
                fill="none" 
                stroke={i % 3 === 0 ? 'rgba(0, 245, 212, 0.3)' : i % 3 === 1 ? 'rgba(155, 93, 229, 0.3)' : 'rgba(255, 32, 110, 0.3)'} 
                strokeWidth="0.5"
              />
            </g>
          </g>
        ))}
        
        {/* Data streams connecting vaults */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <g key={`stream-${i}`}>
            <line
              x1="300"
              y1="300"
              x2={300 + Math.cos(i * Math.PI / 3) * 120}
              y2={300 + Math.sin(i * Math.PI / 3) * 120}
              stroke="rgba(0, 245, 212, 0.2)"
              strokeWidth="0.5"
              strokeDasharray="2,4"
              className="animate-pulse"
              style={{animationDelay: `${i * 0.3}s`}}
            />
          </g>
        ))}
        
        {/* Central energy rings */}
        {[30, 50, 70].map((radius, i) => (
          <circle 
            key={`ring-${i}`}
            cx="300" 
            cy="300" 
            r={radius} 
            fill="none" 
            stroke={i === 0 ? 'rgba(0, 245, 212, 0.4)' : i === 1 ? 'rgba(155, 93, 229, 0.3)' : 'rgba(255, 32, 110, 0.2)'} 
            strokeWidth="1"
            className="animate-ping"
            style={{ animationDuration: `${3 + i}s`, animationDelay: `${i * 0.5}s` }}
          />
        ))}
      </svg>
      
      {/* Enhanced floating particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className={`absolute rounded-full animate-bounce ${
              i % 3 === 0 ? 'bg-primary/30 w-1 h-1' : 
              i % 3 === 1 ? 'bg-secondary/30 w-2 h-2' : 
              'bg-accent/30 w-1.5 h-1.5'
            }`}
            style={{
              left: `${15 + (i * 4.5) % 70}%`,
              top: `${20 + (i * 6.2) % 60}%`,
              animationDelay: `${i * 0.15}s`,
              animationDuration: `${2.5 + (i % 4) * 0.5}s`,
            }}
          />
        ))}
      </div>
      
      {/* Subtle overlay message */}
      <div className="absolute bottom-4 right-4 text-xs text-primary-glow/50">
        Lightweight Mode
      </div>
    </div>
  );
}