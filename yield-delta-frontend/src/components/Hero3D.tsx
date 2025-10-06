import { useEffect, useRef } from 'react';

export default function Hero3D() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simple fade-in animation
    if (heroRef.current) {
      heroRef.current.style.opacity = '0';
      heroRef.current.style.transform = 'scale(0.95)';
      
      requestAnimationFrame(() => {
        if (heroRef.current) {
          heroRef.current.style.transition = 'opacity 1.5s ease-out, transform 1.5s ease-out';
          heroRef.current.style.opacity = '1';
          heroRef.current.style.transform = 'scale(1)';
        }
      });
    }
  }, []);

  return (
    <div ref={heroRef} className="w-full h-full relative min-h-full">
      {/* CSS-based animated background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-cyan-900/20 animate-pulse" />
        
        {/* Floating geometric shapes */}
        <div className="absolute top-1/4 left-1/4 w-16 h-16 bg-cyan-400/20 rounded-lg rotate-12 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }} />
        <div className="absolute top-1/3 right-1/3 w-12 h-12 bg-purple-400/20 rounded-full animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }} />
        <div className="absolute bottom-1/3 left-1/3 w-20 h-20 bg-pink-400/20 rounded-lg -rotate-12 animate-bounce" style={{ animationDelay: '2s', animationDuration: '5s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-14 h-14 bg-cyan-400/20 rounded-full animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3.5s' }} />
        
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: `
              linear-gradient(to right, #00f5d4 1px, transparent 1px),
              linear-gradient(to bottom, #00f5d4 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }} />
        </div>
      </div>
      
      {/* Central vault representation */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          {/* Central vault cube representation */}
          <div className="w-32 h-32 bg-gradient-to-br from-cyan-400/30 to-purple-600/30 rounded-2xl border border-cyan-400/50 shadow-2xl shadow-cyan-400/20 animate-pulse">
            <div className="absolute inset-2 bg-gradient-to-br from-cyan-400/20 to-purple-600/20 rounded-xl" />
            <div className="absolute inset-4 bg-gradient-to-br from-cyan-400/10 to-purple-600/10 rounded-lg" />
          </div>
          
          {/* Orbiting elements */}
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '20s' }}>
            <div className="absolute -top-4 left-1/2 w-4 h-4 bg-cyan-400/60 rounded-full -translate-x-1/2" />
            <div className="absolute top-1/2 -right-4 w-3 h-3 bg-purple-400/60 rounded-full -translate-y-1/2" />
            <div className="absolute -bottom-4 left-1/2 w-5 h-5 bg-pink-400/60 rounded-full -translate-x-1/2" />
            <div className="absolute top-1/2 -left-4 w-3 h-3 bg-cyan-400/60 rounded-full -translate-y-1/2" />
          </div>
          
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-purple-600/20 rounded-2xl blur-xl scale-150 animate-pulse" />
        </div>
      </div>
    </div>
  );
}