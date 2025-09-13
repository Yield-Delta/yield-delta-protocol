'use client'

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Hero3D from '@/components/Hero3D';
import glassCardStyles from '@/components/GlassCard.module.css';
import heroStyles from '@/components/Hero.module.css';
import gsap from 'gsap';

export default function HeroSection() {
    const heroTextRef = useRef<HTMLDivElement>(null);
    const ctaRef = useRef<HTMLDivElement>(null);
    const statsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (heroTextRef.current) {
            const textElements = heroTextRef.current.children;
            const elementsToAnimate = Array.from(textElements).slice(1);
            gsap.fromTo(
                elementsToAnimate,
                { opacity: 0, y: 50, filter: 'blur(10px)' },
                { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.2, stagger: 0.3, ease: 'power3.out', delay: 0.5 }
            );
        }
        if (ctaRef.current) {
            gsap.fromTo(
                ctaRef.current,
                { opacity: 0, scale: 0.8 },
                { opacity: 1, scale: 1, duration: 0.8, delay: 2, ease: 'back.out(1.7)' }
            );
        }
        if (statsRef.current) {
            gsap.fromTo(
                statsRef.current,
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 1, delay: 2.5, ease: 'power2.out' }
            );
        }
    }, []);

    return (
        <section className={`${heroStyles.section} hero-section`}>
            <div className={`absolute inset-0 ${heroStyles.neuralGrid} opacity-30`} />

            <div className="absolute inset-0">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div
                        key={i}
                        className={heroStyles.dataStream}
                        style={{
                            left: `${10 + i * 12}%`,
                            animationDelay: `${i * 0.5}s`,
                            height: '200px',
                        }}
                    />
                ))}
            </div>

            {/* Responsive 2-column grid layout using CSS Module grid */}
            <div className={`relative z-10 ${heroStyles.heroGrid}`}>
                
                {/* Left Column: Text Content */}
                <div className={`${heroStyles.heroTextContainer} flex flex-col justify-center space-y-6`}>
                    <div ref={heroTextRef}>
                        <h1 className="text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold mb-6 sm:mb-8 lg:mb-8 leading-tight mobile-responsive-heading">
                            <span className={heroStyles.heroTitleAnimated}>
                                Your Liquidity,
                            </span>
                            <br />
                            <span className={heroStyles.heroTitleAnimated}>
                                Evolved
                            </span>
                        </h1>

                        <p className="text-base sm:text-lg md:text-xl lg:text-xl xl:text-2xl text-primary-glow mb-6 sm:mb-8 lg:mb-8 mobile-responsive-subheading leading-relaxed">
                            Harness the power of AI-driven liquidity optimization on SEI.
                            Maximize yields, minimize risk, and let ElizaOS handle the
                            complexity.
                        </p>

                        <div
                            ref={ctaRef}
                            className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 md:gap-6"
                        >
                            <Button
                                className="mobile-responsive-button font-bold min-w-[200px] px-6 md:px-8 py-3 md:py-4"
                                onClick={() => window.location.href = '/vaults'}
                                style={{
                                    background: 'linear-gradient(135deg, hsl(180 100% 48%), hsl(262 80% 60%))',
                                    color: 'hsl(216 100% 4%)',
                                    boxShadow: '0 0 20px hsl(180 100% 48% / 0.3), 0 0 40px hsl(180 100% 48% / 0.1)',
                                    border: 'none',
                                    borderRadius: '12px',
                                    transition: 'all 300ms ease-in-out',
                                    minWidth: '200px',
                                    minHeight: '48px',
                                    fontSize: 'clamp(0.875rem, 2.5vw, 1.125rem)'
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
                            <Button
                                variant="outline"
                                className="mobile-responsive-button font-bold min-w-[200px] px-6 md:px-8 py-3 md:py-4"
                                onClick={() => window.location.href = '/docs'}
                                style={{
                                    borderColor: 'hsl(180 100% 48%)',
                                    color: 'hsl(180 100% 48%)',
                                    background: 'transparent',
                                    borderRadius: '12px',
                                    transition: 'all 300ms ease-in-out',
                                    minWidth: '200px',
                                    minHeight: '48px',
                                    fontSize: 'clamp(0.875rem, 2.5vw, 1.125rem)',
                                    borderWidth: '2px'
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
                                View Documentation
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Right Column: 3D Scene + Stats + Features */}
                <div className={`${heroStyles.hero3dContainer} flex flex-col space-y-6 lg:space-y-8`}>
                    
                    {/* 3D container - Removed size restrictions for proper scaling */}
                    <div className="flex justify-center w-full">
                        <div className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] xl:h-[800px] 2xl:h-[900px]">
                            <Hero3D />
                        </div>
                    </div>

                    {/* Stats section - Reduced for better spacing */}
                    <div ref={statsRef} className="w-full mt-8 lg:mt-12">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                            {[
                                { value: '$8.3M', label: 'Total TVL' },
                                { value: '18.5%', label: 'Avg APY' },
                                { value: '400ms', label: 'Block Time' },
                            ].map((stat, i) => (
                                <Card key={i} className={`${glassCardStyles.heroStatsCard} p-3 lg:p-4 text-center`}>
                                    <div className="text-base lg:text-lg font-bold text-primary-glow">
                                        {stat.value}
                                    </div>
                                    <div className="text-xs lg:text-sm text-primary-glow opacity-80">
                                        {stat.label}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Features section - Simplified for desktop layout */}
                    <div className="text-center lg:text-left lg:hidden">
                        <div className="grid grid-cols-1 gap-3">
                            {[
                                { icon: '⚡', text: 'AI optimization' },
                                { icon: '🛡️', text: 'Reduced impermanent loss' },
                                { icon: '🚀', text: 'SEI integration' },
                            ].map((feature, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-center space-x-2 text-primary-glow p-2"
                                >
                                    <span className="text-lg flex-shrink-0">{feature.icon}</span>
                                    <span className="text-sm">{feature.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}