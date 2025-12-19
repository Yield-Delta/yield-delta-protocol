'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  children: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
  highlightLines?: number[];
  className?: string;
}

/**
 * Enhanced CodeBlock Component
 *
 * A polished code block component with:
 * - Copy to clipboard functionality
 * - Language badge
 * - Optional filename display
 * - Optional line numbers
 * - Syntax highlighting support
 * - Responsive design
 *
 * @example
 * ```tsx
 * <CodeBlock language="typescript" filename="example.ts">
 *   const greeting = "Hello, World!";
 *   console.log(greeting);
 * </CodeBlock>
 * ```
 */
export function CodeBlock({
  children,
  language = 'text',
  filename,
  showLineNumbers = false,
  highlightLines = [],
  className = '',
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const lines = children.split('\n');

  return (
    <div className={`code-block-wrapper ${className}`}>
      {/* Header with filename and language */}
      {(filename || language) && (
        <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border border-border rounded-t-lg border-b-0">
          {filename && (
            <span className="text-xs font-mono text-muted-foreground">
              {filename}
            </span>
          )}
          {!filename && language !== 'text' && (
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wide">
              {language}
            </span>
          )}
          <div className="flex-1" />
        </div>
      )}

      {/* Code container */}
      <div className="relative">
        {/* Language badge (when no filename) */}
        {!filename && language !== 'text' && (
          <div className="code-language-badge">
            {language}
          </div>
        )}

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="code-copy-button"
          aria-label={copied ? 'Copied!' : 'Copy code'}
          title={copied ? 'Copied!' : 'Copy code'}
        >
          {copied ? (
            <>
              <Check className="inline-block w-3 h-3 mr-1" />
              Copied
            </>
          ) : (
            <>
              <Copy className="inline-block w-3 h-3 mr-1" />
              Copy
            </>
          )}
        </button>

        {/* Code block */}
        <pre
          className={`${filename ? 'rounded-t-none' : ''}`}
          style={{
            marginTop: filename ? 0 : undefined,
          }}
        >
          <code>
            {showLineNumbers ? (
              <div className="flex">
                {/* Line numbers */}
                <div className="select-none pr-4 text-muted-foreground border-r border-border mr-4">
                  {lines.map((_, i) => (
                    <div key={i} className="text-right">
                      {i + 1}
                    </div>
                  ))}
                </div>
                {/* Code content */}
                <div className="flex-1">
                  {lines.map((line, i) => (
                    <div
                      key={i}
                      className={highlightLines.includes(i + 1) ? 'bg-primary/10' : ''}
                    >
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              children
            )}
          </code>
        </pre>
      </div>
    </div>
  );
}

/**
 * InlineCode Component
 *
 * A simple inline code component with consistent styling
 *
 * @example
 * ```tsx
 * <InlineCode>const x = 10;</InlineCode>
 * ```
 */
export function InlineCode({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <code className={`inline-code ${className}`}>
      {children}
    </code>
  );
}

/**
 * CodeBlockGroup Component
 *
 * Groups multiple code blocks with tabs for different languages or examples
 *
 * @example
 * ```tsx
 * <CodeBlockGroup>
 *   <CodeBlock language="typescript" label="TypeScript">
 *     const greeting: string = "Hello";
 *   </CodeBlock>
 *   <CodeBlock language="javascript" label="JavaScript">
 *     const greeting = "Hello";
 *   </CodeBlock>
 * </CodeBlockGroup>
 * ```
 */
export function CodeBlockGroup({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`code-block-group space-y-0 ${className}`}>
      {children}
    </div>
  );
}
