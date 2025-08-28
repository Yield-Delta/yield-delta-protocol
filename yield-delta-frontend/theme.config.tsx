import React from 'react'

const config = {
  logo: (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div 
        style={{
          width: '32px',
          height: '32px',
          background: 'linear-gradient(135deg, #00f5d4, #9b5de5)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          color: '#000',
          fontSize: '16px'
        }}
      >
        Δ
      </div>
      <span style={{ fontWeight: 'bold', fontSize: '20px' }}>Yield Delta</span>
    </div>
  ),
  project: {
    link: 'https://github.com/your-org/sei-dlp-core',
  },
  chat: {
    link: 'https://discord.gg/sei',
    icon: (
      <svg width="24" height="24" viewBox="0 0 256 256" fill="currentColor">
        <path d="M216 40H40a16 16 0 0 0-16 16v144a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16Z"/>
      </svg>
    )
  },
  docsRepositoryBase: 'https://github.com/your-org/sei-dlp-core/tree/main',
  footer: {
    text: '© 2024 Yield Delta. AI-Powered DeFi on SEI Network.',
  },
  search: {
    placeholder: 'Search documentation...'
  },
  editLink: {
    text: 'Edit this page on GitHub →'
  },
  feedback: {
    content: 'Question? Give us feedback →',
    labels: 'feedback'
  },
  sidebar: {
    defaultMenuCollapseLevel: 1,
    toggleButton: true
  },
  toc: {
    backToTop: true
  },
  lastUpdated: (
    <div style={{ fontSize: '12px', color: '#666' }}>
      Last updated: {new Date().toLocaleDateString()}
    </div>
  ),
  banner: (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      🎭 Demo Mode Active - 
      <a 
        href="/docs/demo-mode" 
        style={{ textDecoration: 'underline' }}
      >
        Learn about demo features →
      </a>
    </div>
  ),
  navbar: (
    <div style={{ display: 'flex', gap: '8px' }}>
      <a 
        href="/vaults" 
        style={{
          padding: '6px 12px',
          background: 'linear-gradient(135deg, #00f5d4, #9b5de5)',
          color: '#000',
          borderRadius: '6px',
          fontWeight: 'bold',
          fontSize: '14px',
          textDecoration: 'none'
        }}
      >
        Launch App
      </a>
    </div>
  )
}

export default config