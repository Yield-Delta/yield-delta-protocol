'use client'

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import styles from './CTASection.module.css';

export default function CTASection() {
    return (
        <section className="py-8 sm:py-12 lg:py-16 relative overflow-hidden mobile-safe-padding">
            <div
                className="absolute inset-0"
                style={{
                    background: 'linear-gradient(90deg, hsl(var(--primary) / 0.1), hsl(var(--secondary) / 0.1), hsl(var(--accent) / 0.1))',
                }}
            />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 items-center max-w-7xl mx-auto">
                    <div className="text-center lg:text-left order-2 lg:order-1">
                        <h2 
                        className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 sm:mb-8 lg:mb-12 holo-text mobile-responsive-heading"
                    >
                        Ready to Evolve Your DeFi Strategy?
                    </h2>
                    <p 
                        className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-6 sm:mb-8 lg:mb-12 mobile-responsive-subheading max-w-full lg:max-w-[90%] mx-auto lg:mx-0"
                    >
                        Join the future of liquidity provision with AI-powered optimization on
                        SEI
                    </p>
                    <div className={`${styles.buttonContainer}`}>
                        <Link href="/vaults" className="w-auto">
                            <Button 
                                className="mobile-responsive-button font-bold w-auto px-3 sm:px-6 md:px-8 lg:px-12 py-4 md:py-4 lg:py-6"
                                style={{
                                    background: 'linear-gradient(135deg, hsl(180 100% 48%), hsl(262 80% 60%))',
                                    color: 'hsl(216 100% 4%)',
                                    minHeight: '52px',
                                    minWidth: '140px',
                                    maxWidth: '200px',
                                    boxShadow: '0 0 20px hsl(180 100% 48% / 0.3), 0 0 40px hsl(180 100% 48% / 0.1)',
                                    border: 'none',
                                    borderRadius: '12px',
                                    transition: 'all 300ms ease-in-out',
                                    fontSize: 'clamp(0.875rem, 2.5vw, 1.125rem)',
                                    flex: '0 0 auto'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.02)';
                                    e.currentTarget.style.boxShadow = '0 0 25px hsl(180 100% 48% / 0.4), 0 0 50px hsl(180 100% 48% / 0.2)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.boxShadow = '0 0 20px hsl(180 100% 48% / 0.3), 0 0 40px hsl(180 100% 48% / 0.1)';
                                }}
                            >
                                Launch App
                            </Button>
                        </Link>
                        <Link href="/docs" className="w-auto">
                            <Button
                                variant="outline"
                                className="mobile-responsive-button font-bold w-auto px-3 sm:px-6 md:px-8 lg:px-12 py-4 md:py-4 lg:py-6"
                                style={{
                                    borderColor: 'hsl(180 100% 48%)',
                                    color: 'hsl(180 100% 48%)',
                                    minHeight: '52px',
                                    minWidth: '140px',
                                    maxWidth: '200px',
                                    background: 'transparent',
                                    borderRadius: '12px',
                                    transition: 'all 300ms ease-in-out',
                                    borderWidth: '2px',
                                    fontSize: 'clamp(0.875rem, 2.5vw, 1.125rem)',
                                    flex: '0 0 auto'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'hsl(180 100% 48% / 0.1)';
                                    e.currentTarget.style.borderColor = 'hsl(180 100% 48%)';
                                    e.currentTarget.style.transform = 'scale(1.02)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.borderColor = 'hsl(180 100% 48%)';
                                    e.currentTarget.style.transform = 'scale(1)';
                                }}
                            >
                                Learn More
                            </Button>
                        </Link>
                    </div>
                    </div>
                    
                    <div className="relative order-1 lg:order-2 flex justify-center items-center">
                        <div className={`${styles.ctaVisualContainer} relative w-full max-w-md lg:max-w-lg xl:max-w-xl`}>
                            {/* Main Container with Enhanced Glass Morphism */}
                            <div 
                                className="aspect-square w-full shadow-2xl border backdrop-blur-sm flex items-center justify-center relative overflow-hidden cursor-pointer transition-all duration-500 ease-out"
                                style={{
                                    borderRadius: '2.5rem',
                                    background: 'linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(var(--secondary) / 0.12), hsl(var(--accent) / 0.18))',
                                    borderColor: 'hsl(var(--primary) / 0.4)',
                                    boxShadow: '0 20px 40px hsl(var(--primary) / 0.15), 0 0 60px hsl(var(--primary) / 0.1), inset 0 1px 0 hsl(var(--border) / 0.3)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.05) rotateY(5deg)';
                                    e.currentTarget.style.boxShadow = '0 30px 60px hsl(var(--primary) / 0.25), 0 0 80px hsl(var(--primary) / 0.15), inset 0 1px 0 hsl(var(--border) / 0.4)';
                                    e.currentTarget.style.borderColor = 'hsl(var(--primary) / 0.6)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1) rotateY(0deg)';
                                    e.currentTarget.style.boxShadow = '0 20px 40px hsl(var(--primary) / 0.15), 0 0 60px hsl(var(--primary) / 0.1), inset 0 1px 0 hsl(var(--border) / 0.3)';
                                    e.currentTarget.style.borderColor = 'hsl(var(--primary) / 0.4)';
                                }}
                            >
                                {/* Animated Background Orbs */}
                                <div className="absolute inset-0">
                                    {[...Array(6)].map((_, i) => (
                                        <div
                                            key={i}
                                            className={`absolute rounded-full opacity-30 ${styles.float}`}
                                            style={{
                                                background: i % 3 === 0 
                                                    ? 'radial-gradient(circle, hsl(var(--primary) / 0.6), transparent 70%)'
                                                    : i % 3 === 1 
                                                    ? 'radial-gradient(circle, hsl(var(--secondary) / 0.5), transparent 70%)'
                                                    : 'radial-gradient(circle, hsl(var(--accent) / 0.4), transparent 70%)',
                                                width: `${60 + i * 20}px`,
                                                height: `${60 + i * 20}px`,
                                                left: `${15 + (i * 12)}%`,
                                                top: `${10 + (i * 15)}%`,
                                                filter: 'blur(1px)',
                                                animationDuration: `${3 + i * 0.5}s`,
                                                animationDelay: `${i * 0.2}s`
                                            } as React.CSSProperties}
                                        />
                                    ))}
                                </div>

                                {/* Central Content */}
                                <div className="text-center p-6 sm:p-8 relative z-10">
                                    {/* Animated Icon Container */}
                                    <div className="relative mb-4 sm:mb-6">
                                        <div
                                            className={`mb-2 inline-block relative ${styles.rocketPulse}`}
                                            style={{
                                                fontSize: 'clamp(4.5rem, 12vw, 10rem)',
                                                filter: 'drop-shadow(0 0 20px hsl(var(--primary) / 0.6))'
                                            }}
                                        >
                                            🚀
                                        </div>
                                        {/* Rocket Trail Effect */}
                                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                                            {[...Array(3)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`absolute w-2 h-8 rounded-full ${styles.trailFade}`}
                                                    style={{
                                                        background: `linear-gradient(to bottom, hsl(var(--primary) / ${0.8 - i * 0.2}), transparent)`,
                                                        left: `${-8 + i * 8}px`,
                                                        top: `${10 + i * 5}px`,
                                                        animationDuration: `${1.5 + i * 0.3}s`,
                                                        animationDelay: `${i * 0.1}s`
                                                    } as React.CSSProperties}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    
                                    {/* Enhanced Text with Gradient Animation */}
                                    <div
                                        className={`font-bold mb-2 leading-tight ${styles.gradientShift}`}
                                        style={{
                                            fontSize: 'clamp(1.25rem, 5vw, 2.5rem)',
                                            background: 'linear-gradient(45deg, hsl(var(--primary)), hsl(var(--secondary)), hsl(var(--accent)), hsl(var(--primary)))',
                                            backgroundSize: '300% 300%',
                                            WebkitBackgroundClip: 'text',
                                            backgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            textShadow: 'none'
                                        } as React.CSSProperties}
                                    >
                                        Your DeFi Future
                                    </div>
                                    <div
                                        className={`font-medium ${styles.textGlow}`}
                                        style={{
                                            fontSize: 'clamp(1rem, 3vw, 1.5rem)',
                                            color: 'hsl(var(--primary-glow))',
                                            textShadow: '0 0 8px hsl(var(--primary-glow) / 0.6)'
                                        }}
                                    >
                                        Starts Here
                                    </div>
                                </div>

                                {/* Floating Particles */}
                                <div className="absolute inset-0 pointer-events-none">
                                    {[...Array(8)].map((_, i) => (
                                        <div
                                            key={i}
                                            className={`absolute w-1 h-1 rounded-full ${styles.particleFloat}`}
                                            style={{
                                                background: 'hsl(var(--primary))',
                                                left: `${20 + i * 8}%`,
                                                top: `${30 + (i % 3) * 20}%`,
                                                animationDuration: `${4 + i * 0.5}s`,
                                                animationDelay: `${i * 0.3}s`,
                                                boxShadow: '0 0 6px hsl(var(--primary))'
                                            } as React.CSSProperties}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Enhanced Overlay Effects */}
                            <div 
                                className={`absolute inset-0 pointer-events-none ${styles.shimmer}`}
                                style={{
                                    borderRadius: '2.5rem',
                                    background: 'linear-gradient(135deg, transparent 0%, hsl(var(--primary) / 0.1) 50%, transparent 100%)'
                                }}
                            />
                            
                            {/* Outer Glow Ring */}
                            <div 
                                className={`absolute inset-[-4px] pointer-events-none opacity-60 ${styles.gradientShift}`}
                                style={{
                                    borderRadius: '2.75rem',
                                    background: 'linear-gradient(45deg, hsl(var(--primary) / 0.3), hsl(var(--secondary) / 0.2), hsl(var(--accent) / 0.25), hsl(var(--primary) / 0.3))',
                                    backgroundSize: '300% 300%',
                                    filter: 'blur(8px)',
                                    zIndex: -1
                                } as React.CSSProperties}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}