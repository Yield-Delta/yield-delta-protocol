/**
 * JavaScript Syntax Test Page
 * Tests JavaScript/TypeScript highlighting issues
 */

import { CodeBlock } from '@/components/docs/CodeBlock';

export default function JsTestPage() {
  return (
    <div className="docs-content max-w-4xl mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">JavaScript Highlighting Test</h1>

      <p className="text-lg text-muted-foreground mb-8">
        Testing JavaScript/TypeScript syntax highlighting with parentheses and other patterns.
      </p>

      <h2 className="text-2xl font-semibold mb-4">Test 1: Basic Function Calls</h2>

      <CodeBlock
        code={`// Function calls with parentheses
console.log("Hello World");
const result = Math.max(10, 20);
const arr = Array(5).fill(0);

// Function definitions
function greet(name) {
  return "Hello, " + name;
}

const add = (a, b) => a + b;

// Method calls
document.getElementById("app");
array.map((item) => item * 2);`}
        language="javascript"
        showLineNumbers={true}
      />

      <h2 className="text-2xl font-semibold mb-4 mt-8">Test 2: Template Literals</h2>

      <CodeBlock
        code={`// Template literals with expressions
const name = "World";
const greeting = \`Hello, \${name}!\`;
const multiline = \`
  Line 1
  Line 2: \${2 + 2}
  Line 3
\`;

// Mixed quotes
const single = 'Single quotes';
const double = "Double quotes";
const backtick = \`Template literal\`;

// Nested parentheses
const complex = \`Result: \${(10 + 20) * (5 - 3)}\`;`}
        language="javascript"
      />

      <h2 className="text-2xl font-semibold mb-4 mt-8">Test 3: Complex Expressions</h2>

      <CodeBlock
        code={`// Complex expressions with various parentheses
if ((x > 5) && (y < 10)) {
  console.log("Condition met");
}

// Array and object destructuring
const [first, second] = [1, 2];
const { prop1, prop2 } = { prop1: "a", prop2: "b" };

// Function with default parameters
function calculate(a = 0, b = 0, operation = "add") {
  if (operation === "add") return a + b;
  if (operation === "multiply") return a * b;
  return 0;
}

// Immediately invoked function expression (IIFE)
(function() {
  console.log("IIFE executed");
})();

// Arrow function with object return
const getConfig = () => ({
  url: "https://api.example.com",
  timeout: 5000
});`}
        language="javascript"
      />

      <h2 className="text-2xl font-semibold mb-4 mt-8">Test 4: TypeScript Specific</h2>

      <CodeBlock
        code={`// TypeScript with type annotations
function greet(name: string): string {
  return \`Hello, \${name}\`;
}

// Generic function
function identity<T>(value: T): T {
  return value;
}

// Interface with optional properties
interface User {
  name: string;
  email?: string;
  age?: number;
}

// Type assertion
const user = { name: "John" } as User;

// Tuple type
const tuple: [string, number] = ["hello", 42];

// Union types with parentheses
type Result = (string | number) | null;`}
        language="typescript"
      />

      <h2 className="text-2xl font-semibold mb-4 mt-8">Test 5: Regex Patterns</h2>

      <CodeBlock
        code={`// Regular expressions
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/;
const phoneRegex = /\\(\\d{3}\\) \\d{3}-\\d{4}/;

// Regex with groups
const pattern = /(\\w+)\\s+(\\w+)/g;
const matches = "John Doe".match(pattern);

// String replace with regex
const cleaned = text.replace(/[()]/g, "");
const formatted = phone.replace(/(\\d{3})(\\d{3})(\\d{4})/, "($1) $2-$3");`}
        language="javascript"
      />

      <div className="mt-12 p-6 bg-primary/10 border border-primary/30 rounded-lg">
        <p className="text-sm">
          <strong>What to Check:</strong>
        </p>
        <ul className="mt-2 space-y-1 text-sm">
          <li>• Parentheses in function calls should NOT be highlighted as strings</li>
          <li>• String content should be green</li>
          <li>• Keywords should be purple</li>
          <li>• Function names should be blue</li>
          <li>• Numbers should be orange</li>
          <li>• Template literal expressions should be properly highlighted</li>
        </ul>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'JavaScript Highlighting Test - Yield Delta Documentation',
  description: 'Test page for JavaScript/TypeScript syntax highlighting',
};