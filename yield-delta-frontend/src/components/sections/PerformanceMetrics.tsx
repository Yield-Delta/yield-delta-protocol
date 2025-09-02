'use client'

import PerformanceCard from '@/components/PerformanceCard';

export default function PerformanceMetrics() {
    return (
        <section className="py-12 md:py-16 lg:py-20 relative" style={{ paddingTop: 'clamp(3rem, 6vw, 5rem)', paddingBottom: 'clamp(3rem, 6vw, 5rem)' }}>
            <div className="container mx-auto px-4">
                <div className="text-center mb-12 md:mb-16 lg:mb-20" style={{ marginBottom: 'clamp(3rem, 8vw, 6rem)' }}>
                    <h2 
                        className="text-5xl lg:text-6xl font-bold mb-6 holo-text"
                        style={{ 
                            fontSize: 'clamp(3rem, 6vw, 4.5rem)',
                            fontWeight: 'bold',
                            marginBottom: '2rem',
                            lineHeight: '1.1'
                        }}
                    >
                        Real-Time Performance
                    </h2>
                    <p 
                        style={{
                            fontSize: '2.25rem',
                            fontWeight: '500',
                            lineHeight: '1.4',
                            color: 'hsl(var(--muted-foreground))',
                            maxWidth: '64rem',
                            margin: '0 auto',
                            textAlign: 'center',
                            letterSpacing: '-0.01em',
                            opacity: '0.9'
                        }}
                    >
                        Track your vault performance with AI-powered analytics and real-time metrics.
                    </p>
                </div>
                
                <div 
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 lg:gap-10 max-w-7xl mx-auto px-4 sm:px-6"
                    style={{
                        display: 'grid',
                        justifyItems: 'center',
                        alignItems: 'stretch',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))'
                    }}
                >
                    <PerformanceCard
                        metric="24.5%"
                        description="Average APY"
                        comparison="+12.3% from last month"
                        color="#00f5d4"
                        positive={true}
                    />
                    <PerformanceCard
                        metric="$8.3M"
                        description="Total Value Locked"
                        comparison="+18% this week"
                        color="#9b5de5"
                        positive={true}
                    />
                    <PerformanceCard
                        metric="0.012%"
                        description="Impermanent Loss"
                        comparison="-62% vs traditional AMMs"
                        color="#ff206e"
                        positive={true}
                    />
                    <PerformanceCard
                        metric="99.8%"
                        description="Uptime"
                        comparison="AI optimization active"
                        color="#fee75c"
                        positive={true}
                    />
                    <PerformanceCard
                        metric="3.2s"
                        description="Avg Response Time"
                        comparison="Lightning fast execution"
                        color="#00bcd4"
                        positive={true}
                    />
                    <PerformanceCard
                        metric="127"
                        description="Active Strategies"
                        comparison="Continuously optimizing"
                        color="#ff9800"
                        positive={true}
                    />
                </div>
            </div>
        </section>
    );
}
