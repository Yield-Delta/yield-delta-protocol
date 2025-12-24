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
  // Don't apply syntax highlighting to plain text
  if (language === 'text' || language === 'plaintext') {
    return code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Work with the raw code - we'll handle escaping carefully
  let highlighted = code
    // First escape HTML entities properly
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/`/g, '&#96;')

  const patterns: Record<string, { pattern: RegExp; replacement: string }[]> = {
    bash: [
      // Double quoted strings (now escaped as &quot;)
      { pattern: /&quot;([^&]|&(?!quot;))*&quot;/g, replacement: '<span class="hl-string">$&</span>' },
      // Single quoted strings (now escaped as &#039;)
      { pattern: /&#039;([^&]|&(?!#039;))*&#039;/g, replacement: '<span class="hl-string">$&</span>' },
      // Comments (# at start of line or after whitespace)
      { pattern: /(^|\s)(#[^\n]*)/gm, replacement: '$1<span class="hl-comment">$2</span>' },
      // Variables ($VAR or ${VAR})
      { pattern: /\$\{?[A-Za-z_][A-Za-z0-9_]*\}?/g, replacement: '<span class="hl-property">$&</span>' },
      // Commands/keywords (only as whole words)
      { pattern: /\b(if|then|else|elif|fi|for|while|do|done|case|esac|function|return|export|source|alias|unset|set|echo|printf|read|cd|ls|pwd|mkdir|rm|cp|mv|touch|cat|grep|sed|awk|find|chmod|chown|curl|wget|git|npm|yarn|pnpm|bun|docker|kubectl|apt|apt-get|yum|brew|sudo|su|exit|break|continue)\b/g, replacement: '<span class="hl-keyword">$1</span>' },
      // Flags (single dash with single letter)
      { pattern: /(^|\s)(-[a-zA-Z])(?=\s|$)/g, replacement: '$1<span class="hl-type">$2</span>' },
      // Long flags (double dash)
      { pattern: /(^|\s)(--[a-zA-Z][a-zA-Z0-9-]*)/g, replacement: '$1<span class="hl-type">$2</span>' },
      // Numbers (but not in URLs or identifiers)
      { pattern: /\b(\d+)(?!\w|:)/g, replacement: '<span class="hl-number">$1</span>' },
      // Operators (need to match escaped versions)
      { pattern: /(&amp;&amp;|\|\||&gt;&gt;|&lt;&lt;|\||&amp;|&lt;|&gt;)/g, replacement: '<span class="hl-bracket">$&</span>' },
    ],
    javascript: [
      // Template literals (backticks now escaped as &#96;)
      { pattern: /&#96;([^&#]|&#(?!96;)|\$\{[^}]*\})*&#96;/g, replacement: '<span class="hl-string">$&</span>' },
      // Double quoted strings (now escaped as &quot;)
      { pattern: /&quot;([^&]|&(?!quot;))*&quot;/g, replacement: '<span class="hl-string">$&</span>' },
      // Single quoted strings (now escaped as &#039;)
      { pattern: /&#039;([^&]|&(?!#039;))*&#039;/g, replacement: '<span class="hl-string">$&</span>' },
      // Single-line comments
      { pattern: /\/\/[^\n]*/g, replacement: '<span class="hl-comment">$&</span>' },
      // Multi-line comments
      { pattern: /\/\*[\s\S]*?\*\//g, replacement: '<span class="hl-comment">$&</span>' },
      // Keywords
      { pattern: /\b(const|let|var|function|async|await|return|if|else|for|while|do|break|continue|switch|case|default|try|catch|finally|throw|new|typeof|instanceof|this|super|class|extends|import|export|from|default|as|null|undefined|true|false)\b/g, replacement: '<span class="hl-keyword">$1</span>' },
      // Numbers
      { pattern: /\b(\d+\.?\d*)\b/g, replacement: '<span class="hl-number">$1</span>' },
      // Functions (word followed by parenthesis)
      { pattern: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g, replacement: '<span class="hl-function">$1</span>' },
      // Properties (after a dot)
      { pattern: /\.([a-zA-Z_$][a-zA-Z0-9_$]*)/g, replacement: '.<span class="hl-property">$1</span>' },
      // Methods
      { pattern: /\b(console|window|document|navigator|Math|JSON|Object|Array|String|Number|Boolean|Date|Promise)\b/g, replacement: '<span class="hl-method">$1</span>' },
    ],
    typescript: [
      // Template literals (backticks now escaped as &#96;)
      { pattern: /&#96;([^&#]|&#(?!96;)|\$\{[^}]*\})*&#96;/g, replacement: '<span class="hl-string">$&</span>' },
      // Double quoted strings (now escaped as &quot;)
      { pattern: /&quot;([^&]|&(?!quot;))*&quot;/g, replacement: '<span class="hl-string">$&</span>' },
      // Single quoted strings (now escaped as &#039;)
      { pattern: /&#039;([^&]|&(?!#039;))*&#039;/g, replacement: '<span class="hl-string">$&</span>' },
      // Single-line comments
      { pattern: /\/\/[^\n]*/g, replacement: '<span class="hl-comment">$&</span>' },
      // Multi-line comments
      { pattern: /\/\*[\s\S]*?\*\//g, replacement: '<span class="hl-comment">$&</span>' },
      // Keywords
      { pattern: /\b(const|let|var|function|async|await|return|if|else|for|while|do|break|continue|switch|case|default|try|catch|finally|throw|new|typeof|instanceof|this|super|class|extends|implements|interface|type|enum|namespace|import|export|from|default|as|null|undefined|true|false|public|private|protected|readonly|static)\b/g, replacement: '<span class="hl-keyword">$1</span>' },
      // Numbers
      { pattern: /\b(\d+\.?\d*)\b/g, replacement: '<span class="hl-number">$1</span>' },
      // Types
      { pattern: /:\s*([A-Z][a-zA-Z0-9_]*|string|number|boolean|void|any|unknown|never|object)\b/g, replacement: ': <span class="hl-type">$1</span>' },
      // Functions
      { pattern: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g, replacement: '<span class="hl-function">$1</span>' },
      // Properties
      { pattern: /\.([a-zA-Z_$][a-zA-Z0-9_$]*)/g, replacement: '.<span class="hl-property">$1</span>' },
    ],
    json: [
      // Property keys (with escaped quotes)
      { pattern: /&quot;([^&]+)&quot;:/g, replacement: '<span class="hl-function">$&</span>' },
      // String values (with escaped quotes)
      { pattern: /:\s*&quot;([^&]*)&quot;/g, replacement: ': <span class="hl-string">&quot;$1&quot;</span>' },
      // Numbers
      { pattern: /:\s*(-?\d+\.?\d*)/g, replacement: ': <span class="hl-number">$1</span>' },
      // Booleans and null
      { pattern: /\b(true|false|null)\b/g, replacement: '<span class="hl-keyword">$1</span>' },
      // Brackets and braces
      { pattern: /([{}\[\]])/g, replacement: '<span class="hl-bracket">$1</span>' },
    ],
    solidity: [
      // Comments
      { pattern: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm, replacement: '<span class="hl-comment">$1</span>' },
      // Double quoted strings (escaped)
      { pattern: /&quot;([^&]|&(?!quot;))*&quot;/g, replacement: '<span class="hl-string">$&</span>' },
      // Single quoted strings (escaped)
      { pattern: /&#039;([^&]|&(?!#039;))*&#039;/g, replacement: '<span class="hl-string">$&</span>' },
      // Keywords
      { pattern: /\b(pragma|solidity|contract|interface|library|struct|enum|event|function|modifier|constructor|fallback|receive|external|public|internal|private|pure|view|payable|returns|return|if|else|for|while|do|break|continue|throw|emit|new|delete|this|super|import|from|as|is|memory|storage|calldata|indexed)\b/g, replacement: '<span class="hl-keyword">$1</span>' },
      // Types
      { pattern: /\b(uint256|uint128|uint64|uint32|uint16|uint8|int256|int|address|bool|bytes32|bytes|string|mapping)\b/g, replacement: '<span class="hl-type">$1</span>' },
      // Numbers
      { pattern: /\b(\d+\.?\d*)\b/g, replacement: '<span class="hl-number">$1</span>' },
      // Functions
      { pattern: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g, replacement: '<span class="hl-function">$1</span>' },
      // Properties
      { pattern: /\.([a-zA-Z_$][a-zA-Z0-9_$]*)/g, replacement: '.<span class="hl-property">$1</span>' },
    ]
  }

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

  const highlightedCode = highlightCode(code, language)

  // Language badge colors
  const getLanguageColor = (lang: string) => {
    const colors: Record<string, string> = {
      javascript: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      typescript: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      bash: 'bg-green-500/20 text-green-400 border-green-500/30',
      json: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      solidity: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      python: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      text: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    }
    return colors[lang] || 'bg-slate-500/20 text-slate-400 border-slate-500/30'
  }

  return (
    <>
      {/* Inject syntax highlighting styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .hl-comment { color: #6b7280; font-style: italic; }
          .hl-string { color: #34d399; }
          .hl-keyword { color: #a78bfa; }
          .hl-number { color: #fb923c; }
          .hl-function { color: #60a5fa; }
          .hl-property { color: #22d3ee; }
          .hl-method { color: #f472b6; }
          .hl-type { color: #fbbf24; }
          .hl-bracket { color: #94a3b8; }
        `
      }} />

      <div className="code-block-wrapper group relative my-6">

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
        {/* Copy button - moved to avoid overlap */}
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 p-2 rounded-lg opacity-60 hover:opacity-100 transition-all duration-300 z-20"
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
          {/* Language badge - positioned inline at top of code area */}
          {(language || title) && (
            <div className="flex items-center gap-3 mb-4">
              {title && (
                <span className="text-sm font-medium text-slate-300">
                  {title}
                </span>
              )}
              {language && language !== 'text' && (
                <span className={`inline-flex items-center px-2.5 py-1 text-xs font-mono uppercase tracking-wider rounded-md border ${getLanguageColor(language)}`}>
                  {language}
                </span>
              )}
            </div>
          )}
          {showLineNumbers ? (
            <code className="block font-mono text-sm leading-relaxed text-slate-200">
              <table className="w-full border-collapse">
                <tbody>
                  {highlightedCode.split('\n').map((line, index) => (
                    <tr key={index}>
                      <td className="pr-4 text-right select-none" style={{ color: 'rgba(148, 163, 184, 0.4)' }}>
                        {index + 1}
                      </td>
                      <td
                        className="text-slate-200"
                        dangerouslySetInnerHTML={{
                          __html: line || '<br/>'
                        }}
                      />
                    </tr>
                  ))}
                </tbody>
              </table>
            </code>
          ) : (
            <code
              className="block font-mono text-sm leading-relaxed text-slate-200"
              dangerouslySetInnerHTML={{ __html: highlightedCode }}
            />
          )}
        </pre>
      </div>
      </div>
    </>
  )
}

// Inline code component for use within text
export function InlineCode({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <code className={`inline-flex items-center px-2 py-0.5 rounded-md font-mono text-sm font-medium ${className}`}
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
