/**
 * Complete Test Page
 * Tests JavaScript highlighting and language badge styling
 */

import { CodeBlock } from '@/components/docs/CodeBlock';

export default function TestCompletePage() {
  return (
    <div className="docs-content max-w-4xl mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Complete Syntax Highlighting Test</h1>

      <h2 className="text-2xl font-semibold mb-4">JavaScript (Yellow Badge)</h2>
      <CodeBlock
        code={`// JavaScript example
const greeting = "Hello World";
const name = 'John Doe';
const message = \`Welcome, \${name}!\`;
console.log(message);

// Function example
function calculateSum(a, b) {
  return a + b;
}

const result = calculateSum(10, 20);`}
        language="javascript"
      />

      <h2 className="text-2xl font-semibold mb-4 mt-8">TypeScript (Blue Badge)</h2>
      <CodeBlock
        code={`// TypeScript example
interface User {
  name: string;
  email: string;
  age?: number;
}

const user: User = {
  name: "Alice",
  email: 'alice@example.com'
};

function greet(user: User): string {
  return \`Hello, \${user.name}!\`;
}`}
        language="typescript"
      />

      <h2 className="text-2xl font-semibold mb-4 mt-8">Bash (Green Badge)</h2>
      <CodeBlock
        code={`#!/bin/bash
# Bash script example
echo "Starting deployment..."
npm install
npm run build

# Set environment variable
export API_URL="https://api.example.com"
curl "$API_URL/health"`}
        language="bash"
      />

      <h2 className="text-2xl font-semibold mb-4 mt-8">JSON (Purple Badge)</h2>
      <CodeBlock
        code={`{
  "name": "yield-delta",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build"
  },
  "dependencies": {
    "react": "^18.0.0",
    "next": "^13.0.0"
  }
}`}
        language="json"
      />

      <h2 className="text-2xl font-semibold mb-4 mt-8">With Title and Language</h2>
      <CodeBlock
        code={`// Example with both title and language badge
const config = {
  apiUrl: "https://api.example.com",
  timeout: 5000
};`}
        language="javascript"
        title="config.js"
      />

      <h2 className="text-2xl font-semibold mb-4 mt-8">Plain Text (No Badge)</h2>
      <CodeBlock
        code={`This is plain text.
No syntax highlighting applied.
No language badge shown.`}
        language="text"
      />

      <div className="mt-12 p-6 bg-green-500/10 border border-green-500/30 rounded-lg">
        <h3 className="font-bold mb-2">✅ Expected Results:</h3>
        <ul className="space-y-2 text-sm">
          <li>• <strong>Language Badges:</strong></li>
          <li className="ml-4">- JavaScript: Yellow background with yellow text</li>
          <li className="ml-4">- TypeScript: Blue background with blue text</li>
          <li className="ml-4">- Bash: Green background with green text</li>
          <li className="ml-4">- JSON: Purple background with purple text</li>
          <li className="ml-4">- Plain text: No badge shown</li>
          <li className="mt-3">• <strong>Syntax Highlighting:</strong></li>
          <li className="ml-4">- Strings: Green (including template literals)</li>
          <li className="ml-4">- Keywords: Purple</li>
          <li className="ml-4">- Comments: Gray italic</li>
          <li className="ml-4">- Numbers: Orange</li>
          <li className="ml-4">- NO visible HTML tags or class attributes</li>
        </ul>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Complete Test - Yield Delta Documentation',
  description: 'Complete test of syntax highlighting and language badges',
};