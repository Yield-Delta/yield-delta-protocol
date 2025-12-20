# Code Block Styling - Quick Reference

## Visual Comparison

### Before Implementation
```
Plain dark background
No borders
No rounded corners
Blends into page
```

### After Implementation
```
┌─────────────────────────────────┐ ← Rounded top corners (12px)
│ Subtle inner glow accent        │
│ ┌───────────────────────────┐   │
│ │ const greeting = "Hello"; │   │ ← Proper padding
│ │ console.log(greeting);    │   │
│ └───────────────────────────┘   │
└─────────────────────────────────┘ ← Rounded bottom corners
  ↑                              ↑
  Border (1px)              Box shadow
```

## CSS Classes Applied

### Automatic Styling
All `<pre><code>` blocks in `.docs-content` automatically get:
- ✅ Rounded corners (0.75rem / 12px)
- ✅ Border (1px solid theme color)
- ✅ Multi-layer shadows
- ✅ Backdrop blur effect
- ✅ Hover glow effect
- ✅ Styled scrollbars
- ✅ Proper padding (1.25rem 1.5rem)

### Inline Code
All `<code>` (not in `<pre>`) automatically get:
- ✅ Cyan accent color
- ✅ Light cyan background
- ✅ Small rounded corners (0.375rem / 6px)
- ✅ Subtle border
- ✅ Monospace font

## Key Design Tokens

```css
/* Border Radius */
--radius-code-block: 0.75rem;   /* 12px - Code blocks */
--radius-inline-code: 0.375rem; /* 6px - Inline code */

/* Colors */
--code-block-bg: hsl(216 50% 8%);           /* Dark blue-gray */
--code-block-border: hsl(216 30% 18%);      /* Lighter border */
--code-inline-bg: rgba(0, 215, 255, 0.1);   /* Cyan tint */
--code-inline-border: rgba(0, 215, 255, 0.2); /* Cyan border */

/* Shadows */
Base: 0 1px 3px rgba(0, 0, 0, 0.3)
Inner: 0 0 0 1px rgba(255, 255, 255, 0.05) inset
Hover: 0 0 20px rgba(0, 215, 255, 0.05)
```

## Component Usage

### Basic Code Block
```tsx
// Automatically styled - no changes needed!
<pre className="bg-muted p-4 rounded-lg mb-6 overflow-x-auto">
  <code>{`const x = 10;`}</code>
</pre>
```

### Enhanced Code Block (with copy button)
```tsx
import { CodeBlock } from '@/components/CodeBlock';

<CodeBlock language="typescript">
  {`const greeting = "Hello, World!";`}
</CodeBlock>
```

### With Filename
```tsx
<CodeBlock language="typescript" filename="example.ts">
  {`const greeting = "Hello, World!";`}
</CodeBlock>
```

### With Line Numbers
```tsx
<CodeBlock language="python" showLineNumbers>
  {`def greet():
    print("Hello, World!")`}
</CodeBlock>
```

### Highlighted Lines
```tsx
<CodeBlock language="javascript" highlightLines={[2, 4]}>
  {`const a = 1;
const b = 2;  // highlighted
const c = 3;
const d = 4;  // highlighted`}
</CodeBlock>
```

### Inline Code
```tsx
// Automatic
<p>Run <code>npm install</code> to install.</p>

// Or with component
import { InlineCode } from '@/components/CodeBlock';
<p>Run <InlineCode>npm install</InlineCode> to install.</p>
```

## Variant Classes

### No Scrollbar
```tsx
<div className="code-block-no-scrollbar">
  <pre><code>...</code></pre>
</div>
```

### Compact (Less Padding)
```tsx
<div className="code-block-compact">
  <pre><code>...</code></pre>
</div>
```

### Full Width
```tsx
<div className="code-block-full-width">
  <pre><code>...</code></pre>
</div>
```

## Responsive Breakpoints

| Breakpoint | Padding | Font Size | Border Radius |
|------------|---------|-----------|---------------|
| Mobile (<640px) | 1rem 1.25rem | 13px | 0.625rem |
| Tablet (641-1024px) | 1.125rem 1.375rem | 14px | 0.75rem |
| Desktop (>1024px) | 1.25rem 1.5rem | 14px | 0.75rem |

## Accessibility Features

| Feature | Implementation |
|---------|----------------|
| High Contrast | 2px borders, bold fonts |
| Reduced Motion | No transitions |
| Keyboard Focus | 2px primary color outline |
| Screen Readers | Semantic HTML, ARIA labels |
| Touch Targets | 44x44px minimum |

## Files to Know

| File | Purpose |
|------|---------|
| `/src/styles/code-blocks.css` | All code block styles |
| `/src/styles/theme.css` | Design tokens |
| `/src/app/globals.css` | Import location |
| `/src/components/CodeBlock.tsx` | Enhanced component |
| `/docs/CODE_BLOCK_STYLING.md` | Full documentation |

## Color Palette

### Syntax Highlighting (Built-in)
- **Comments**: Muted gray, italic
- **Keywords**: Purple (#b794f4), bold
- **Strings**: Green (#68d391)
- **Functions**: Cyan (#00d7ff) - matches primary
- **Numbers**: Orange (#fbbf24)
- **Operators**: Default foreground
- **Punctuation**: Muted gray

## Common Patterns

### Multiple Code Blocks
```tsx
<CodeBlock language="bash" filename="install.sh">
  {`npm install`}
</CodeBlock>

<CodeBlock language="typescript" filename="config.ts">
  {`export const config = { ... }`}
</CodeBlock>
```

### Code with Description
```tsx
<div>
  <p className="mb-2">Install dependencies:</p>
  <CodeBlock language="bash">
    {`npm install`}
  </CodeBlock>
</div>
```

### Tabbed Code Examples
```tsx
// Future enhancement - not yet implemented
<CodeBlockGroup>
  <CodeBlock language="typescript" label="TypeScript">...</CodeBlock>
  <CodeBlock language="javascript" label="JavaScript">...</CodeBlock>
</CodeBlockGroup>
```

## Performance Tips

1. **Use static code when possible** - Avoid dynamic code generation
2. **Lazy load syntax highlighters** - Only load if needed
3. **Minimize inline styles** - Use CSS classes
4. **Optimize font loading** - System fonts fallback
5. **Use CSS containment** - `contain: paint` for large blocks

## Browser Support Matrix

| Browser | Rounded Corners | Borders | Shadows | Backdrop Blur | Copy Button |
|---------|-----------------|---------|---------|---------------|-------------|
| Chrome 88+ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Firefox 94+ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Safari 15.4+ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Edge 88+ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Older browsers | ✅ | ✅ | ✅ | Fallback | ✅ |

## Quick Troubleshooting

| Issue | Fix |
|-------|-----|
| No rounded corners | Check CSS import order |
| Wrong colors | Verify theme tokens loaded |
| No copy button | Use CodeBlock component |
| Styles not applying | Add `.docs-content` wrapper |
| Border not visible | Check theme contrast |

## Testing Checklist

- [ ] Rounded corners visible on all sides
- [ ] Border appears correctly
- [ ] Hover effect works
- [ ] Copy button appears on hover
- [ ] Scrollbar styled for long code
- [ ] Inline code has cyan accent
- [ ] Mobile responsive
- [ ] Dark mode works
- [ ] Keyboard navigation works
- [ ] High contrast mode works

## Example Documentation Page

```tsx
export default function ExamplePage() {
  return (
    <div className="docs-content">
      <h1>Installation Guide</h1>

      <p>Install the package using <code>npm</code> or <code>bun</code>:</p>

      <CodeBlock language="bash">
        {`npm install yield-delta`}
      </CodeBlock>

      <p>Then import and use:</p>

      <CodeBlock language="typescript" filename="app.ts">
        {`import { YieldDelta } from 'yield-delta';

const vault = new YieldDelta({
  strategy: 'concentrated-liquidity'
});`}
      </CodeBlock>
    </div>
  );
}
```

## Design Principles

1. **Visual Clarity**: Clear separation from page background
2. **Professional Appearance**: Polished, modern aesthetic
3. **Accessibility First**: Works for all users
4. **Performance**: Optimized CSS, minimal overhead
5. **Maintainability**: Well-organized, documented code
6. **Consistency**: Matches overall design system
7. **Flexibility**: Easy to customize and extend

## Next Steps

1. ✅ Basic styling applied automatically
2. ✅ Enhanced component available
3. 🚧 Add syntax highlighting library (optional)
4. 🚧 Add code playground integration (optional)
5. 🚧 Add theme switcher support (optional)
6. 🚧 Add export/download features (optional)

---

**Last Updated**: 2025-12-19
**Maintained By**: Yield Delta Team
