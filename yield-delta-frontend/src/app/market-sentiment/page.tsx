"use client"

import React, { useState, useEffect, useRef } from 'react';
import Navigation from '@/components/Navigation';
import { TrendingUp, TrendingDown, Brain, Target, Activity, Eye, Clock } from 'lucide-react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface SentimentData {
  metric: string;
  value: number;
  trend: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  description: string;
}

const MarketSentimentPage = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const mountRef = useRef<HTMLDivElement>(null);
  const statsCardsRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const [scene, setScene] = useState<THREE.Scene | null>(null);

  // Mock sentiment data
  const sentimentData: SentimentData[] = [
    {
      metric: 'Overall Market Sentiment',
      value: 76.5,
      trend: 'bullish',
      confidence: 85,
      description: 'Strong bullish sentiment driven by increased trading volume and positive price action'
    },
    {
      metric: 'SEI Ecosystem Health',
      value: 82.3,
      trend: 'bullish',
      confidence: 92,
      description: 'Robust ecosystem growth with new protocol integrations and high liquidity'
    },
    {
      metric: 'DeFi Protocol Adoption',
      value: 69.1,
      trend: 'bullish',
      confidence: 78,
      description: 'Growing adoption of yield farming protocols and liquidity provisioning'
    },
    {
      metric: 'Institutional Interest',
      value: 45.7,
      trend: 'neutral',
      confidence: 65,
      description: 'Moderate institutional interest with room for growth in coming quarters'
    },
    {
      metric: 'Social Media Buzz',
      value: 88.4,
      trend: 'bullish',
      confidence: 89,
      description: 'High social media engagement and positive community sentiment'
    },
    {
      metric: 'Developer Activity',
      value: 91.2,
      trend: 'bullish',
      confidence: 95,
      description: 'Exceptional developer activity with frequent updates and new features'
    }
  ];

  const getSentimentColor = (trend: string) => {
    switch (trend) {
      case 'bullish': return 'text-green-400';
      case 'bearish': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getSentimentIcon = (trend: string) => {
    switch (trend) {
      case 'bullish': return TrendingUp;
      case 'bearish': return TrendingDown;
      default: return Activity;
    }
  };

  // Three.js Setup for background (similar to market page)
  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount || scene) return;

    // Scene setup
    const newScene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    currentMount.appendChild(renderer.domElement);

    // Particle system
    const particleCount = 800;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 100;
      positions[i + 1] = (Math.random() - 0.5) * 100;
      positions[i + 2] = (Math.random() - 0.5) * 100;

      // Colors for particles - sentiment theme (green/purple)
      const color = new THREE.Color();
      color.setHSL(Math.random() * 0.3 + 0.25, 0.8, 0.6); // Green to purple range
      colors[i] = color.r;
      colors[i + 1] = color.g;
      colors[i + 2] = color.b;
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 1.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.25,
    });

    const particleSystem = new THREE.Points(particles, particleMaterial);
    newScene.add(particleSystem);

    // Geometric shapes for depth
    const geometries = [
      new THREE.OctahedronGeometry(2),
      new THREE.TetrahedronGeometry(1.5),
      new THREE.IcosahedronGeometry(1),
    ];

    geometries.forEach((geometry, index) => {
      const material = new THREE.MeshBasicMaterial({
        color: [0x10b981, 0x8b5cf6, 0x06b6d4][index],
        wireframe: true,
        transparent: true,
        opacity: 0.12,
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 60
      );
      newScene.add(mesh);
    });

    camera.position.z = 30;
    setScene(newScene);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Rotate particles
      particleSystem.rotation.x += 0.0008;
      particleSystem.rotation.y += 0.0015;

      // Rotate geometric shapes
      newScene.children.forEach((child) => {
        if (child instanceof THREE.Mesh) {
          child.rotation.x += 0.008;
          child.rotation.y += 0.008;
        }
      });

      renderer.render(newScene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [scene]);

  // GSAP Animations
  useEffect(() => {
    if (statsCardsRef.current) {
      const cards = statsCardsRef.current.children;
      
      gsap.fromTo(
        cards,
        { 
          opacity: 0, 
          y: 80, 
          scale: 0.9 
        },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          duration: 1, 
          stagger: 0.15, 
          ease: 'back.out(1.4)',
          scrollTrigger: {
            trigger: statsCardsRef.current,
            start: 'top 85%',
          }
        }
      );
    }

    if (tableRef.current) {
      gsap.fromTo(
        tableRef.current,
        { opacity: 0, y: 60 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 1.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: tableRef.current,
            start: 'top 90%',
          }
        }
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-background relative">
      {/* Three.js Background */}
      <div 
        ref={mountRef} 
        className="fixed inset-0 z-0"
        style={{ 
          background: 'radial-gradient(ellipse at center, rgba(16, 185, 129, 0.15) 0%, rgba(139, 92, 246, 0.08) 40%, rgba(6, 182, 212, 0.05) 70%, transparent 100%)'
        }}
      />
      
      {/* Background overlay */}
      <div className="fixed inset-0 z-5 bg-gradient-to-b from-background/70 via-background/60 to-background/70 pointer-events-none" />

      {/* Navigation */}
      <Navigation variant="dark" showWallet={true} showLaunchApp={false} />
      
      {/* Header */}
      <div className="relative z-10" style={{ paddingTop: '3.5rem' }}>
        <div 
          className="border-b border-white/20 backdrop-blur-xl"
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(139, 92, 246, 0.08) 50%, rgba(6, 182, 212, 0.12) 100%)',
            boxShadow: '0 8px 32px rgba(16, 185, 129, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1)'
          }}
        >
          <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-purple-400 to-cyan-400">
                  Market Sentiment Analysis
                </h1>
                <p className="text-gray-300 text-lg font-medium">AI-driven sentiment analysis and market psychology insights</p>
              </div>
              <div className="flex items-center gap-6">
                <div 
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" style={{ boxShadow: '0 0 10px rgba(16, 185, 129, 0.8)' }}></div>
                  <span className="text-green-300 font-semibold">AI Powered</span>
                </div>
                <div 
                  className="text-center px-4 py-3 rounded-xl"
                  style={{
                    background: 'rgba(139, 92, 246, 0.15)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <div className="text-sm text-purple-300 font-medium">Confidence</div>
                  <div className="text-2xl font-bold text-purple-400">84.2%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
        <div ref={statsCardsRef} className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {[
            { label: 'Bullish Indicators', value: '12', change: '+3', icon: TrendingUp, color: 'green' },
            { label: 'Market Fear Index', value: '28', change: '-5', icon: Brain, color: 'blue' },
            { label: 'Sentiment Score', value: '76.5', change: '+8.2', icon: Target, color: 'purple' },
            { label: 'Confidence Level', value: '84%', change: '+12%', icon: Activity, color: 'orange' }
          ].map((stat, index) => (
            <div 
              key={index} 
              className="group cursor-pointer transition-all duration-500 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '24px',
                padding: '2rem',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <stat.icon className={`w-10 h-10 text-${stat.color}-400 group-hover:scale-110 transition-transform duration-300`} style={{ filter: 'drop-shadow(0 0 8px currentColor)' }} />
                <div 
                  className={`text-sm font-bold text-${stat.color}-300 px-3 py-2 rounded-xl`}
                  style={{
                    background: `rgba(${stat.color === 'blue' ? '59, 130, 246' : stat.color === 'green' ? '16, 185, 129' : stat.color === 'purple' ? '139, 92, 246' : '245, 158, 11'}, 0.2)`,
                    border: `1px solid rgba(${stat.color === 'blue' ? '59, 130, 246' : stat.color === 'green' ? '16, 185, 129' : stat.color === 'purple' ? '139, 92, 246' : '245, 158, 11'}, 0.3)`,
                    backdropFilter: 'blur(8px)'
                  }}
                >
                  {stat.change}
                </div>
              </div>
              <div className="text-3xl font-black mb-2 text-white group-hover:text-white transition-colors" style={{ textShadow: '0 0 20px rgba(255, 255, 255, 0.5)' }}>{stat.value}</div>
              <div className="text-gray-300 text-sm font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center gap-6 mb-12">
          <span className="text-gray-300 text-lg font-semibold">Analysis Period:</span>
          <div className="flex items-center gap-2">
            {['1h', '24h', '7d', '30d'].map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${
                  selectedTimeframe === timeframe
                    ? 'text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
                style={{
                  background: selectedTimeframe === timeframe 
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.8) 0%, rgba(139, 92, 246, 0.8) 100%)'
                    : 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(10px)',
                  border: selectedTimeframe === timeframe 
                    ? '1px solid rgba(16, 185, 129, 0.5)'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: selectedTimeframe === timeframe 
                    ? '0 0 20px rgba(16, 185, 129, 0.4)'
                    : '0 4px 15px rgba(0, 0, 0, 0.1)'
                }}
              >
                {timeframe}
              </button>
            ))}
          </div>
        </div>

        {/* Sentiment Analysis Table */}
        <div 
          ref={tableRef}
          className="overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '32px',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
          }}
        >
          <div className="p-8 border-b border-white/20">
            <h2 className="text-2xl font-bold flex items-center gap-3 text-white">
              <Eye className="w-6 h-6 text-green-400" style={{ filter: 'drop-shadow(0 0 8px currentColor)' }} />
              Sentiment Metrics
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.08)' }}>
                  <th className="text-left p-6 font-semibold text-gray-300 text-sm">Metric</th>
                  <th className="text-right p-6 font-semibold text-gray-300 text-sm">Score</th>
                  <th className="text-right p-6 font-semibold text-gray-300 text-sm">Trend</th>
                  <th className="text-right p-6 font-semibold text-gray-300 text-sm">Confidence</th>
                  <th className="text-left p-6 font-semibold text-gray-300 text-sm">Analysis</th>
                </tr>
              </thead>
              <tbody>
                {sentimentData.map((item, index) => {
                  const SentimentIcon = getSentimentIcon(item.trend);
                  return (
                    <tr 
                      key={index} 
                      className="border-t border-white/10 transition-all duration-300 hover:scale-[1.01]"
                      style={{
                        background: 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div 
                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{
                              background: 'linear-gradient(135deg, #10b981 0%, #8b5cf6 50%, #06b6d4 100%)',
                              boxShadow: '0 8px 20px rgba(16, 185, 129, 0.4)'
                            }}
                          >
                            <Brain className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <div className="font-bold text-white text-lg">{item.metric}</div>
                            <div className="text-sm text-gray-300 font-medium">AI Analysis</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-6 text-right">
                        <div className="font-bold text-white text-lg">{item.value}%</div>
                      </td>
                      <td className="p-6 text-right">
                        <div 
                          className={`flex items-center justify-end gap-2 font-bold ${getSentimentColor(item.trend)}`}
                          style={{
                            filter: 'drop-shadow(0 0 8px currentColor)'
                          }}
                        >
                          <SentimentIcon className="w-5 h-5" />
                          {item.trend.toUpperCase()}
                        </div>
                      </td>
                      <td className="p-6 text-right">
                        <div className="font-bold text-white">{item.confidence}%</div>
                      </td>
                      <td className="p-6">
                        <div className="text-gray-300 text-sm max-w-xs">{item.description}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Note */}
        <div 
          className="mt-16 text-center text-gray-300 text-sm p-8 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <Clock className="w-5 h-5 text-green-400" style={{ filter: 'drop-shadow(0 0 8px currentColor)' }} />
            <span className="font-semibold">Last analysis: {new Date().toLocaleTimeString()}</span>
          </div>
          <p className="font-medium">Sentiment analysis updates every 15 minutes • Powered by AI & Machine Learning</p>
        </div>
      </div>
    </div>
  );
};

export default MarketSentimentPage;