# Nextra-Style Card Design Reference

## Complete Card Anatomy

### Card Container
```tsx
<a
  href="/docs/testnet-setup"
  className="group relative overflow-hidden rounded-xl p-6 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
  style={{
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 51, 234, 0.05) 100%)',
    border: '1px solid rgba(59, 130, 246, 0.1)',
    backdropFilter: 'blur(10px)',
  }}
>
```

**Key Properties:**
- `group`: Enables group-hover utilities for child elements
- `relative`: Establishes positioning context for absolute children
- `overflow-hidden`: Clips hover effects to card bounds
- `rounded-xl`: 0.75rem border radius for modern look
- `p-6`: 1.5rem padding for breathing room
- `transition-all duration-300`: Smooth 300ms transitions
- `hover:scale-[1.02]`: Subtle 2% grow on hover
- `active:scale-[0.98]`: 2% shrink on click for tactile feedback

**Inline Styles:**
- `background`: Diagonal gradient from top-left to bottom-right
- `border`: Very subtle colored border (10% opacity)
- `backdropFilter`: Glass-morphism blur effect

---

### Hover Gradient Overlay
```tsx
<div
  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
  style={{
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(147, 51, 234, 0.08) 100%)',
  }}
/>
```

**Purpose:** Intensifies the gradient on hover without changing base card

**Key Properties:**
- `absolute inset-0`: Covers entire card area
- `opacity-0`: Hidden by default
- `group-hover:opacity-100`: Fades in on hover
- `transition-opacity duration-300`: Smooth 300ms fade

**Why It Works:**
- Layered approach prevents layout shift
- Gradient is slightly more intense (0.08 vs 0.05)
- Creates depth perception

---

### Content Container
```tsx
<div className="relative z-10">
```

**Purpose:** Ensures content stays above overlay layers

**Key Properties:**
- `relative`: Establishes positioning context
- `z-10`: Stacks above background and overlay

---

### Icon + Title Section
```tsx
<div className="flex items-center gap-3 mb-3">
  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
    <span className="text-xl">🧪</span>
  </div>
  <h3 className="text-lg font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
    Testnet Setup
  </h3>
</div>
```

**Icon Container:**
- `w-10 h-10`: 40px square for visual balance
- `rounded-lg`: 0.5rem radius (less rounded than card)
- `bg-blue-500/10`: Theme color at 10% opacity
- `group-hover:bg-blue-500/20`: Doubles opacity on hover
- `transition-colors`: Smooth color transitions

**Title:**
- `text-lg font-semibold`: 1.125rem, 600 weight
- `group-hover:text-blue-600`: Changes to theme color on hover
- `dark:group-hover:text-blue-400`: Lighter shade for dark mode

---

### Description Text
```tsx
<p className="text-muted-foreground mb-4 text-sm leading-relaxed">
  Configure your wallet for SEI testnet and get started with Yield Delta.
</p>
```

**Key Properties:**
- `text-muted-foreground`: Uses theme's secondary text color
- `text-sm`: 0.875rem for hierarchy
- `leading-relaxed`: 1.625 line height for readability
- `mb-4`: 1rem margin for separation

---

### Call-to-Action
```tsx
<div className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400">
  <span>Setup Guide</span>
  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
</div>
```

**Key Properties:**
- `text-blue-600 dark:text-blue-400`: Theme-colored text
- `font-medium`: 500 weight for emphasis
- `group-hover:translate-x-1`: Arrow slides right 4px
- `transition-transform duration-300`: Smooth animation

---

### Hover Shadow Glow
```tsx
<div
  className="absolute inset-0 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
  style={{ boxShadow: '0 8px 32px rgba(59, 130, 246, 0.15)' }}
/>
```

**Purpose:** Creates colored glow effect around card on hover

**Key Properties:**
- `absolute inset-0`: Covers entire card
- `rounded-xl`: Matches card border radius
- `shadow-lg`: Base shadow class
- `opacity-0 group-hover:opacity-100`: Fades in on hover
- Custom `boxShadow`: Large, colored shadow matching theme

---

## Color Themes

### Blue (Testnet/Setup)
```tsx
// Base gradient
background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 51, 234, 0.05) 100%)'

// Border
border: '1px solid rgba(59, 130, 246, 0.1)'

// Hover gradient
background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(147, 51, 234, 0.08) 100%)'

// Icon background
bg-blue-500/10 → bg-blue-500/20

// Text hover
group-hover:text-blue-600 dark:group-hover:text-blue-400

// Shadow
boxShadow: '0 8px 32px rgba(59, 130, 246, 0.15)'
```

### Purple (Metrics/Analytics)
```tsx
// Base gradient
background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.05) 0%, rgba(236, 72, 153, 0.05) 100%)'

// Border
border: '1px solid rgba(168, 85, 247, 0.1)'

// Hover gradient
background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(236, 72, 153, 0.08) 100%)'

// Icon background
bg-purple-500/10 → bg-purple-500/20

// Text hover
group-hover:text-purple-600 dark:group-hover:text-purple-400

// Shadow
boxShadow: '0 8px 32px rgba(168, 85, 247, 0.15)'
```

### Green (Development/Build)
```tsx
// Base gradient
background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%)'

// Border
border: '1px solid rgba(34, 197, 94, 0.1)'

// Hover gradient
background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(16, 185, 129, 0.08) 100%)'

// Icon background
bg-green-500/10 → bg-green-500/20

// Text hover
group-hover:text-green-600 dark:group-hover:text-green-400

// Shadow
boxShadow: '0 8px 32px rgba(34, 197, 94, 0.15)'
```

### Orange (Finance/Value)
```tsx
// Base gradient
background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.05) 0%, rgba(234, 179, 8, 0.05) 100%)'

// Border
border: '1px solid rgba(249, 115, 22, 0.1)'

// Hover gradient
background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(234, 179, 8, 0.08) 100%)'

// Icon background
bg-orange-500/10 → bg-orange-500/20

// Text hover
group-hover:text-orange-600 dark:group-hover:text-orange-400

// Shadow
boxShadow: '0 8px 32px rgba(249, 115, 22, 0.15)'
```

---

## Layout Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
  {/* Cards */}
</div>
```

**Responsive Behavior:**
- Mobile: 1 column (stacked)
- Desktop: 2 columns (side-by-side)
- Gap: 1.5rem between cards
- Bottom margin: 2rem

---

## Animation Timing Functions

All animations use default `ease` timing:
- Natural acceleration/deceleration
- Feels organic and smooth
- No jarring starts/stops

**Duration Standards:**
- Transforms: 300ms
- Opacity: 300ms
- Colors: Default (matches Tailwind `transition-colors`)

---

## Accessibility Considerations

### Keyboard Navigation
```tsx
// Links are fully keyboard accessible
<a href="/docs/testnet-setup">
```

### Focus States
- Handled by Tailwind's default focus styles
- Clear focus ring for keyboard users
- No custom focus styles that reduce visibility

### Color Contrast
- Base text uses `text-muted-foreground` (WCAG AA compliant)
- Hover text uses saturated colors (WCAG AA compliant)
- Dark mode uses lighter shades for sufficient contrast

### Screen Readers
- Semantic HTML (`<a>`, `<h3>`, `<p>`)
- Meaningful link text ("Setup Guide" not "Click here")
- Proper heading hierarchy

---

## Performance Optimizations

### GPU Acceleration
```tsx
// These properties trigger GPU acceleration:
transform: scale(1.02)
opacity: 0 → 1
```

### No Layout Reflow
```tsx
// Absolute positioning prevents layout shift
className="absolute inset-0"

// Transform doesn't trigger reflow
hover:scale-[1.02]
```

### Minimal Repaints
```tsx
// Only opacity and transform change
transition-all duration-300
```

---

## Mobile Considerations

### Touch Targets
- Card has sufficient padding (1.5rem)
- Entire card is clickable
- No small tap zones

### Active State
```tsx
active:scale-[0.98]
```
- Provides visual feedback on tap
- Mimics native mobile interactions
- Improves perceived responsiveness

### Reduced Motion
Consider adding for accessibility:
```tsx
@media (prefers-reduced-motion: reduce) {
  .card {
    transition: none;
  }
}
```

---

## Common Customizations

### Change Gradient Intensity
```tsx
// More subtle
rgba(59, 130, 246, 0.03) // instead of 0.05

// More intense
rgba(59, 130, 246, 0.08) // instead of 0.05
```

### Adjust Hover Scale
```tsx
// More subtle
hover:scale-[1.01]

// More pronounced
hover:scale-[1.05]
```

### Change Animation Speed
```tsx
// Faster
duration-200

// Slower
duration-500
```

### Add Entrance Animation
```tsx
// With Framer Motion
<motion.a
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4 }}
>
```

---

## Browser Support

### Modern Features Used
- `backdrop-filter: blur(10px)` - 94% support
- CSS Grid - 96% support
- CSS Transforms - 99% support
- CSS Transitions - 99% support
- RGBA colors - 99% support

### Fallbacks
```css
/* For browsers without backdrop-filter */
@supports not (backdrop-filter: blur(10px)) {
  .card {
    background: rgba(59, 130, 246, 0.08);
  }
}
```

---

## Design Principles Summary

1. **Subtlety**: Low opacity gradients (5%) for elegance
2. **Consistency**: Same structure across all cards
3. **Feedback**: Clear hover/active states for interaction
4. **Hierarchy**: Icon → Title → Description → CTA
5. **Performance**: GPU-accelerated, no layout shift
6. **Accessibility**: Semantic HTML, keyboard friendly
7. **Responsive**: Mobile-first approach
8. **Theming**: Color-coded by category
9. **Polish**: Attention to micro-interactions
10. **Scalability**: Easy to add new cards

---

**Pro Tip**: When creating new cards, copy an existing one and only change:
1. Colors (gradient, border, icon, text, shadow)
2. Icon emoji
3. Title and description
4. Link href

This ensures consistency and reduces bugs.
