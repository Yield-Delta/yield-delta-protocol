import React from 'react'
import { DocsThemeConfig } from 'nextra-theme-docs'

const config: DocsThemeConfig = {
  logo: <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Yield Delta</span>,
  project: {
    link: 'https://github.com/yield-delta/protocol',
  },
  chat: {
    link: 'https://discord.gg/sei',
  },
  docsRepositoryBase: 'https://github.com/yield-delta/protocol/tree/main/yield-delta-frontend/src/app/docs',
  footer: {
    text: 'Yield Delta Documentation - Built with ❤️ on SEI Network',
  },
  sidebar: {
    titleComponent({ title, type }) {
      if (type === 'separator') {
        return <span className="cursor-default">{title}</span>
      }
      return <>{title}</>
    },
    defaultMenuCollapseLevel: 1,
    toggleButton: true,
  },
  toc: {
    backToTop: true,
  },
  editLink: {
    text: 'Edit this page on GitHub →'
  },
  feedback: {
    content: 'Question? Give us feedback →',
    labels: 'feedback'
  },
  search: {
    placeholder: 'Search documentation...'
  },
  primaryHue: 180, // Cyan/teal color to match the site theme
  primarySaturation: 100,
  useNextSeoProps() {
    return {
      titleTemplate: '%s – Yield Delta Docs'
    }
  },
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta property="og:title" content="Yield Delta Documentation" />
      <meta property="og:description" content="AI-powered yield optimization on SEI Network" />
      <link rel="icon" href="/favicon.ico" />
    </>
  ),
  navigation: {
    prev: true,
    next: true
  },
  darkMode: true,
  nextThemes: {
    defaultTheme: 'dark'
  }
}

export default config