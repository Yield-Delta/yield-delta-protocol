# Code Block Styling Implementation Guide

## Overview

This document describes the comprehensive code block styling system implemented for the Yield Delta documentation site. The system provides professional, polished code snippets with rounded corners, borders, and enhanced visual hierarchy inspired by modern documentation sites like Nextra.

## Features Implemented

### Visual Enhancements
- **Rounded Corners**: 12px border radius for a modern, polished look
- **Subtle Borders**: 1px borders with theme-aware colors
- **Box Shadows**: Multi-layer shadows for depth and elevation
- **Inner Glow**: Subtle gradient accent on top edge
- **Hover Effects**: Interactive feedback with enhanced glow
- **Backdrop Blur**: Glass-morphism effect for modern aesthetics

### Code Presentation
- **Inline Code**: Distinct styling with cyan accent color
- **Syntax Highlighting**: Base styles for common tokens (ready for highlighter integration)
- **Custom Scrollbars**: Styled horizontal scrollbars for long code
- **Font Optimization**: Monospace font stack with proper rendering

### Interactive Features (Optional Component)
- **Copy Button**: One-click code copying with visual feedback
- **Language Badge**: Display programming language
- **Filename Display**: Optional header showing file name
- **Line Numbers**: Optional line numbering
- **Line Highlighting**: Highlight specific lines of code

### Responsive Design
- **Mobile Optimized**: Smaller padding and font sizes on mobile
- **Tablet Support**: Medium-sized adjustments for tablets
- **Touch-Friendly**: Proper scrolling for touch devices

### Accessibility
- **High Contrast Mode**: Enhanced borders and weights
- **Reduced Motion**: Respects user preferences
- **Keyboard Navigation**: Focus states for keyboard users
- **Screen Readers**: Proper ARIA labels and semantic HTML

## Files Modified/Created

### 1. `/src/styles/code-blocks.css` (NEW)
**Purpose**: Comprehensive code block styling system

**Key Styles**:
```css
.docs-content pre {
  border-radius: 0.75rem;      /* Rounded corners */
  border: 1px solid;            /* Subtle border */
  box-shadow: multiple layers;  /* Depth and glow */
  backdrop-filter: blur(12px);  /* Glass effect */
}
```

**Sections**:
- Base code block styles
- Inline code styles
- Visual enhancements (glow, hover)
- Syntax highlighting
- Copy button styles
- Language badge styles
- Responsive adjustments
- Dark mode enhancements
- Accessibility features
- Print styles

### 2. `/src/app/globals.css` (MODIFIED)
**Change**: Added import for code-blocks.css

```css
@import '../styles/code-blocks.css';
```

### 3. `/src/styles/theme.css` (MODIFIED)
**Changes**: Added code block design tokens

```css
:root {
  /* Border Radius Tokens */
  --radius-code-block: 0.75rem;   /* 12px */
  --radius-inline-code: 0.375rem; /* 6px */

  /* Code Block Color Tokens */
  --code-block-bg: hsl(216 50% 8%);
  --code-block-border: hsl(216 30% 18%);
  --code-block-shadow: rgba(0, 0, 0, 0.3);
  --code-inline-bg: rgba(0, 215, 255, 0.1);
  --code-inline-border: rgba(0, 215, 255, 0.2);
}
```

### 4. `/src/components/CodeBlock.tsx` (NEW)
**Purpose**: Optional enhanced React component for advanced features

**Components**:
- `<CodeBlock>` - Main component with copy, language badge, line numbers
- `<InlineCode>` - Consistent inline code styling
- `<CodeBlockGroup>` - Group multiple code blocks with tabs

## Usage

### Basic Usage (Automatic)

The styles are automatically applied to all `<pre><code>` blocks in the documentation:

```tsx
<pre className="bg-muted p-4 rounded-lg mb-6 overflow-x-auto">
  <code>{`const greeting = "Hello, World!";
console.log(greeting);`}</code>
</pre>
```

**Result**: Automatically styled with rounded corners, borders, and proper spacing.

### Enhanced Component Usage (Optional)

For advanced features like copy buttons and language badges:

```tsx
import { CodeBlock } from '@/components/CodeBlock';

<CodeBlock language="typescript" filename="example.ts">
  {`const greeting: string = "Hello, World!";
console.log(greeting);`}
</CodeBlock>
```

**Features**:
- Copy button appears on hover
- Language badge in top-left
- Optional filename header
- Optional line numbers with `showLineNumbers={true}`
- Highlight specific lines with `highlightLines={[1, 3, 5]}`

### Inline Code

Inline code is automatically styled:

```tsx
<p>Use the <code>npm install</code> command to install dependencies.</p>
```

Or with the component:

```tsx
import { InlineCode } from '@/components/CodeBlock';

<p>Use the <InlineCode>npm install</InlineCode> command.</p>
```

## Design Tokens

### Border Radius
- `--radius-code-block`: 0.75rem (12px) - Code block corners
- `--radius-inline-code`: 0.375rem (6px) - Inline code corners

### Colors
- `--code-block-bg`: Dark background for code blocks
- `--code-block-border`: Border color
- `--code-inline-bg`: Light cyan background for inline code
- `--code-inline-border`: Cyan border for inline code

### Shadows
Multiple shadow layers create depth:
1. Base shadow: `0 1px 3px rgba(0, 0, 0, 0.3)`
2. Inner highlight: `0 0 0 1px rgba(255, 255, 255, 0.05) inset`
3. Hover glow: `0 0 20px rgba(0, 215, 255, 0.05)`

## Comparison: Before vs. After

### Before (IMG_0414.png)
- Plain dark background
- No borders or definition
- Blends into page background
- No visual hierarchy
- Basic monospace text

### After (Current Implementation)
- Rounded 12px corners
- Subtle 1px border with theme colors
- Elevated with multi-layer shadows
- Distinct from page background
- Inner glow accent line
- Hover effects for interactivity
- Optional copy button
- Styled scrollbars
- Professional appearance

## Advanced Customization

### Variant Classes

Apply these classes to code blocks for different styles:

```tsx
// No scrollbar variant
<div className="code-block-no-scrollbar">
  <pre><code>...</code></pre>
</div>

// Compact variant (less padding)
<div className="code-block-compact">
  <pre><code>...</code></pre>
</div>

// Full width variant
<div className="code-block-full-width">
  <pre><code>...</code></pre>
</div>
```

### Custom Syntax Highlighting

The CSS includes base styles for syntax tokens. To integrate with a syntax highlighter like Prism.js or Shiki:

1. Install your preferred highlighter
2. The CSS already defines styles for common tokens:
   - `.comment` - Italic, muted
   - `.keyword` - Purple, bold
   - `.string` - Green
   - `.function` - Cyan (primary color)
   - `.number` - Orange
   - `.operator` - Default foreground
   - `.punctuation` - Muted

3. Update class names in code-blocks.css if needed to match your highlighter

## Performance Considerations

### CSS Optimization
- Uses CSS layers for proper cascade
- Minimal specificity for easy overrides
- GPU-accelerated properties (backdrop-filter)
- Efficient selectors

### Component Optimization
- Client-side only for interactive features
- Lazy loading of copy functionality
- Minimal re-renders
- No external dependencies (uses lucide-react already in project)

## Browser Support

### Modern Browsers
- Chrome/Edge 88+ (full support)
- Firefox 94+ (full support)
- Safari 15.4+ (full support)

### Graceful Degradation
- Older browsers: backdrop-filter fallback
- No CSS layers: still applies correctly
- No custom properties: falls back to defaults

## Accessibility Checklist

- [x] High contrast mode support
- [x] Reduced motion support
- [x] Keyboard focus indicators
- [x] ARIA labels on interactive elements
- [x] Semantic HTML structure
- [x] Screen reader friendly
- [x] Color contrast meets WCAG AA
- [x] Touch target sizes (44x44px minimum)

## Testing

### Visual Testing
1. Check rounded corners render properly
2. Verify border appears on all sides
3. Confirm hover effects work
4. Test scrollbar styling in long code blocks
5. Verify inline code styling

### Responsive Testing
- [ ] Mobile (< 640px): Smaller padding, font-size
- [ ] Tablet (641px - 1024px): Medium adjustments
- [ ] Desktop (> 1024px): Full styling

### Accessibility Testing
- [ ] Keyboard navigation works
- [ ] High contrast mode displays properly
- [ ] Screen reader announces code correctly
- [ ] Focus indicators visible

### Cross-Browser Testing
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

## Migration Guide

### For Existing Pages

No changes needed! The styles automatically apply to existing code blocks.

### To Use Enhanced Component

1. Import the component:
```tsx
import { CodeBlock } from '@/components/CodeBlock';
```

2. Replace existing `<pre><code>` with `<CodeBlock>`:

**Before**:
```tsx
<pre className="bg-muted p-4 rounded-lg mb-6 overflow-x-auto">
  <code>{`code here`}</code>
</pre>
```

**After**:
```tsx
<CodeBlock language="typescript">
  {`code here`}
</CodeBlock>
```

## Future Enhancements

### Potential Additions
- [ ] Syntax highlighting integration (Shiki/Prism)
- [ ] Line diff highlighting (+ / -)
- [ ] Code block tabs for multiple languages
- [ ] Expand/collapse for long code blocks
- [ ] Download code button
- [ ] Terminal/shell styling variant
- [ ] Code playground integration

### Design System Integration
- [ ] Add to component library documentation
- [ ] Create Storybook stories
- [ ] Add visual regression tests
- [ ] Document in design system

## Troubleshooting

### Issue: Styles not applying
**Solution**: Ensure globals.css is imported in root layout and code-blocks.css import is present.

### Issue: Copy button not appearing
**Solution**: Make sure you're using the CodeBlock component and hovering over the code block.

### Issue: Rounded corners not showing
**Solution**: Check for conflicting CSS that might override border-radius. Use browser DevTools to inspect.

### Issue: Colors don't match theme
**Solution**: Verify theme.css variables are loaded. Check that HSL color format is correct.

## Support

For questions or issues with code block styling:
1. Check this documentation
2. Review the CSS file comments
3. Inspect with browser DevTools
4. Check for CSS conflicts
5. Verify import order in globals.css

## Credits

Design inspired by:
- Nextra documentation framework
- Vengeance UI documentation
- Modern design systems (Vercel, Tailwind, etc.)

Implementation by: Yield Delta Team
Last updated: 2025-12-19
