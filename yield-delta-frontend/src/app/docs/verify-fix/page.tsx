/**
 * Verify Fix Page
 * Tests if the HTML escaping fix works
 */

import { CodeBlock } from '@/components/docs/CodeBlock';

export default function VerifyFixPage() {
  return (
    <div className="docs-content max-w-4xl mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Verify HTML Fix</h1>

      <h2 className="text-2xl font-semibold mb-4">Bash Code</h2>
      <CodeBlock
        code={`echo "Hello World"
curl "https://example.com"
export URL='https://api.example.com'`}
        language="bash"
      />

      <h2 className="text-2xl font-semibold mb-4 mt-6">JavaScript Code</h2>
      <CodeBlock
        code={`const greeting = "Hello World";
console.log(greeting);
const url = 'https://api.example.com';`}
        language="javascript"
      />

      <h2 className="text-2xl font-semibold mb-4 mt-6">With Special Characters</h2>
      <CodeBlock
        code={`# Test with < and > characters
if [ $value -lt 10 ] && [ $value -gt 0 ]; then
  echo "Value is between 0 and 10"
fi`}
        language="bash"
      />

      <div className="mt-8 p-6 bg-green-500/10 border border-green-500/30 rounded-lg">
        <h3 className="font-bold mb-2">Expected Results:</h3>
        <ul className="space-y-1 text-sm">
          <li>✅ "Hello World" should be green (string)</li>
          <li>✅ echo, curl, export should be purple (keywords)</li>
          <li>✅ Comments should be gray italic</li>
          <li>✅ Variables like $value should be cyan</li>
          <li>✅ NO visible &lt;span&gt; tags</li>
        </ul>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Verify Fix - Yield Delta Documentation',
  description: 'Verify HTML escaping fix for syntax highlighting',
};