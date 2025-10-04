import Navigation from '@/components/Navigation';
import DemoBanner from '@/components/DemoBanner';
import VerticalRays from '@/components/VerticalRays';
import HeroSection from '@/components/sections/HeroSection';
import VaultShowcase from '@/components/sections/VaultShowcase';
import FeatureHighlight from '@/components/sections/FeatureHighlight';
import AIWorkflow from '@/components/AIWorkflow';
import PerformanceMetrics from '@/components/sections/PerformanceMetrics';
import CTASection from '@/components/sections/CTASection';

export default function DLPLanding() {

    return (
        <div className="min-h-screen bg-background relative overflow-x-hidden mobile-enhanced-padding">
            <Navigation variant="transparent" showWallet={false} showLaunchApp={true} />
            <DemoBanner />
            <VerticalRays className="top-0 left-0 right-0" style={{ pointerEvents: 'none' }} />
            <div id="hero" className="mobile-section-spacing mobile-element-spacing">
                <HeroSection />
            </div>
            <div id="vaults" className="mobile-section-spacing mobile-element-spacing">
                <VaultShowcase />
            </div>
            <div id="features" className="mobile-section-spacing mobile-element-spacing">
                <FeatureHighlight />
            </div>
            <div id="ai-workflow" className="mobile-section-spacing mobile-element-spacing">
                <AIWorkflow />
            </div>
            <div id="performance" className="mobile-section-spacing mobile-element-spacing">
                <PerformanceMetrics />
            </div>
            <div id="get-started" className="mobile-section-spacing mobile-element-spacing">
                <CTASection />
            </div>
        </div>
    );
}