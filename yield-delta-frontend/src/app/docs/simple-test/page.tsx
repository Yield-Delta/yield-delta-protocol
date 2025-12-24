/**
 * Simple Direct Test
 * Test dangerouslySetInnerHTML directly
 */

'use client';

export default function SimpleTestPage() {
  // Test HTML strings
  const test1 = 'Plain text';
  const test2 = 'Text with <span style="color: red;">red word</span> in it';
  const test3 = 'Text with <span class="hl-keyword">keyword</span> class';
  const test4 = 'echo &lt;span class="hl-keyword"&gt;hello&lt;/span&gt;'; // Double escaped
  const test5 = 'echo <span class="hl-keyword">hello</span>'; // Properly formatted

  return (
    <div className="docs-content max-w-4xl mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Simple Direct Test</h1>

      <style dangerouslySetInnerHTML={{
        __html: `.hl-keyword { color: #a78bfa !important; font-weight: bold; }`
      }} />

      <div className="space-y-6">
        <div className="border rounded p-4">
          <h3 className="font-bold mb-2">Test 1: Plain text</h3>
          <pre className="bg-gray-900 p-3 rounded">
            <code dangerouslySetInnerHTML={{ __html: test1 }} />
          </pre>
          <p className="text-sm mt-2 text-gray-400">Raw: {test1}</p>
        </div>

        <div className="border rounded p-4">
          <h3 className="font-bold mb-2">Test 2: Inline style (should be red)</h3>
          <pre className="bg-gray-900 p-3 rounded">
            <code dangerouslySetInnerHTML={{ __html: test2 }} />
          </pre>
          <p className="text-sm mt-2 text-gray-400">Raw: {test2}</p>
        </div>

        <div className="border rounded p-4">
          <h3 className="font-bold mb-2">Test 3: With class (should be purple)</h3>
          <pre className="bg-gray-900 p-3 rounded">
            <code dangerouslySetInnerHTML={{ __html: test3 }} />
          </pre>
          <p className="text-sm mt-2 text-gray-400">Raw: {test3}</p>
        </div>

        <div className="border rounded p-4">
          <h3 className="font-bold mb-2">Test 4: Double escaped (BAD - will show tags)</h3>
          <pre className="bg-gray-900 p-3 rounded">
            <code dangerouslySetInnerHTML={{ __html: test4 }} />
          </pre>
          <p className="text-sm mt-2 text-gray-400">Raw: {test4}</p>
        </div>

        <div className="border rounded p-4">
          <h3 className="font-bold mb-2">Test 5: Proper HTML (should work)</h3>
          <pre className="bg-gray-900 p-3 rounded">
            <code dangerouslySetInnerHTML={{ __html: test5 }} />
          </pre>
          <p className="text-sm mt-2 text-gray-400">Raw: {test5}</p>
        </div>
      </div>

      <div className="mt-8 p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
        <h3 className="font-bold mb-2">Expected Results:</h3>
        <ul className="space-y-1 text-sm">
          <li>• Test 1: Plain text</li>
          <li>• Test 2: Word "red word" should be red</li>
          <li>• Test 3: Word "keyword" should be purple</li>
          <li>• Test 4: Will show literal span tags (this is the problem we're having)</li>
          <li>• Test 5: Word "hello" should be purple</li>
        </ul>
      </div>
    </div>
  );
}