'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

interface CodeBlockProps {
  code: string
  language?: string
  title?: string
  showLineNumbers?: boolean
}

// Syntax highlighting function
function highlightCode(code: string, language: string): string {
  const patterns: Record<string, { pattern: RegExp; replacement: string }[]> = {
    javascript: [
      // Comments
      { pattern: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm, replacement: '<span style="color: #6b7280; font-style: italic;">$1</span>' },
      // Strings (single and double quotes)
      { pattern: /(['"`])((?:\\.|[^\\])*?)\1/g, replacement: '<span style="color: #34d399;">$1$2$1</span>' },
      // Keywords
      { pattern: /\b(const|let|var|function|async|await|return|if|else|for|while|do|break|continue|switch|case|default|try|catch|finally|throw|new|typeof|instanceof|this|super|class|extends|import|export|from|default|as|null|undefined|true|false)\b/g, replacement: '<span style="color: #a78bfa;">$1</span>' },
      // Numbers
      { pattern: /\b(\d+\.?\d*)\b/g, replacement: '<span style="color: #fb923c;">$1</span>' },
      // Functions (word followed by parenthesis)
      { pattern: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g, replacement: '<span style="color: #60a5fa;">$1</span>' },
      // Properties (after a dot)
      { pattern: /\.([a-zA-Z_$][a-zA-Z0-9_$]*)/g, replacement: '.<span style="color: #22d3ee;">$1</span>' },
      // Methods
      { pattern: /\b(console|window|document|navigator|Math|JSON|Object|Array|String|Number|Boolean|Date|Promise)\b/g, replacement: '<span style="color: #f472b6;">$1</span>' },
    ],
    typescript: [
      // Comments
      { pattern: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm, replacement: '<span style="color: #6b7280; font-style: italic;">$1</span>' },
      // Strings
      { pattern: /(['"`])((?:\\.|[^\\])*?)\1/g, replacement: '<span style="color: #34d399;">$1$2$1</span>' },
      // Keywords
      { pattern: /\b(const|let|var|function|async|await|return|if|else|for|while|do|break|continue|switch|case|default|try|catch|finally|throw|new|typeof|instanceof|this|super|class|extends|implements|interface|type|enum|namespace|import|export|from|default|as|null|undefined|true|false|public|private|protected|readonly|static)\b/g, replacement: '<span style="color: #a78bfa;">$1</span>' },
      // Numbers
      { pattern: /\b(\d+\.?\d*)\b/g, replacement: '<span style="color: #fb923c;">$1</span>' },
      // Types
      { pattern: /:\s*([A-Z][a-zA-Z0-9_]*|string|number|boolean|void|any|unknown|never|object)\b/g, replacement: ': <span style="color: #fbbf24;">$1</span>' },
      // Functions
      { pattern: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g, replacement: '<span style="color: #60a5fa;">$1</span>' },
      // Properties
      { pattern: /\.([a-zA-Z_$][a-zA-Z0-9_$]*)/g, replacement: '.<span style="color: #22d3ee;">$1</span>' },
    ],
    json: [
      // Property keys
      { pattern: /"([^"]+)":/g, replacement: '<span style="color: #60a5fa;">"$1"</span>:' },
      // String values
      { pattern: /:\s*"([^"]*)"/g, replacement: ': <span style="color: #34d399;">"$1"</span>' },
      // Numbers
      { pattern: /:\s*(-?\d+\.?\d*)/g, replacement: ': <span style="color: #fb923c;">$1</span>' },
      // Booleans and null
      { pattern: /\b(true|false|null)\b/g, replacement: '<span style="color: #a78bfa;">$1</span>' },
      // Brackets and braces
      { pattern: /([{}\[\]])/g, replacement: '<span style="color: #94a3b8;">$1</span>' },
    ],
    solidity: [
      // Comments
      { pattern: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm, replacement: '<span style="color: #6b7280; font-style: italic;">$1</span>' },
      // Strings
      { pattern: /(['"])((?:\\.|[^\\])*?)\1/g, replacement: '<span style="color: #34d399;">$1$2$1</span>' },
      // Keywords
      { pattern: /\b(pragma|solidity|contract|interface|library|struct|enum|event|function|modifier|constructor|fallback|receive|external|public|internal|private|pure|view|payable|returns|return|if|else|for|while|do|break|continue|throw|emit|new|delete|this|super|import|from|as|is|memory|storage|calldata|indexed)\b/g, replacement: '<span style="color: #a78bfa;">$1</span>' },
      // Types
      { pattern: /\b(uint256|uint128|uint64|uint32|uint16|uint8|int256|int|address|bool|bytes32|bytes|string|mapping)\b/g, replacement: '<span style="color: #fbbf24;">$1</span>' },
      // Numbers
      { pattern: /\b(\d+\.?\d*)\b/g, replacement: '<span style="color: #fb923c;">$1</span>' },
      // Functions
      { pattern: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g, replacement: '<span style="color: #60a5fa;">$1</span>' },
      // Properties
      { pattern: /\.([a-zA-Z_$][a-zA-Z0-9_$]*)/g, replacement: '.<span style="color: #22d3ee;">$1</span>' },
    ]
  }

  let highlighted = code
  const languagePatterns = patterns[language] || patterns.javascript

  // Apply patterns in order
  languagePatterns.forEach(({ pattern, replacement }) => {
    highlighted = highlighted.replace(pattern, replacement)
  })

  return highlighted
}

export function CodeBlock({ code, language = 'typescript', title, showLineNumbers = false }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const lines = code.split('\n')
  const highlightedCode = highlightCode(code, language)

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
          className="absolute top-3 right-3 p-2 rounded-lg opacity-60 hover:opacity-100 transition-all duration-300 z-10"
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
                      <td
                        className="text-slate-200"
                        dangerouslySetInnerHTML={{
                          __html: highlightCode(line, language) || '<br/>'
                        }}
                      />
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <span
                dangerouslySetInnerHTML={{ __html: highlightedCode }}
              />
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
