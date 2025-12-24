/**
 * Simple Bash Test Page
 * Minimal test to debug span rendering issue
 */

import { CodeBlock } from '@/components/docs/CodeBlock';

export default function TestBashSimplePage() {
  const simpleCode = `echo "Hello World"`;
  const urlCode = `curl https://example.com`;

  return (
    <div className="docs-content max-w-4xl mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Simple Bash Test</h1>

      <h2 className="text-2xl font-semibold mb-4">Test 1: Very Simple Echo</h2>
      <CodeBlock
        code={simpleCode}
        language="bash"
      />

      <h2 className="text-2xl font-semibold mb-4">Test 2: Simple URL</h2>
      <CodeBlock
        code={urlCode}
        language="bash"
      />

      <h2 className="text-2xl font-semibold mb-4">Test 3: Plain Text (No Highlighting)</h2>
      <CodeBlock
        code={simpleCode}
        language="text"
      />

      <h2 className="text-2xl font-semibold mb-4">Test 4: JavaScript (For Comparison)</h2>
      <CodeBlock
        code={`console.log("Hello World");`}
        language="javascript"
      />

      <div className="mt-12 p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
        <p className="text-sm">
          <strong>Expected:</strong> Code should be highlighted with colors, not showing raw &lt;span&gt; tags
        </p>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Simple Bash Test - Yield Delta Documentation',
  description: 'Minimal test for bash span rendering issue',
};