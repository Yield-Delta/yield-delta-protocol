/**
 * HTML Rendering Test Page
 * Tests if dangerouslySetInnerHTML is working correctly
 */

'use client';

export default function HtmlTestPage() {
  // Test HTML with span tags similar to what highlightCode produces
  const testHtml1 = 'This is <span class="hl-keyword">const</span> test';
  const testHtml2 = 'curl <span class="hl-string">https://example.com</span>';
  const testHtml3 = '<span class="hl-comment"># This is a comment</span>';

  // Test with escaped HTML like highlightCode does
  const escapedWithSpans = 'if [[ "$VAR" &lt; 10 ]]; then <span class="hl-keyword">echo</span> <span class="hl-string">"hello"</span>; fi';

  return (
    <div className="docs-content max-w-4xl mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">HTML Rendering Test</h1>

      <p className="text-lg text-muted-foreground mb-8">
        Testing if span tags are being rendered correctly with dangerouslySetInnerHTML.
      </p>

      <h2 className="text-2xl font-semibold mb-4">Test 1: Basic HTML with spans</h2>
      <div className="bg-slate-900 p-4 rounded-lg mb-6">
        <div dangerouslySetInnerHTML={{ __html: testHtml1 }} />
      </div>

      <h2 className="text-2xl font-semibold mb-4">Test 2: URL with span</h2>
      <div className="bg-slate-900 p-4 rounded-lg mb-6">
        <div dangerouslySetInnerHTML={{ __html: testHtml2 }} />
      </div>

      <h2 className="text-2xl font-semibold mb-4">Test 3: Comment with span</h2>
      <div className="bg-slate-900 p-4 rounded-lg mb-6">
        <div dangerouslySetInnerHTML={{ __html: testHtml3 }} />
      </div>

      <h2 className="text-2xl font-semibold mb-4">Test 4: Escaped content with spans</h2>
      <div className="bg-slate-900 p-4 rounded-lg mb-6">
        <div dangerouslySetInnerHTML={{ __html: escapedWithSpans }} />
      </div>

      <h2 className="text-2xl font-semibold mb-4">Test 5: Direct rendering (for comparison)</h2>
      <div className="bg-slate-900 p-4 rounded-lg mb-6">
        <p>This should show literal text: {testHtml1}</p>
      </div>

      {/* Test with styles to ensure they work */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .hl-keyword { color: #a78bfa; }
          .hl-string { color: #34d399; }
          .hl-comment { color: #6b7280; font-style: italic; }
        `
      }} />

      <h2 className="text-2xl font-semibold mb-4 mt-8">Expected Results</h2>
      <ul className="space-y-2">
        <li>Test 1-4: Should show styled text with colored keywords/strings/comments</li>
        <li>Test 5: Should show the literal HTML tags as text</li>
      </ul>

      <div className="mt-8 p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
        <p className="text-sm">
          If Tests 1-4 are showing HTML tags as text (like &lt;span&gt;),
          then there's an issue with dangerouslySetInnerHTML or React hydration.
        </p>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'HTML Test - Yield Delta Documentation',
  description: 'Test page for debugging HTML rendering issues',
};