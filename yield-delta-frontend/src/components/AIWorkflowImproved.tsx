"use client"

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const workflowSteps = [
  { 
    id: 'deposit', 
    title: 'User Deposit', 
    description: 'Capital enters the protocol',
    icon: '💰',
    color: 'var(--color-cyan)'
  },
  { 
    id: 'analysis', 
    title: 'AI Analysis', 
    description: 'ElizaOS analyzes market conditions',
    icon: '🧠',
    color: 'var(--color-purple)'
  },
  { 
    id: 'allocation', 
    title: 'Smart Allocation', 
    description: 'Funds distributed across strategies',
    icon: '⚡',
    color: 'var(--color-pink)'
  },
  { 
    id: 'optimization', 
    title: 'Continuous Optimization', 
    description: 'Real-time strategy adjustments',
    icon: '🔄',
    color: 'var(--color-cyan)'
  },
  { 
    id: 'returns', 
    title: 'Enhanced Returns', 
    description: 'Maximized yield with reduced risk',
    icon: '📈',
    color: 'var(--color-purple)'
  }
];

const performanceMetrics = [
  { 
    metric: '62%', 
    label: 'Less Impermanent Loss', 
    description: 'Compared to standard AMM pools',
    color: 'var(--color-cyan)',
    icon: '🛡️'
  },
  { 
    metric: '400ms', 
    label: 'SEI Block Time', 
    description: 'Lightning-fast execution',
    color: 'var(--color-purple)',
    icon: '⚡'
  },
  { 
    metric: '24/7', 
    label: 'AI Monitoring', 
    description: 'Continuous optimization',
    color: 'var(--color-pink)',
    icon: '👁️'
  }
];

export default function AIWorkflowImproved() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<(HTMLDivElement | null)[]>([]);
  const connectorsRef = useRef<(HTMLDivElement | null)[]>([]);
  const metricsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create timeline for workflow animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 70%",
        end: "bottom 30%",
        scrub: 1,
        onEnter: () => {
          // Animate steps in sequence
          stepsRef.current.forEach((step, index) => {
            if (step) {
              gsap.fromTo(step,
                { opacity: 0, scale: 0.8, y: 30 },
                { 
                  opacity: 1, 
                  scale: 1, 
                  y: 0,
                  duration: 0.6,
                  delay: index * 0.15,
                  ease: "back.out(1.4)"
                }
              );
            }
          });

          // Animate connectors after steps
          connectorsRef.current.forEach((connector, index) => {
            if (connector) {
              gsap.fromTo(connector,
                { scaleX: 0, opacity: 0 },
                { 
                  scaleX: 1,
                  opacity: 1,
                  duration: 0.4,
                  delay: (index + 1) * 0.15 + 0.2,
                  ease: "power2.out"
                }
              );
            }
          });

          // Animate performance metrics
          metricsRef.current.forEach((metric, index) => {
            if (metric) {
              gsap.fromTo(metric,
                { opacity: 0, y: 20 },
                { 
                  opacity: 1, 
                  y: 0,
                  duration: 0.5,
                  delay: 2 + index * 0.1,
                  ease: "power2.out"
                }
              );
            }
          });
        }
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <section 
      ref={containerRef} 
      className="py-16 relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, rgba(20, 20, 30, 0.95) 0%, rgba(0, 245, 212, 0.04) 20%, rgba(155, 93, 229, 0.03) 50%, rgba(255, 32, 110, 0.04) 80%, rgba(20, 20, 30, 0.95) 100%)',
        minHeight: '80vh'
      }}
    >
      {/* Section Header */}
      <div className="container mx-auto px-4 mb-16">
        <div className="text-center space-y-6">
          <h2 className="analytics-heading">
            AI-Powered Liquidity Engine
          </h2>
          <p className="analytics-subheading max-w-2xl mx-auto">
            Watch how ElizaOS optimizes your capital in real-time across SEI&apos;s DeFi ecosystem
          </p>
        </div>
      </div>

      {/* Workflow Steps */}
      <div className="container mx-auto px-4 mb-20">
        <div className="analytics-grid analytics-grid--workflow">
          {workflowSteps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center relative">
              {/* Workflow Step Card */}
              <div
                ref={el => { stepsRef.current[index] = el; }}
                className="analytics-card analytics-card--workflow group cursor-pointer"
                style={{
                  background: `radial-gradient(circle at center, ${step.color}15, rgba(30, 30, 50, 0.9))`,
                  borderColor: `${step.color}40`,
                  boxShadow: `0 8px 32px ${step.color}20`
                }}
              >
                {/* Icon */}
                <div 
                  className="text-4xl mb-3 transition-transform duration-300 group-hover:scale-110"
                  style={{ 
                    filter: `drop-shadow(0 0 12px ${step.color})`,
                    color: step.color
                  }}
                >
                  {step.icon}
                </div>
                
                {/* Title */}
                <h3 className="analytics-metric-label text-center mb-2 text-white">
                  {step.title}
                </h3>
                
                {/* Description */}
                <p className="analytics-description text-center">
                  {step.description}
                </p>

                {/* Pulsing indicator */}
                <div 
                  className="absolute -top-2 -right-2 w-3 h-3 rounded-full"
                  style={{ 
                    backgroundColor: step.color,
                    animation: 'pulse-glow 2s ease-in-out infinite'
                  }}
                />
              </div>

              {/* Connector Arrow */}
              {index < workflowSteps.length - 1 && (
                <>
                  {/* Desktop Arrow */}
                  <div className="absolute top-1/2 left-full transform -translate-y-1/2 z-10 hidden lg:block pointer-events-none">
                    <div
                      ref={el => { connectorsRef.current[index] = el; }}
                      className="flex items-center"
                      style={{ width: '80px' }}
                    >
                      {/* Arrow Line */}
                      <div
                        style={{
                          height: '2px',
                          width: 'calc(100% - 16px)',
                          background: `linear-gradient(to right, ${step.color}, ${workflowSteps[index + 1].color})`,
                          borderRadius: '1px',
                          position: 'relative'
                        }}
                      >
                        {/* Animated Flow Dot */}
                        <div 
                          style={{
                            position: 'absolute',
                            top: '50%',
                            left: '0',
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: step.color,
                            transform: 'translateY(-50%)',
                            animation: 'flow-move 2s linear infinite',
                            boxShadow: `0 0 8px ${step.color}`
                          }}
                        />
                      </div>
                      
                      {/* Arrow Head */}
                      <div 
                        style={{
                          width: '0',
                          height: '0',
                          borderLeft: `8px solid ${workflowSteps[index + 1].color}`,
                          borderTop: '4px solid transparent',
                          borderBottom: '4px solid transparent',
                          filter: `drop-shadow(0 0 4px ${workflowSteps[index + 1].color})`
                        }}
                      />
                    </div>
                  </div>

                  {/* Mobile Vertical Arrow */}
                  <div className="flex items-center justify-center mt-6 mb-6 lg:hidden">
                    <div
                      className="flex flex-col items-center"
                      style={{ height: '60px' }}
                    >
                      {/* Arrow Line */}
                      <div
                        style={{
                          width: '2px',
                          height: 'calc(100% - 16px)',
                          background: `linear-gradient(to bottom, ${step.color}, ${workflowSteps[index + 1].color})`,
                          borderRadius: '1px',
                          position: 'relative'
                        }}
                      >
                        {/* Animated Flow Dot */}
                        <div 
                          style={{
                            position: 'absolute',
                            left: '50%',
                            top: '0',
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: step.color,
                            transform: 'translateX(-50%)',
                            animation: 'flow-move-vertical 2s linear infinite',
                            boxShadow: `0 0 8px ${step.color}`
                          }}
                        />
                      </div>
                      
                      {/* Arrow Head */}
                      <div 
                        style={{
                          width: '0',
                          height: '0',
                          borderTop: `8px solid ${workflowSteps[index + 1].color}`,
                          borderLeft: '4px solid transparent',
                          borderRight: '4px solid transparent',
                          filter: `drop-shadow(0 0 4px ${workflowSteps[index + 1].color})`
                        }}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* AI Central Hub */}
        <div className="flex justify-center mt-16 mb-16">
          <div className="analytics-card analytics-card--metric relative group">
            <div className="flex-center mb-6">
              <div 
                className="w-24 h-24 rounded-full flex-center relative"
                style={{
                  background: 'radial-gradient(circle at center, var(--color-purple)20, rgba(30, 30, 50, 0.9))',
                  border: '2px solid var(--color-purple)',
                  animation: 'pulse-glow 3s ease-in-out infinite'
                }}
              >
                <div className="text-5xl">🤖</div>
                
                {/* Orbiting dots */}
                {[0, 1, 2, 3].map((i) => (
                  <div 
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: 'var(--color-cyan)',
                      top: '50%',
                      left: '50%',
                      transformOrigin: '40px',
                      transform: `translate(-50%, -50%) rotate(${i * 90}deg) translateX(40px)`,
                      animation: `orbit ${3 + i * 0.5}s linear infinite`
                    }}
                  />
                ))}
              </div>
            </div>
            
            <h3 className="analytics-metric-label text-center mb-3 text-white">
              AI-Powered Optimization
            </h3>
            <p className="analytics-description text-center max-w-sm">
              Advanced AI continuously monitors market conditions and optimizes liquidity positions for maximum yield
            </p>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="analytics-subheading text-2xl font-bold mb-2">
            Performance Metrics
          </div>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-purple-500 mx-auto rounded-full" />
        </div>

        <div className="analytics-grid analytics-grid--metrics">
          {performanceMetrics.map((item, index) => (
            <div 
              key={index}
              ref={el => { metricsRef.current[index] = el; }}
              className="analytics-card analytics-card--performance group cursor-pointer"
              style={{
                background: 'rgba(30, 41, 59, 0.9)',
                borderColor: `${item.color}30`
              }}
            >
              {/* Icon */}
              <div 
                className="text-5xl mb-4 flex-center transition-transform duration-300 group-hover:scale-110"
                style={{ 
                  filter: `drop-shadow(0 0 12px ${item.color})`,
                  color: item.color
                }}
              >
                {item.icon}
              </div>
              
              {/* Metric Value */}
              <div 
                className="analytics-metric-value text-center mb-3"
                style={{ 
                  color: item.color,
                  filter: `drop-shadow(0 0 8px ${item.color})`
                }}
              >
                {item.metric}
              </div>
              
              {/* Label */}
              <div className="analytics-metric-label text-center mb-2 text-white">
                {item.label}
              </div>
              
              {/* Description */}
              <div className="analytics-description text-center">
                {item.description}
              </div>

              {/* Status Indicator */}
              <div className="mt-6 flex-center">
                <div className="status-indicator status-indicator--success">
                  <div className="status-indicator__dot" />
                  ACTIVE
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes flow-move {
          0% { transform: translateY(-50%) translateX(-10px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-50%) translateX(70px); opacity: 0; }
        }
        
        @keyframes flow-move-vertical {
          0% { transform: translateX(-50%) translateY(-10px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateX(-50%) translateY(50px); opacity: 0; }
        }
        
        @keyframes orbit {
          from { transform: translate(-50%, -50%) rotate(0deg) translateX(40px); }
          to { transform: translate(-50%, -50%) rotate(360deg) translateX(40px); }
        }
      `}</style>
    </section>
  );
}