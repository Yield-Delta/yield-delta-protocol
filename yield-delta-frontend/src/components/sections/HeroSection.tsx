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

            <div className={`${heroStyles.grid} relative z-10`}>
                <div className={heroStyles.container3d}>
                    <Hero3D />
                    <div
                        ref={statsRef}
                        className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-full"
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 max-w-lg mx-auto">
                            {[
                                { value: '$8.3M', label: 'Total TVL' },
                                { value: '400ms', label: 'Block Time' },
                                { value: '18.5%', label: 'Avg APY' },
                            ].map((stat, i) => (
                                <Card key={i} className={`${glassCardStyles.glassCard} p-3 sm:p-4 text-center`}>
                                    <div className="text-sm sm:text-lg font-bold text-primary-glow">
                                        {stat.value}
                                    </div>
                                    <div className="text-xs text-primary-glow">
                                        {stat.label}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>

                <div ref={heroTextRef} className={heroStyles.textContainer}>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold mb-6 sm:mb-8 lg:mb-12 leading-tight mobile-responsive-heading">
                        <span className={heroStyles.heroTitleAnimated}>
                            Your Liquidity,
                        </span>
                        <br />
                        <span className={heroStyles.heroTitleAnimated}>
                            Evolved
                        </span>
                    </h1>

                    <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-primary-glow mb-8 sm:mb-12 lg:mb-16 xl:mb-24 max-w-full lg:max-w-3xl mobile-responsive-subheading">
                        Harness the power of AI-driven liquidity optimization on SEI.
                        Maximize yields, minimize risk, and let ElizaOS handle the
                        complexity.
                    </p>

                    <div
                        ref={ctaRef}
                        className="flex flex-col sm:flex-row mb-8 sm:mb-12 lg:mb-20 justify-center sm:justify-start gap-3 sm:gap-4 lg:gap-6"
                    >
                        <Button
                            className="mobile-responsive-button font-bold w-full sm:w-auto px-6 sm:px-8 lg:px-12 py-3 sm:py-4 lg:py-6"
                            onClick={() => window.location.href = '/vaults'}
                            style={{
                                background: 'linear-gradient(135deg, hsl(180 100% 48%), hsl(262 80% 60%))',
                                color: 'hsl(216 100% 4%)',
                                boxShadow: '0 0 20px hsl(180 100% 48% / 0.3), 0 0 40px hsl(180 100% 48% / 0.1)',
                                border: 'none',
                                borderRadius: '12px',
                                transition: 'all 300ms ease-in-out',
                                minWidth: '160px',
                                minHeight: '48px',
                                maxWidth: '280px',
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
                            className="mobile-responsive-button font-bold w-full sm:w-auto px-6 sm:px-8 lg:px-12 py-3 sm:py-4 lg:py-6"
                            onClick={() => window.location.href = '/docs'}
                            style={{
                                borderColor: 'hsl(180 100% 48%)',
                                color: 'hsl(180 100% 48%)',
                                background: 'transparent',
                                borderRadius: '12px',
                                transition: 'all 300ms ease-in-out',
                                minWidth: '160px',
                                minHeight: '48px',
                                maxWidth: '280px',
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

                    <div className="space-y-3 sm:space-y-4 lg:space-y-6 mt-6 sm:mt-8 lg:mt-12">
                        {[
                            { icon: '⚡', text: 'Real-time AI optimization' },
                            { icon: '🛡️', text: '62% reduced impermanent loss' },
                            { icon: '🚀', text: 'SEI native integration' },
                        ].map((feature, i) => (
                            <div
                                key={i}
                                className="flex items-center space-x-3 sm:space-x-4 text-primary-glow"
                            >
                                <span className="text-lg sm:text-xl lg:text-2xl flex-shrink-0">{feature.icon}</span>
                                <span className="mobile-responsive-text text-sm sm:text-base lg:text-lg">{feature.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}