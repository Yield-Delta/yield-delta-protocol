/**
 * Minimal Test Page
 * Simplest possible test of syntax highlighting
 */

'use client';

import { useState } from 'react';
import { CodeBlock } from '@/components/docs/CodeBlock';

function SimpleHighlight({ code }: { code: string }) {
  // Very simple highlighting - just highlight "echo"
  const highlighted = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\b(echo)\b/g, '<span style="color: #a78bfa; font-weight: bold;">$1</span>');

  return (
    <div className="border rounded p-4">
      <h3 className="font-bold mb-2">Simple Test (should highlight "echo" in purple)</h3>
      <pre className="bg-gray-900 p-4 rounded">
        <code dangerouslySetInnerHTML={{ __html: highlighted }} />
      </pre>
      <details className="mt-2">
        <summary className="text-sm text-gray-400 cursor-pointer">View raw HTML</summary>
        <pre className="text-xs text-green-400 mt-2 p-2 bg-gray-800 rounded overflow-x-auto">
          {highlighted}
        </pre>
      </details>
    </div>
  );
}

export default function MinimalTestPage() {
  const [showRaw, setShowRaw] = useState(false);

  const testCode = `echo "Hello World"`;

  return (
    <div className="docs-content max-w-4xl mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Minimal Syntax Highlighting Test</h1>

      <div className="space-y-6">
        <SimpleHighlight code={testCode} />

        <div className="border rounded p-4">
          <h3 className="font-bold mb-2">Using CodeBlock Component</h3>
          <CodeBlock
            code={testCode}
            language="bash"
          />
        </div>

        <div className="border rounded p-4">
          <h3 className="font-bold mb-2">Direct HTML Test (should show purple "echo")</h3>
          <pre className="bg-gray-900 p-4 rounded">
            <code dangerouslySetInnerHTML={{
              __html: '<span style="color: #a78bfa;">echo</span> &quot;Hello World&quot;'
            }} />
          </pre>
        </div>

        <div className="border rounded p-4">
          <h3 className="font-bold mb-2">Check Console</h3>
          <p className="text-sm text-gray-400">
            Open browser console to see the highlighted code output from the CodeBlock component
          </p>
          <button
            onClick={() => setShowRaw(!showRaw)}
            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm"
          >
            {showRaw ? 'Hide' : 'Show'} Browser Console Instructions
          </button>
          {showRaw && (
            <div className="mt-2 p-3 bg-gray-800 rounded text-sm">
              <ol className="list-decimal list-inside space-y-1">
                <li>Right-click anywhere on the page</li>
                <li>Select "Inspect" or "Inspect Element"</li>
                <li>Click on the "Console" tab</li>
                <li>Look for "Highlighted code preview:" messages</li>
              </ol>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 p-6 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <h3 className="font-bold mb-2">What to Check:</h3>
        <ul className="space-y-1 text-sm">
          <li>• Simple Test: "echo" should be purple and bold</li>
          <li>• CodeBlock Component: Check if syntax highlighting works</li>
          <li>• Direct HTML Test: Should definitely work (hardcoded HTML)</li>
          <li>• Console: Shows what HTML the CodeBlock is generating</li>
        </ul>
        <p className="mt-3 text-sm font-semibold">
          If the Simple Test and Direct HTML Test work but CodeBlock doesn't,
          the issue is in the highlighting patterns.
        </p>
      </div>
    </div>
  );
}