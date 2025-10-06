
'use client'

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Hero3DProgressive from '@/components/Hero3DProgressive';
import DebugEnv from '@/components/DebugEnv';
import glassCardStyles from '@/components/GlassCard.module.css';
import heroStyles from '@/components/Hero.module.css';

export default function HeroSection() {

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
                    <div className="hero-text-animate">
                        <h1 
                            className="font-bold mb-6 sm:mb-8 lg:mb-8 leading-tight mobile-responsive-heading"
                            style={{
                                fontSize: 'clamp(2rem, 7vw, 4rem)',
                                lineHeight: '1.1',
                                letterSpacing: '-0.02em',
                                textAlign: 'inherit',
                                maxWidth: '100%',
                                wordBreak: 'break-word',
                                hyphens: 'auto'
                            }}
                        >
                            <span 
                                className={`${heroStyles.heroTitleAnimated} gradient-text-fallback`}
                                style={{
                                    background: 'linear-gradient(45deg, #00f5d4, #9b5de5, #ff206e, #fbae3c, #00f5d4, #9b5de5)',
                                    backgroundSize: '400% 400%',
                                    WebkitBackgroundClip: 'text',
                                    backgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    animation: 'gradient-shift 3s ease-in-out infinite',
                                    fontWeight: '800',
                                    display: 'inline-block'
                                }}
                            >
                                Your Liquidity,
                            </span>
                            <br />
                            <span 
                                className={`${heroStyles.heroTitleAnimated} gradient-text-fallback`}
                                style={{
                                    background: 'linear-gradient(45deg, #00f5d4, #9b5de5, #ff206e, #fbae3c, #00f5d4, #9b5de5)',
                                    backgroundSize: '400% 400%',
                                    WebkitBackgroundClip: 'text',
                                    backgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    animation: 'gradient-shift 3s ease-in-out infinite',
                                    fontWeight: '800',
                                    display: 'inline-block'
                                }}
                            >
                                Evolved
                            </span>
                        </h1>

                        <p 
                            className="text-primary-glow mb-6 sm:mb-8 lg:mb-8 mobile-responsive-subheading leading-relaxed"
                            style={{
                                fontSize: 'clamp(1rem, 4vw, 1.5rem)',
                                lineHeight: '1.6',
                                textAlign: 'inherit',
                                maxWidth: '100%',
                                letterSpacing: '-0.01em',
                                margin: '0 auto 2rem auto',
                                wordBreak: 'break-word'
                            }}
                        >
                            Harness the power of AI-driven liquidity optimization on SEI.
                            Maximize yields, minimize risk, and let ElizaOS handle the
                            complexity.
                        </p>

                        <div
                            className={`${heroStyles.heroButtonContainer} hero-cta-animate`}
                        >
                            <Button
                                className={`${heroStyles.heroButton} ${heroStyles.heroPrimaryButton}`}
                                onClick={() => window.location.href = '/vaults'}
                            >
                                Launch App
                            </Button>
                            <Button
                                variant="outline"
                                className={`${heroStyles.heroButton} ${heroStyles.heroSecondaryButton}`}
                                onClick={() => window.location.href = '/docs'}
                            >
                                View Documentation
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Right Column: 3D Scene + Stats */}
                <div className={`${heroStyles.hero3dContainer} flex flex-col space-y-6 lg:space-y-8`}>
                    
                    {/* 3D container - Fixed responsive sizing for better visibility */}
                    <div className="flex justify-center w-full">
                        <div className={`${heroStyles.enhanced3dContainer} relative w-full h-[700px] sm:h-[800px] md:h-[900px] lg:h-[1000px] xl:h-[1100px] 2xl:h-[1200px] min-h-[700px] max-h-none`}>
                            <Hero3DProgressive />
                        </div>
                    </div>

                    {/* Stats section - Mobile-optimized with hero TVL layout */}
                    <div className="w-full mt-8 lg:mt-12 hero-stats-animate">
                        {/* Mobile Hero TVL Card + Secondary Stats Layout */}
                        <div className="block md:hidden">
                            {/* Primary TVL Hero Card */}
                            <Card className={`${glassCardStyles.heroStatsCard} ${heroStyles.heroPrimaryStatsCard} mb-3`}>
                                <div className={`${heroStyles.heroPrimaryStatsValue} text-primary-glow`}>
                                    $8.3M
                                </div>
                                <div className={`${heroStyles.heroPrimaryStatsLabel} text-primary-glow`}>
                                    Total Value Locked
                                </div>
                            </Card>
                            
                            {/* Secondary Stats - 2 Column Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <Card className={`${glassCardStyles.heroStatsCard} ${heroStyles.heroSecondaryStatsCard}`}>
                                    <div className={`${heroStyles.heroSecondaryStatsValue} text-primary-glow`}>
                                        18.5%
                                    </div>
                                    <div className={`${heroStyles.heroSecondaryStatsLabel} text-primary-glow`}>
                                        Avg APY
                                    </div>
                                </Card>
                                <Card className={`${glassCardStyles.heroStatsCard} ${heroStyles.heroSecondaryStatsCard}`}>
                                    <div className={`${heroStyles.heroSecondaryStatsValue} text-primary-glow`}>
                                        400ms
                                    </div>
                                    <div className={`${heroStyles.heroSecondaryStatsLabel} text-primary-glow`}>
                                        Block Time
                                    </div>
                                </Card>
                            </div>
                        </div>

                        {/* Desktop/Tablet - Original 3-column layout */}
                        <div className="hidden md:block">
                            <div className={`${heroStyles.heroStatsContainer} grid grid-cols-3 gap-6`}>
                                {[
                                    { value: '$8.3M', label: 'Total TVL' },
                                    { value: '18.5%', label: 'Avg APY' },
                                    { value: '400ms', label: 'Block Time' },
                                ].map((stat, i) => (
                                    <Card key={i} className={`${glassCardStyles.heroStatsCard} ${heroStyles.heroStatsCard}`}>
                                        <div className={`${heroStyles.heroStatsValue} text-primary-glow`}>
                                            {stat.value}
                                        </div>
                                        <div className={`${heroStyles.heroStatsLabel} text-primary-glow`}>
                                            {stat.label}
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
                
                {/* Features section - Mobile-only, positioned after stats on mobile */}
                <div className={`${heroStyles.heroFeaturesContainer} text-center lg:hidden`}>
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
            
            {/* Debug component to verify environment variables (development only) */}
            {process.env.NODE_ENV === 'development' && <DebugEnv />}
            
            {/* Add CSS animations */}
            <style jsx>{`
                @keyframes hero-fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(50px);
                        filter: blur(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                        filter: blur(0);
                    }
                }
                
                @keyframes hero-scale-in {
                    from {
                        opacity: 0;
                        transform: scale(0.8);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                
                .hero-text-animate > * {
                    animation: hero-fade-in 1.2s ease-out;
                }
                
                .hero-text-animate > *:nth-child(1) {
                    animation-delay: 0.5s;
                }
                
                .hero-text-animate > *:nth-child(2) {
                    animation-delay: 0.8s;
                }
                
                .hero-text-animate > *:nth-child(3) {
                    animation-delay: 1.1s;
                }
                
                .hero-cta-animate {
                    animation: hero-scale-in 0.8s ease-out 2s both;
                }
                
                .hero-stats-animate {
                    animation: hero-fade-in 1s ease-out 2.5s both;
                }
            `}</style>
        </section>
    );
}