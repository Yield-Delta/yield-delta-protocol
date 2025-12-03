# CSS Cleanup Action Plan
**Priority-Ordered Tasks for globals.css.backup Refactoring**

## Quick Statistics

| Metric | Current | Target | Improvement |
|--------|---------|--------|-------------|
| Total Lines | 3,922 | ~2,800 | 29% reduction |
| Duplicate Classes | 4 | 0 | 100% elimination |
| !important Usage | 782 | ~200 | 74% reduction |
| Extreme Selectors (5+ specificity) | 75 | 0 | 100% elimination |
| Media Query Blocks | 46 | ~30 | 35% consolidation |
| Animations | 15 | ~10 | 33% consolidation |

---

## Phase 1: Emergency Fixes (2-3 hours)

### Priority 1.1: Fix Duplicate Class Definitions
**Impact:** High | **Effort:** Low | **Risk:** Low

**Files to update:** `/src/app/styles/components.css`

**Tasks:**
1. Merge `.wallet-container-override` (Lines 919 + 1273)
2. Merge `.vault-detail-header-card-optimized` (Lines 1934 + 3176)
3. Merge `.tabs-container-compact` (Lines 1733 + 1948)
4. Merge `.risk-badge-custom` (Lines 1643 + 2031)

**See:** `CSS_DUPLICATES_QUICK_REFERENCE.md` for merged code

---

### Priority 1.2: Remove Specificity Hacks
**Impact:** Critical | **Effort:** Low | **Risk:** Medium

**Line 3184 - Remove triple-class pattern:**
```css
/* BEFORE (Specificity: 7 + !important) */
html body div.deposit-modal-container.deposit-modal-container.deposit-modal-container {
  max-width: none !important;
  /* ... */
}

/* AFTER (Specificity: 1) */
.deposit-modal-container {
  max-width: none;
  /* ... */
}
```

**Test carefully:** Verify modal still displays correctly after change.

---

### Priority 1.3: Reduce html body div Prefixes
**Impact:** High | **Effort:** Medium | **Risk:** Medium

**42 instances to fix (Lines 2521-3048)**

**Pattern:**
```css
/* BEFORE (Specificity: 5) */
html body div.vault-page .tabs-container-compact { ... }

/* AFTER (Specificity: 2) */
.vault-page .tabs-container-compact { ... }
```

**Script to help:**
```bash
# Find all instances
grep -n "^html body div" /workspaces/yield-delta-protocol/yield-delta-frontend/src/app/globals.css.backup

# Count them
grep -c "^html body div" /workspaces/yield-delta-protocol/yield-delta-frontend/src/app/globals.css.backup
```

---

## Phase 2: CSS Variables & Design Tokens (3-4 hours)

### Priority 2.1: Merge :root Blocks
**Impact:** Medium | **Effort:** Low | **Risk:** Low

**Files:** `/src/app/styles/base.css`

**Task:** Merge Line 139 and Line 2850 :root blocks into one

---

### Priority 2.2: Extract Common Color Values
**Impact:** High | **Effort:** Low | **Risk:** Low

**Add to :root in base.css:**
```css
:root {
  /* Existing variables... */

  /* Common backgrounds */
  --bg-dark-primary: rgba(8, 10, 23, 0.95);
  --bg-dark-secondary: rgba(15, 23, 42, 0.85);

  /* Common borders */
  --border-white-20: rgba(255, 255, 255, 0.2);
  --border-white-15: rgba(255, 255, 255, 0.15);
  --border-white-10: rgba(255, 255, 255, 0.1);

  /* Common shadows */
  --shadow-base: rgba(0, 0, 0, 0.3);
  --shadow-medium: rgba(0, 0, 0, 0.4);
  --shadow-strong: rgba(0, 0, 0, 0.5);

  /* Glow colors */
  --glow-primary: rgba(0, 245, 212, 0.6);
  --glow-secondary: rgba(155, 93, 229, 0.8);

  /* Effects */
  --blur-sm: blur(12px);
  --blur-md: blur(20px);
  --blur-lg: blur(24px);

  /* Glass effect shadow (used in 15+ places) */
  --shadow-glass:
    0 15px 40px rgba(0, 0, 0, 0.6),
    0 6px 20px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
}
```

**Then replace throughout file:**
```bash
# Example replacement
# From: backdrop-filter: blur(20px);
# To:   backdrop-filter: var(--blur-md);
```

---

### Priority 2.3: Establish Z-Index Scale
**Impact:** High | **Effort:** Low | **Risk:** Low

**Add to :root:**
```css
:root {
  /* Z-index scale */
  --z-base: 1;
  --z-content: 10;
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-fixed: 300;
  --z-modal-backdrop: 400;
  --z-modal: 500;
  --z-popover: 600;
  --z-tooltip: 700;
}
```

**Replace arbitrary values:**
```css
/* From: z-index: 99999 !important; */
/* To:   z-index: var(--z-modal); */
```

---

## Phase 3: Media Query Consolidation (2-3 hours)

### Priority 3.1: Group Duplicate Breakpoints
**Impact:** Medium | **Effort:** Medium | **Risk:** Low

**Consolidate these:**

1. `@media (max-width: 768px)` - 4 instances → 1 block
2. `@media (max-width: 640px)` - 3 instances → 1 block
3. `@media (max-width: 480px)` - 4 instances → 1 block
4. `@media (prefers-reduced-motion: reduce)` - 3 instances → 1 block

**Before:**
```css
/* Line 1200 */
@media (max-width: 768px) {
  .component-a { ... }
}

/* Line 1919 */
@media (max-width: 768px) {
  .component-b { ... }
}
```

**After:**
```css
/* Single consolidated block */
@media (max-width: 768px) {
  .component-a { ... }
  .component-b { ... }
}
```

---

## Phase 4: Animation Consolidation (1-2 hours)

### Priority 4.1: Consolidate Pulse Animations
**Impact:** Low | **Effort:** Low | **Risk:** Low

**Files:** `/src/app/styles/animations.css`

**Actions:**
1. **REMOVE** `@keyframes pulse` (Line 2073) - basic version
2. **KEEP** `@keyframes pulseGlow` (Line 251) - most flexible
3. **RENAME** `@keyframes aiChatPulse` → `@keyframes pulseGreen`
4. Update references to removed animations

---

### Priority 4.2: Review Gradient Animations
**Impact:** Low | **Effort:** Low | **Risk:** Low

**Compare and consolidate if similar:**
- `@keyframes gradient-shift` (Line 1159)
- `@keyframes holoGradientShift` (Line 264)

---

## Phase 5: !important Reduction (4-6 hours)

### Priority 5.1: Implement CSS Layers
**Impact:** Critical | **Effort:** High | **Risk:** Medium

**File:** `/src/app/globals.css` (main file)

**Structure:**
```css
/* 1. Third-party imports */
@import "tw-animate-css";

/* 2. Define layers FIRST */
@layer reset, base, components, utilities, overrides;

/* 3. Tailwind layers */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 4. Custom layers */
@layer base {
  @import './styles/base.css';
}

@layer components {
  @import './styles/components.css';
}

@layer utilities {
  @import './styles/utilities.css';
}

@layer overrides {
  @import './styles/overrides.css';
}
```

---

### Priority 5.2: Remove !important Systematically
**Impact:** High | **Effort:** High | **Risk:** High

**Strategy:**
1. Move third-party overrides to `@layer overrides` - remove !important
2. Move utilities to `@layer utilities` - keep !important for utilities only
3. Remove !important from component styles - let layers control cascade
4. Test thoroughly after each change

**Target:**
- Reduce from 782 to ~200 !important declarations
- Keep !important only in utilities layer

---

## Phase 6: Documentation & Prevention (2-3 hours)

### Priority 6.1: Remove "NUCLEAR FIX" Comments
**Impact:** Low | **Effort:** Low | **Risk:** None

**Replace numbered fix comments with descriptive ones:**
```css
/* BEFORE */
/* NUCLEAR FIX 14: Header card perfect width enforcement */

/* AFTER */
/* Ensure header card matches content width for visual consistency */
```

---

### Priority 6.2: Document CSS Architecture
**Impact:** Medium | **Effort:** Low | **Risk:** None

**Create:** `/src/app/styles/README.md`

**Contents:**
- File structure explanation
- Layer order and purpose
- Specificity guidelines
- When to use !important
- Z-index scale reference
- Design token usage

---

### Priority 6.3: Add Linting Rules (Optional)
**Impact:** Low | **Effort:** Medium | **Risk:** Low

**Install stylelint:**
```bash
npm install --save-dev stylelint stylelint-config-standard
```

**Create `.stylelintrc.json`:**
```json
{
  "extends": "stylelint-config-standard",
  "rules": {
    "selector-max-specificity": "0,3,0",
    "declaration-no-important": true,
    "selector-max-compound-selectors": 3,
    "selector-max-type": 2
  }
}
```

---

## Testing Checklist After Each Phase

- [ ] All pages render correctly
- [ ] Navigation wallet container displays properly
- [ ] Vault detail page layout maintains spacing
- [ ] Tabs align with header card
- [ ] Modals display at correct width
- [ ] Risk badges show correct styling
- [ ] Responsive breakpoints work (test 480px, 640px, 768px)
- [ ] Animations play correctly
- [ ] No console errors
- [ ] Run build process successfully

---

## Risk Mitigation

### High-Risk Changes:
1. **Removing html body div prefixes** - May affect cascade
   - **Mitigation:** Test each page individually
   - **Rollback:** Keep backup of original file

2. **Implementing CSS layers** - Major architectural change
   - **Mitigation:** Implement in feature branch
   - **Test:** Full regression testing
   - **Rollback:** Revert to layer-less structure

3. **Removing !important** - May break overrides
   - **Mitigation:** Remove incrementally, test after each
   - **Rollback:** Add back !important if needed

### Low-Risk Changes:
- Merging duplicate classes
- Adding CSS variables
- Consolidating media queries
- Removing basic pulse animation

---

## Progress Tracking

### Phase 1: Emergency Fixes ☐
- [ ] 1.1: Fix duplicate classes
- [ ] 1.2: Remove specificity hacks
- [ ] 1.3: Reduce html body div prefixes

### Phase 2: CSS Variables ☐
- [ ] 2.1: Merge :root blocks
- [ ] 2.2: Extract common colors
- [ ] 2.3: Establish z-index scale

### Phase 3: Media Queries ☐
- [ ] 3.1: Group duplicate breakpoints

### Phase 4: Animations ☐
- [ ] 4.1: Consolidate pulse animations
- [ ] 4.2: Review gradient animations

### Phase 5: !important Reduction ☐
- [ ] 5.1: Implement CSS layers
- [ ] 5.2: Remove !important systematically

### Phase 6: Documentation ☐
- [ ] 6.1: Remove "NUCLEAR FIX" comments
- [ ] 6.2: Document architecture
- [ ] 6.3: Add linting rules (optional)

---

## Estimated Timeline

| Phase | Duration | Cumulative |
|-------|----------|------------|
| Phase 1 | 2-3 hours | 2-3 hours |
| Phase 2 | 3-4 hours | 5-7 hours |
| Phase 3 | 2-3 hours | 7-10 hours |
| Phase 4 | 1-2 hours | 8-12 hours |
| Phase 5 | 4-6 hours | 12-18 hours |
| Phase 6 | 2-3 hours | 14-21 hours |

**Total Estimated Time:** 14-21 hours (2-3 work days)

---

## Success Metrics

**Before:**
- 3,922 lines
- 782 !important
- 4 duplicates
- 75 extreme selectors
- Specificity debt: 8.5/10

**After (Target):**
- ~2,800 lines (29% reduction)
- ~200 !important (74% reduction)
- 0 duplicates (100% elimination)
- 0 extreme selectors (100% elimination)
- Specificity debt: 2.0/10 (76% improvement)

**Maintainability Improvement:** 75-80% easier to work with

---

## Quick Start

**To begin Phase 1 immediately:**

1. Create a feature branch:
   ```bash
   git checkout -b refactor/css-cleanup
   ```

2. Start with duplicate class fixes:
   ```bash
   # Open the quick reference
   cat /workspaces/yield-delta-protocol/CSS_DUPLICATES_QUICK_REFERENCE.md
   
   # Edit components.css
   code /workspaces/yield-delta-protocol/yield-delta-frontend/src/app/styles/components.css
   ```

3. Apply merged definitions from `CSS_DUPLICATES_QUICK_REFERENCE.md`

4. Test the changes:
   ```bash
   npm run dev
   # Navigate to affected pages and verify rendering
   ```

5. Commit after each successful fix:
   ```bash
   git add .
   git commit -m "refactor(css): merge duplicate .wallet-container-override definitions"
   ```

**Good luck with the cleanup!** 🚀
