'use client'

import VaultCard from '@/components/VaultCard';

const vaultData = [
    {
        address: '0x34C0aA990D6e0D099325D7491136BA35FBcdFb38',
        name: 'Stable Max Yield Vault',
        apy: 4.5,
        tvl: 8500000,
        risk: 'Low' as const,
        color: '#00f5d4',
        description: 'Stable yield farming with algorithmic rebalancing across blue-chip pairs.',
    },
    {
        address: '0x6C0e4d44bcdf6f922637e041FdA4b7c1Fe5667E6',
        name: 'SEI Hypergrowth Vault',
        apy: 42.0,
        tvl: 1800000,
        risk: 'Medium' as const,
        color: '#9b5de5',
        description: 'Native SEI ecosystem exposure with automated liquidity provision.',
    },
    {
        address: '0x271115bA107A8F883DE36Eaf3a1CC41a4C5E1a56',
        name: 'Blue Chip DeFi Vault',
        apy: 15.6,
        tvl: 4200000,
        risk: 'Low' as const,
        color: '#ff206e',
        description: 'Diversified exposure to top DeFi protocols with risk mitigation.',
    },
];

export default function VaultShowcase() {
    return (
        <section className="py-16 relative" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
            <div className="container mx-auto px-4">
                <div className="text-center mb-20" style={{ marginBottom: '5rem' }}>
                    <h2 
                        className="text-5xl lg:text-6xl font-bold mb-6 holo-text"
                        style={{ 
                            fontSize: 'clamp(3rem, 6vw, 4.5rem)',
                            fontWeight: 'bold',
                            marginBottom: '2rem',
                            lineHeight: '1.1'
                        }}
                    >
                        Intelligent Vault Ecosystem
                    </h2>
                    <p 
                        className="text-2xl text-muted-foreground max-w-4xl mx-auto"
                        style={{ 
                            fontSize: '1.5rem',
                            marginTop: '2rem',
                            maxWidth: '64rem',
                            margin: '2rem auto 0'
                        }}
                    >
                        Choose from our curated selection of AI-optimized vaults,
                        each designed for different risk profiles and market conditions.
                    </p>
                </div>

                <div 
                    className="vault-container-override"
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        alignItems: 'stretch',
                        gap: '2.5rem',
                        maxWidth: '1200px',
                        margin: '0 auto',
                        padding: '0 1rem',
                        rowGap: '2.5rem',
                        columnGap: '2.5rem'
                    }}
                >
                    <style jsx>{`
                        .vault-container-override {
                            display: flex !important;
                            flex-direction: row !important;
                            flex-wrap: wrap !important;
                            justify-content: center !important;
                            align-items: stretch !important;
                            gap: 2.5rem !important;
                            row-gap: 2.5rem !important;
                            column-gap: 2.5rem !important;
                            max-width: 1200px !important;
                            margin: 0 auto !important;
                            padding: 0 1rem !important;
                        }
                        .vault-card-wrapper {
                            flex: 0 0 auto !important;
                            width: 320px !important;
                            max-width: 320px !important;
                            min-width: 280px !important;
                            margin: 1rem !important;
                            padding: 0 !important;
                        }
                    `}</style>
                    {vaultData.map((vault, index) => (
                        <div 
                            key={vault.name}
                            className="vault-card-wrapper"
                            style={{
                                flex: '0 0 auto',
                                width: '320px',
                                maxWidth: '320px',
                                minWidth: '280px',
                                margin: '1rem',
                                padding: '0'
                            }}
                        >
                            <VaultCard vault={vault} index={index} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
