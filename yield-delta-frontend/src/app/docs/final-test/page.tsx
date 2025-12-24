/**
 * Final Test Page
 * Verifies all syntax highlighting fixes
 */

import { CodeBlock } from '@/components/docs/CodeBlock';

export default function FinalTestPage() {
  return (
    <div className="docs-content max-w-4xl mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Final Syntax Highlighting Test</h1>

      <h2 className="text-2xl font-semibold mb-4">Bash Tests</h2>

      <h3 className="text-xl font-semibold mb-3">Simple Commands</h3>
      <CodeBlock
        code={`echo "Hello World"
curl https://example.com
git clone https://github.com/user/repo.git`}
        language="bash"
      />

      <h3 className="text-xl font-semibold mb-3">With Comments and Variables</h3>
      <CodeBlock
        code={`# This is a comment
export API_URL="https://api.example.com"
echo "API URL is: $API_URL"
curl $API_URL/endpoint`}
        language="bash"
      />

      <h3 className="text-xl font-semibold mb-3">With Line Numbers</h3>
      <CodeBlock
        code={`#!/bin/bash
# Setup script
npm install
npm run build
npm start`}
        language="bash"
        showLineNumbers={true}
      />

      <h2 className="text-2xl font-semibold mb-4 mt-8">JavaScript Tests</h2>

      <h3 className="text-xl font-semibold mb-3">Basic JavaScript</h3>
      <CodeBlock
        code={`const greeting = "Hello World";
console.log(greeting);
const result = Math.max(10, 20);`}
        language="javascript"
      />

      <h3 className="text-xl font-semibold mb-3">Template Literals</h3>
      <CodeBlock
        code={`const name = "World";
const message = \`Hello, \${name}!\`;
console.log(message);`}
        language="javascript"
      />

      <h2 className="text-2xl font-semibold mb-4 mt-8">TypeScript Test</h2>
      <CodeBlock
        code={`interface User {
  name: string;
  email: string;
}

function greet(user: User): string {
  return \`Hello, \${user.name}!\`;
}`}
        language="typescript"
      />

      <div className="mt-12 p-6 bg-green-500/10 border border-green-500/30 rounded-lg">
        <h3 className="font-bold mb-2">✅ Expected Results:</h3>
        <ul className="space-y-1 text-sm">
          <li>• All code should be properly syntax highlighted</li>
          <li>• NO visible &lt;span&gt; tags in the output</li>
          <li>• Strings in green, keywords in purple, commands in purple</li>
          <li>• URLs should remain intact without broken highlighting</li>
          <li>• Comments in gray italic</li>
          <li>• Variables in cyan</li>
        </ul>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Final Test - Yield Delta Documentation',
  description: 'Final verification of syntax highlighting fixes',
};