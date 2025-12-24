/**
 * Debug Raw HTML Page
 * Shows exactly what HTML is being generated
 */

'use client';

import { useState, useEffect } from 'react';

function DebugHighlight({ code, language }: { code: string; language: string }) {
  const [steps, setSteps] = useState<{ step: string; content: string }[]>([]);

  useEffect(() => {
    const debugSteps: { step: string; content: string }[] = [];

    // Step 1: Original code
    debugSteps.push({ step: '1. Original', content: code });

    // Step 2: Escape HTML
    let escaped = code
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    debugSteps.push({ step: '2. After HTML escape', content: escaped });

    // Step 3: Apply simple highlighting
    let highlighted = escaped;
    if (language === 'bash') {
      // Just highlight echo command as a test
      highlighted = highlighted.replace(/\b(echo)\b/g, '<span class="hl-keyword">$1</span>');
      debugSteps.push({ step: '3. After highlighting', content: highlighted });
    }

    setSteps(debugSteps);
  }, [code, language]);

  return (
    <div className="space-y-4">
      {steps.map((step, i) => (
        <div key={i} className="border rounded p-3">
          <h4 className="font-bold mb-2">{step.step}</h4>
          <pre className="bg-gray-900 p-2 rounded text-xs text-green-400 whitespace-pre-wrap break-all">
            {step.content}
          </pre>
        </div>
      ))}

      <div className="border-2 border-blue-500 rounded p-3">
        <h4 className="font-bold mb-2">4. Final render with dangerouslySetInnerHTML</h4>
        <pre className="bg-gray-900 p-4 rounded">
          <code dangerouslySetInnerHTML={{ __html: steps[steps.length - 1]?.content || '' }} />
        </pre>
      </div>

      <div className="border-2 border-red-500 rounded p-3">
        <h4 className="font-bold mb-2">5. Direct test (should show colored "echo")</h4>
        <pre className="bg-gray-900 p-4 rounded">
          <code dangerouslySetInnerHTML={{ __html: 'Test: <span style="color: red;">echo</span> command' }} />
        </pre>
      </div>
    </div>
  );
}

export default function DebugRawPage() {
  return (
    <div className="docs-content max-w-4xl mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Debug Raw HTML</h1>

      <p className="mb-8 text-yellow-500">
        This page shows exactly what's happening at each step of syntax highlighting.
      </p>

      <h2 className="text-2xl font-semibold mb-4">Test 1: Simple echo command</h2>
      <DebugHighlight code='echo "Hello"' language="bash" />

      <style dangerouslySetInnerHTML={{
        __html: `.hl-keyword { color: #a78bfa !important; font-weight: bold; }`
      }} />
    </div>
  );
}