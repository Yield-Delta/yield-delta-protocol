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

            {/* Responsive 2-column grid layout */}
            <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                
                {/* Left Column: Text Content */}
                <div className="order-2 lg:order-1 text-center lg:text-left px-4 lg:px-0">
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

                        <p className="text-base sm:text-lg md:text-xl lg:text-xl xl:text-2xl text-primary-glow mb-8 sm:mb-10 lg:mb-10 mobile-responsive-subheading">
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
                <div className="order-1 lg:order-2 flex flex-col space-y-8 lg:space-y-12">
                    
                    {/* 3D container */}
                    <div className="flex justify-center">
                        <div className="relative w-full max-w-lg lg:max-w-full" style={{ height: '400px' }}>
                            <Hero3D />
                        </div>
                    </div>

                    {/* Stats section */}
                    <div ref={statsRef} className="w-full">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                            {[
                                { value: '$8.3M', label: 'Total TVL' },
                                { value: '400ms', label: 'Block Time' },
                                { value: '18.5%', label: 'Avg APY' },
                            ].map((stat, i) => (
                                <Card key={i} className={`${glassCardStyles.glassCard} p-4 md:p-6 text-center`}>
                                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-primary-glow">
                                        {stat.value}
                                    </div>
                                    <div className="text-sm sm:text-base text-primary-glow">
                                        {stat.label}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Features section */}
                    <div className="text-center lg:text-left">
                        <div className="grid grid-cols-1 gap-4 lg:gap-6">
                            {[
                                { icon: '⚡', text: 'Real-time AI optimization' },
                                { icon: '🛡️', text: '62% reduced impermanent loss' },
                                { icon: '🚀', text: 'SEI native integration' },
                            ].map((feature, i) => (
                                <div
                                    key={i}
                                    className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-2 sm:space-y-0 sm:space-x-3 text-primary-glow p-3"
                                >
                                    <span className="text-2xl sm:text-xl lg:text-2xl flex-shrink-0">{feature.icon}</span>
                                    <span className="mobile-responsive-text text-sm sm:text-base lg:text-lg">{feature.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}