'use client'

import { Button } from '@/components/ui/button';
import Link from 'next/link';

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
                    <div className="flex flex-col md:flex-row justify-center lg:justify-start items-center gap-4 md:gap-6 lg:gap-8">
                        <Link href="/vaults" className="w-full md:w-auto">
                            <Button 
                                className="mobile-responsive-button font-bold w-full md:w-auto px-6 md:px-8 lg:px-12 py-3 md:py-4 lg:py-6"
                                style={{
                                    background: 'linear-gradient(135deg, hsl(180 100% 48%), hsl(262 80% 60%))',
                                    color: 'hsl(216 100% 4%)',
                                    minHeight: '48px',
                                    minWidth: '160px',
                                    maxWidth: '280px',
                                    boxShadow: '0 0 20px hsl(180 100% 48% / 0.3), 0 0 40px hsl(180 100% 48% / 0.1)',
                                    border: 'none',
                                    borderRadius: '12px',
                                    transition: 'all 300ms ease-in-out',
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
                        </Link>
                        <Link href="/docs" className="w-full md:w-auto">
                            <Button
                                variant="outline"
                                className="mobile-responsive-button font-bold w-full md:w-auto px-6 md:px-8 lg:px-12 py-3 md:py-4 lg:py-6"
                                style={{
                                    borderColor: 'hsl(180 100% 48%)',
                                    color: 'hsl(180 100% 48%)',
                                    minHeight: '48px',
                                    minWidth: '160px',
                                    maxWidth: '280px',
                                    background: 'transparent',
                                    borderRadius: '12px',
                                    transition: 'all 300ms ease-in-out',
                                    borderWidth: '2px',
                                    fontSize: 'clamp(0.875rem, 2.5vw, 1.125rem)'
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
                        <div className="cta-visual-container relative w-full max-w-sm lg:max-w-md xl:max-w-lg">
                            <div className="aspect-square w-full bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 rounded-3xl shadow-2xl border border-primary/30 backdrop-blur-sm flex items-center justify-center">
                                <div className="text-center p-8">
                                    <div className="text-6xl mb-4 animate-pulse">🚀</div>
                                    <div className="text-lg font-semibold text-primary mb-2">Your DeFi Future</div>
                                    <div className="text-sm text-muted-foreground">Starts Here</div>
                                </div>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-primary/5 rounded-3xl pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}