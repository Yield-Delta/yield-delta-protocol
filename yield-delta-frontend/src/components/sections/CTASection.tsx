'use client'

import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function CTASection() {
    return (
        <section className="py-16 sm:py-20 lg:py-24 relative overflow-hidden mobile-safe-padding">
            {/* Enhanced Background with Multiple Layers */}
            <div className="absolute inset-0">
                {/* Base gradient */}
                <div 
                    className="absolute inset-0"
                    style={{
                        background: 'radial-gradient(ellipse 120% 80% at 50% 100%, hsl(262 80% 60% / 0.15) 0%, transparent 60%), linear-gradient(135deg, hsl(180 100% 48% / 0.08) 0%, hsl(262 80% 60% / 0.12) 50%, hsl(310 70% 55% / 0.08) 100%)',
                    }}
                />
                
                {/* Animated grid pattern */}
                <div 
                    className="absolute inset-0 opacity-30"
                    style={{
                        backgroundImage: `
                            linear-gradient(hsl(180 100% 48% / 0.1) 1px, transparent 1px),
                            linear-gradient(90deg, hsl(180 100% 48% / 0.1) 1px, transparent 1px)
                        `,
                        backgroundSize: '60px 60px',
                        animation: 'gridFlow 20s linear infinite'
                    }}
                />
                
                {/* Floating geometric shapes */}
                <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-xl animate-pulse" />
                <div className="absolute bottom-20 right-16 w-24 h-24 bg-gradient-to-tl from-secondary/25 to-transparent rounded-lg rotate-45 blur-lg" style={{ animation: 'float 6s ease-in-out infinite' }} />
                <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-gradient-to-br from-accent/30 to-transparent rounded-full blur-md" style={{ animation: 'float 8s ease-in-out infinite reverse' }} />
                
                {/* Subtle noise texture */}
                <div 
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.1'/%3E%3C/svg%3E")`,
                    }}
                />
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 sm:gap-16 lg:gap-20 items-center max-w-7xl mx-auto">
                    <div className="text-center lg:text-left order-2 lg:order-1">
                        {/* Enhanced Heading with Multiple Visual Effects */}
                        <div className="relative mb-8 sm:mb-10 lg:mb-14">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold enhanced-cta-heading mobile-responsive-heading relative z-10">
                                Ready to Evolve Your DeFi Strategy?
                            </h2>
                            {/* Glow effect behind text */}
                            <div 
                                className="absolute inset-0 blur-3xl opacity-40 -z-10"
                                style={{
                                    background: 'linear-gradient(45deg, hsl(180 100% 48% / 0.6), hsl(262 80% 60% / 0.6), hsl(310 70% 55% / 0.6))',
                                    animation: 'glow 4s ease-in-out infinite alternate'
                                }}
                            />
                        </div>
                        
                        <div className="relative mb-10 sm:mb-12 lg:mb-16">
                            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground/90 mobile-responsive-subheading max-w-full lg:max-w-[90%] mx-auto lg:mx-0 leading-relaxed">
                                Join the future of liquidity provision with AI-powered optimization on
                                <span className="text-primary font-semibold ml-1 relative">
                                    SEI
                                    <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-secondary rounded-full"></span>
                                </span>
                            </p>
                        </div>
                        
                        <div className="flex flex-row justify-center lg:justify-start items-center gap-6 sm:gap-8 lg:gap-10">
                            <Link href="/vaults" className="flex-1 sm:w-auto">
                                <Button 
                                    className="enhanced-primary-button mobile-responsive-button font-bold w-full sm:w-auto px-8 md:px-10 lg:px-14 py-4 md:py-5 lg:py-7 relative overflow-hidden group"
                                    style={{
                                        minHeight: '56px',
                                        minWidth: '180px',
                                        maxWidth: '300px',
                                        fontSize: 'clamp(0.875rem, 2.5vw, 1.125rem)'
                                    }}
                                >
                                    <span className="relative z-10">Launch App</span>
                                </Button>
                            </Link>
                            <Link href="/docs" className="flex-1 sm:w-auto">
                                <Button
                                    variant="outline"
                                    className="enhanced-secondary-button mobile-responsive-button font-bold w-full sm:w-auto px-8 md:px-10 lg:px-14 py-4 md:py-5 lg:py-7 relative overflow-hidden group"
                                    style={{
                                        minHeight: '56px',
                                        minWidth: '180px',
                                        maxWidth: '300px',
                                        fontSize: 'clamp(0.875rem, 2.5vw, 1.125rem)',
                                        borderRadius: '24px'
                                    }}
                                >
                                    <span className="relative z-10">Learn More</span>
                                </Button>
                            </Link>
                        </div>
                    </div>
                    
                    {/* Enhanced Visual Element */}
                    <div className="relative order-1 lg:order-2 flex justify-center items-center">
                        <div className="enhanced-visual-container relative w-full max-w-sm lg:max-w-md xl:max-w-lg">
                            {/* Main visual container with enhanced effects */}
                            <div className="aspect-square w-full relative group">
                                {/* Animated border rings */}
                                <div className="absolute inset-0 rounded-3xl border border-primary/30" style={{ animation: 'spin 20s linear infinite' }} />
                                <div className="absolute inset-2 rounded-3xl border border-secondary/20" style={{ animation: 'spin 15s linear infinite reverse' }} />
                                
                                {/* Main content area */}
                                <div className="absolute inset-4 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 rounded-2xl backdrop-blur-xl border border-white/10 shadow-2xl flex items-center justify-center overflow-hidden">
                                    {/* Animated background elements */}
                                    <div className="absolute inset-0">
                                        <div className="absolute top-4 left-4 w-8 h-8 bg-primary/20 rounded-full blur-sm" style={{ animation: 'float 3s ease-in-out infinite' }} />
                                        <div className="absolute bottom-6 right-6 w-6 h-6 bg-secondary/25 rounded-full blur-sm" style={{ animation: 'float 4s ease-in-out infinite reverse' }} />
                                        <div className="absolute top-1/2 left-6 w-4 h-4 bg-accent/30 rounded-full blur-sm" style={{ animation: 'float 5s ease-in-out infinite' }} />
                                    </div>
                                    
                                    {/* Central content */}
                                    <div className="text-center p-8 relative z-10">
                                        <div className="text-7xl mb-6 relative group-hover:scale-110 transition-transform duration-500">
                                            <span style={{ 
                                                background: 'linear-gradient(45deg, hsl(180 100% 48%), hsl(262 80% 60%), hsl(310 70% 55%))',
                                                backgroundClip: 'text',
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent',
                                                filter: 'drop-shadow(0 0 20px hsl(180 100% 48% / 0.3))'
                                            }}>
                                                ⚡
                                            </span>
                                        </div>
                                        <div className="text-xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                            Your DeFi Evolution
                                        </div>
                                        <div className="text-sm text-muted-foreground/80 font-medium">
                                            Powered by AI
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Glowing effects */}
                                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-secondary/10 rounded-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}