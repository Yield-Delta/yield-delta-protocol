'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

interface CodeBlockProps {
  code: string
  language?: string
  title?: string
  showLineNumbers?: boolean
}

export function CodeBlock({ code, language = 'typescript', title, showLineNumbers = false }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const lines = code.split('\n')

  return (
    <div className="code-block-wrapper group relative my-6">
      {/* Header with title and language badge */}
      {(title || language) && (
        <div className="flex items-center justify-between px-4 py-2 rounded-t-xl border border-b-0"
          style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.5) 100%)',
            borderColor: 'rgba(6, 182, 212, 0.2)',
          }}
        >
          <div className="flex items-center gap-3">
            {title && <span className="text-sm font-semibold text-cyan-300">{title}</span>}
            {language && (
              <span className="px-2 py-0.5 text-xs font-bold uppercase tracking-wider rounded"
                style={{
                  background: 'rgba(6, 182, 212, 0.15)',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  color: '#06b6d4',
                }}
              >
                {language}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Code container with premium glassmorphic design */}
      <div className="relative overflow-hidden rounded-xl"
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%)',
          border: '1px solid rgba(6, 182, 212, 0.2)',
          boxShadow: `
            0 8px 32px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.05),
            inset 0 0 60px rgba(6, 182, 212, 0.03),
            0 0 0 1px rgba(6, 182, 212, 0.1)
          `,
        }}
      >
        {/* Animated gradient border effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(20, 184, 166, 0.08) 50%, rgba(6, 182, 212, 0.1) 100%)',
            backgroundSize: '200% 200%',
            animation: 'gradient-shift 3s ease infinite',
          }}
        />

        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.5) 50%, transparent)',
          }}
        />

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
          style={{
            background: copied
              ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.1))'
              : 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9))',
            border: copied
              ? '1px solid rgba(34, 197, 94, 0.4)'
              : '1px solid rgba(148, 163, 184, 0.3)',
            backdropFilter: 'blur(12px)',
            boxShadow: copied
              ? '0 4px 12px rgba(34, 197, 94, 0.2)'
              : '0 4px 12px rgba(0, 0, 0, 0.3)',
          }}
          aria-label={copied ? 'Copied!' : 'Copy code'}
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
          )}
        </button>

        {/* Code content */}
        <pre className="overflow-x-auto p-6 m-0 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
          <code className="block font-mono text-sm leading-relaxed">
            {showLineNumbers ? (
              <table className="w-full border-collapse">
                <tbody>
                  {lines.map((line, index) => (
                    <tr key={index}>
                      <td className="pr-4 text-right select-none" style={{ color: 'rgba(148, 163, 184, 0.4)' }}>
                        {index + 1}
                      </td>
                      <td className="text-slate-200">
                        {line || '\n'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <span className="text-slate-200">{code}</span>
            )}
          </code>
        </pre>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.3) 50%, transparent)',
          }}
        />
      </div>
    </div>
  )
}

// Inline code component for use within text
export function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="inline-flex items-center px-2 py-0.5 rounded-md font-mono text-sm font-medium"
      style={{
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(6, 182, 212, 0.1))',
        border: '1px solid rgba(6, 182, 212, 0.3)',
        color: '#22d3ee',
        boxShadow: '0 0 10px rgba(6, 182, 212, 0.1)',
      }}
    >
      {children}
    </code>
  )
}
