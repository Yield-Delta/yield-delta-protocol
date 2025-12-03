# CSS Duplicates Quick Reference
**File:** `/workspaces/yield-delta-protocol/yield-delta-frontend/src/app/globals.css.backup`

## Duplicate Class Definitions - Action Required

### 1. `.wallet-container-override`
- **Line 919:** First definition (flex layout properties)
- **Line 1273:** Second definition (z-index + isolation)
- **Action:** Merge into single definition in `/src/app/styles/components.css`
- **Conflict:** None (complementary properties)

### 2. `.vault-detail-header-card-optimized`
- **Line 1934:** First definition (visual styling - backdrop, border, shadow)
- **Line 3176:** Second definition (layout - max-width, margin)
- **Action:** Merge into single definition in `/src/app/styles/components.css`
- **Conflict:** None (complementary properties)
- **Note:** Separated by 1,242 lines - difficult to maintain

### 3. `.tabs-container-compact`
- **Line 1733:** First definition (container-type for container queries)
- **Line 1948:** Second definition (visual styling - background, border, backdrop)
- **Action:** Merge into single definition in `/src/app/styles/components.css`
- **Conflict:** None (complementary properties)
- **Note:** Keep container query block with the merged definition

### 4. `.risk-badge-custom`
- **Line 1643:** First definition (base layout + font-weight: 700)
- **Line 2031:** Second definition (enhanced styling + font-weight: 800 !important)
- **Action:** Merge into single definition in `/src/app/styles/components.css`
- **Conflict:** YES - font-weight conflict (700 vs 800)
- **Resolution:** Use 800 (stronger value from enhancement)

---

## Recommended Merged Definitions

### Merged: `.wallet-container-override`
```css
.wallet-container-override {
  position: relative !important;
  display: flex !important;
  align-items: center !important;
  justify-content: flex-end !important;
  flex-shrink: 0 !important;
  margin-left: auto !important;
  z-index: 99999 !important;
  isolation: isolate !important;
}
```

### Merged: `.vault-detail-header-card-optimized`
```css
.vault-detail-header-card-optimized {
  position: relative !important;
  z-index: 10 !important;
  max-width: calc(64rem - 2rem);
  margin: 0 auto;
  box-sizing: border-box;
  backdrop-filter: blur(24px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(24px) saturate(180%) !important;
  border: 2px solid rgba(255, 255, 255, 0.25) !important;
  box-shadow:
    0 25px 50px rgba(0, 0, 0, 0.5),
    0 12px 32px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.15) inset,
    0 0 40px rgba(0, 245, 212, 0.08) !important;
}
```

### Merged: `.tabs-container-compact`
```css
.tabs-container-compact {
  container-type: inline-size;
  background: rgba(15, 23, 42, 0.85) !important;
  border: 2px solid rgba(255, 255, 255, 0.2) !important;
  backdrop-filter: blur(25px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(25px) saturate(180%) !important;
  box-shadow:
    0 15px 40px rgba(0, 0, 0, 0.6),
    0 6px 20px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset !important;
}

@container (max-width: 768px) {
  .tabs-container-compact {
    height: 2.5rem !important;
    margin-bottom: 0.5rem !important;
    padding: 0.1875rem !important;
  }
}
```

### Merged: `.risk-badge-custom`
```css
.risk-badge-custom {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  padding: 8px 20px;
  min-width: 90px;
  height: 32px;
  cursor: default;
  transition: all 0.3s ease;
  font-size: 0.875rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.75px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 2px solid currentColor;
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.25),
    0 0 20px currentColor,
    0 0 0 1px rgba(255, 255, 255, 0.2) inset;
}
```

---

## Similar Animations to Consolidate

### Pulse-type Animations (3 found)

1. **`@keyframes pulse`** (Line 2073)
   - Basic opacity pulse
   - Used by: Unknown
   - **Recommendation:** REMOVE - use pulseGlow instead

2. **`@keyframes pulseGlow`** (Line 251)
   - Opacity + scale + box-shadow with currentColor
   - Most flexible - can adapt to different elements
   - **Recommendation:** KEEP as primary pulse animation

3. **`@keyframes aiChatPulse`** (Line 1148)
   - Specific green glow for AI chat
   - **Recommendation:** Rename to `pulseGreen` or refactor to use custom properties

### Gradient Animations (Check for similarity)

- `@keyframes gradient-shift` (Line 1159)
- `@keyframes holoGradientShift` (Line 264)

**Action:** Compare these two and consolidate if similar

---

## Z-Index Issues

### Current Z-Index Values (No Clear Scale):
```
1       - Base layer
2       - Metrics grid
5       - Vault tabs
10      - Header cards
100     - Unknown
1000    - Unknown
99999   - Wallet container
999999  - Modal overlay
```

### Recommended Z-Index Scale:
```css
:root {
  --z-base: 1;
  --z-content: 10;
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-fixed: 300;
  --z-modal-backdrop: 400;
  --z-modal: 500;
  --z-popover: 600;
  --z-tooltip: 700;
  --z-notification: 800;
}
```

**Action:** Replace arbitrary z-index values with CSS custom properties

---

## Overly Specific Selectors to Refactor

### Pattern: `html body div.class.class.class`

**Example (Line 3184):**
```css
html body div.deposit-modal-container.deposit-modal-container.deposit-modal-container {
  /* ... */
}
```

**Issue:** Specificity (0,4,3) - nearly impossible to override
**Action:** Reduce to `.deposit-modal-container` with proper cascade management

### Pattern: `html body div.vault-page ...`

**Found:** 42 instances between lines 2521-3048

**Action:** Remove `html body div` prefix, use just `.vault-page ...`

---

## Media Query Consolidation Opportunities

### Duplicate Breakpoints to Group:

1. `@media (max-width: 768px)` - **4 instances** (Lines: 861, 1200, 1919, 1984)
2. `@media (max-width: 640px)` - **3 instances** (Lines: 881, 1220, 1984)
3. `@media (max-width: 480px)` - **4 instances** (Lines: 902, 1248, 1544, 1925)
4. `@media (prefers-reduced-motion: reduce)` - **3 instances** (Lines: 1865, 2307, 2371)

**Action:** Group all rules for the same breakpoint into single media query block

---

## Common Color Values to Extract

### Create CSS Custom Properties:

```css
:root {
  /* Backgrounds */
  --bg-dark-primary: rgba(8, 10, 23, 0.95);     /* Used 7 times */
  --bg-dark-secondary: rgba(15, 23, 42, 0.85);  /* Used 3 times */

  /* Borders */
  --border-white-20: rgba(255, 255, 255, 0.2);  /* Used 7 times */
  --border-white-15: rgba(255, 255, 255, 0.15); /* Used 6 times */
  --border-white-10: rgba(255, 255, 255, 0.1);  /* Used 7 times */

  /* Shadows */
  --shadow-base: rgba(0, 0, 0, 0.3);            /* Used 6 times */
  --shadow-medium: rgba(0, 0, 0, 0.4);          /* Used 4 times */
  --shadow-strong: rgba(0, 0, 0, 0.5);          /* Used 3 times */

  /* Glow colors */
  --glow-primary: rgba(0, 245, 212, 0.6);       /* Used 4 times */
  --glow-secondary: rgba(155, 93, 229, 0.8);    /* Used 4 times */
}
```

---

## Backdrop Filter Values to Standardize

### Current Usage:
- `blur(12px)` - 5 times
- `blur(20px)` - 8 times
- `blur(24px)` - 6 times
- `blur(25px)` - 3 times

### Recommended Standard:
```css
:root {
  --blur-sm: blur(12px);
  --blur-md: blur(20px);
  --blur-lg: blur(24px);
}
```

**Action:** Replace all blur values with custom properties, consolidate 24px and 25px to just 24px

---

## !important Statistics

- **Total:** 782 instances
- **Target:** Reduce to ~200-300 (60% reduction)

### Removal Strategy:
1. Remove from properties that don't have conflicts
2. Use CSS `@layer` to manage cascade instead
3. Keep only for true utility overrides
4. Document reason for each remaining !important

---

## Quick Win Checklist

- [ ] Merge 4 duplicate class definitions
- [ ] Extract 8 most common RGBA colors to CSS variables
- [ ] Standardize 3 blur levels
- [ ] Remove basic `@keyframes pulse` animation
- [ ] Consolidate 4 duplicate `@media (max-width: 768px)` blocks
- [ ] Remove `html body div` prefix from 42 selectors
- [ ] Replace `.class.class.class` specificity hack
- [ ] Merge both `:root` blocks into one
- [ ] Establish z-index scale with CSS variables
- [ ] Remove "NUCLEAR FIX 1-24" numbered comments

**Estimated Time:** 2-4 hours for quick wins
**Estimated Impact:** 40% improvement in maintainability
