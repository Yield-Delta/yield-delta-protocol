import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';
import './index.css';
import React from 'react';
import type { UUID } from '@elizaos/core';

const queryClient = new QueryClient();

// Define the interface for the ELIZA_CONFIG
interface ElizaConfig {
  agentId: string;
  apiBase: string;
}

// Declare global window extension for TypeScript
declare global {
  interface Window {
    ELIZA_CONFIG?: ElizaConfig;
  }
}

/**
 * Main Example route component
 */
function ExampleRoute() {
  const config = window.ELIZA_CONFIG;
  const agentId = config?.agentId;

  // Apply dark mode to the root element
  React.useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  if (!agentId) {
    return (
      <div className="p-4 text-center">
        <div className="text-red-600 font-medium">Error: Agent ID not found</div>
        <div className="text-sm text-gray-600 mt-2">
          The server should inject the agent ID configuration.
        </div>
      </div>
    );
  }

  return <ExampleProvider agentId={agentId as UUID} />;
}

/**
 * Main DeFi application component
 */
function ExampleProvider({ agentId }: { agentId: UUID }) {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background text-foreground">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Your DeFi Future Starts Here
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Maximize your yield with Liqui's intelligent DeFi strategies on SEI blockchain
          </p>
        </section>

        {/* Features Section with Rounded Borders */}
        <section className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-xl border border-border shadow-lg">
              <div className="w-12 h-12 bg-primary rounded-lg mb-4 flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Lightning Fast</h3>
              <p className="text-muted-foreground">
                400ms finality on SEI blockchain with ultra-low transaction costs (~$0.15)
              </p>
            </div>
            
            <div className="bg-card p-8 rounded-xl border border-border shadow-lg">
              <div className="w-12 h-12 bg-primary rounded-lg mb-4 flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">📈</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">High Yields</h3>
              <p className="text-muted-foreground">
                15-30% higher yields than Ethereum through active liquidity management
              </p>
            </div>
            
            <div className="bg-card p-8 rounded-xl border border-border shadow-lg">
              <div className="w-12 h-12 bg-primary rounded-lg mb-4 flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">🛡️</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Secure & Audited</h3>
              <p className="text-muted-foreground">
                Smart contracts audited and battle-tested for maximum security
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section with Horizontal Mobile Buttons */}
        <section className="container mx-auto px-4 py-16 text-center">
          <div className="bg-card p-8 md:p-12 rounded-2xl border border-border">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Start Earning?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of users maximizing their yield with Liqui's intelligent strategies
            </p>
            
            {/* CTA Buttons - Horizontal on mobile, keep horizontal on desktop */}
            <div className="flex flex-row gap-4 justify-center items-center">
              <button className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                Start Trading
              </button>
              <button className="border border-border px-8 py-3 rounded-lg font-semibold hover:bg-accent transition-colors">
                View Strategies
              </button>
            </div>
          </div>
        </section>

        {/* Agent Info */}
        <section className="container mx-auto px-4 py-8 text-center border-t border-border">
          <p className="text-sm text-muted-foreground">
            Powered by Liqui Agent: {agentId}
          </p>
        </section>
      </div>
    </QueryClientProvider>
  );
}

// Initialize the application - no router needed for iframe
const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<ExampleRoute />);
}

// Define types for integration with agent UI system
export interface AgentPanel {
  name: string;
  path: string;
  component: React.ComponentType<any>;
  icon?: string;
  public?: boolean;
  shortLabel?: string; // Optional short label for mobile
}

interface PanelProps {
  agentId: string;
}

/**
 * Example panel component for the plugin system
 */
const PanelComponent: React.FC<PanelProps> = ({ agentId }) => {
  return <div>Helllo {agentId}!</div>;
};

// Export the panel configuration for integration with the agent UI
export const panels: AgentPanel[] = [
  {
    name: 'Example',
    path: 'example',
    component: PanelComponent,
    icon: 'Book',
    public: false,
    shortLabel: 'Example',
  },
];

export * from './utils';
