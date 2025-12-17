# Testnet Visual Indicators - User Guide

## Visual Placement Overview

This guide shows where testnet indicators appear throughout the Yield Delta Protocol application.

## 1. Navigation Bar Badge (Top Left)
```
┌─────────────────────────────────────────────────────────┐
│ [Logo] [🌐 Testnet •]  Vaults Market Charts ... [Wallet] │
│         ↑ TESTNET INDICATOR                               │
└─────────────────────────────────────────────────────────┘
```

**Location:** Next to the logo in the top navigation bar
**Visibility:** Always visible while on testnet, scrolls with page
**Style:**
- Amber/orange background with border
- Network icon (🌐)
- "Testnet" text (hidden on mobile)
- Pulsing dot indicator

**Responsive Behavior:**
- Desktop: Shows full "Testnet" text
- Mobile: Shows only icon and pulsing dot

---

## 2. Banner Alert (Below Navigation)
```
┌───────────────────────────────────────────────────────────┐
│ ⚠️ Testnet Environment                                     │
│ You are connected to SEI Atlantic-2 Testnet.              │
│ This is not real money. All transactions use test tokens. │
│ ─────────────────────────────────── (shimmer animation)   │
└───────────────────────────────────────────────────────────┘
```

**Location:** Fixed below the navigation bar (top of page)
**Visibility:** Shown on landing page and can be added to any page
**Style:**
- Full-width banner
- Gradient background (amber → orange → amber)
- Warning triangle icon
- Detailed explanation text
- Animated shimmer line at bottom

**Responsive Behavior:**
- Desktop: Full message with details
- Mobile: Shortened message, smaller padding

---

## 3. Wallet Network Button (Top Right)
```
┌────────────────────────────────────────┐
│ [SEI Testnet •] [0x1234...5678 (2.5 SEI)] │
│  ↑ WARNING STYLE    ↑ WALLET ADDRESS    │
└────────────────────────────────────────┘
```

**Location:** Wallet connect button area in top right
**Visibility:** Only when wallet is connected
**Style:**
- Amber gradient background (warning style)
- Chain icon
- "SEI Testnet" text
- Pulsing amber dot indicator
- Tooltip: "Testnet - Not real money"

**States:**
- Mainnet: Blue/purple gradient, "SEI"
- Testnet: Amber gradient, "SEI Testnet" + pulsing dot
- Wrong Network: Red gradient, "Wrong network"

**Responsive Behavior:**
- Desktop: Full chain name + indicator
- Tablet: Abbreviated name
- Mobile: Hidden (space-saving)

---

## 4. Floating Badge (Bottom Right)
```
                                    ┌────────────────┐
                                    │ 🌐 SEI Testnet │
                                    │           •    │
                                    └────────────────┘
                                         ↑ FLOATING
                                         ↑ PERSISTENT
```

**Location:** Fixed in bottom-right corner
**Visibility:** Always visible on all pages when on testnet
**Style:**
- Rounded corners
- Amber/orange gradient background
- Network icon
- "SEI Testnet" text
- Pulsing indicator dot
- Hover: Slight scale increase
- Subtle pulse animation

**Responsive Behavior:**
- Desktop: "SEI Testnet"
- Mobile: "Testnet"
- Always maintains touch-friendly size (minimum 44x44px)

---

## Complete Page Layout Example

```
┌──────────────────────────────────────────────────────────────┐
│ Navigation Bar                                               │
│ [Logo] [🌐 Testnet •] Links... [SEI Testnet •] [Wallet]     │
├──────────────────────────────────────────────────────────────┤
│ ⚠️ Testnet Banner                                            │
│ You are connected to SEI Atlantic-2 Testnet...              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│                    Page Content                              │
│                                                              │
│                                                              │
│                                                              │
│                                              ┌──────────────┐│
│                                              │🌐 SEI Testnet││
│                                              │          •   ││
│                                              └──────────────┘│
└──────────────────────────────────────────────────────────────┘
```

---

## Color Palette

### Testnet Warning Colors
| Element | Color | Hex | RGB |
|---------|-------|-----|-----|
| Primary | Amber | #F59E0B | rgb(245, 158, 11) |
| Secondary | Orange | #FB923C | rgb(251, 147, 60) |
| Accent | Yellow | #FBB936 | rgb(251, 191, 54) |
| Light | Amber 200 | #FDE68A | rgb(253, 230, 138) |

### Gradient Examples
```css
/* Banner Background */
background: linear-gradient(to right,
  rgba(245, 158, 11, 0.15),
  rgba(251, 147, 60, 0.15),
  rgba(245, 158, 11, 0.15)
);

/* Button Warning */
background: linear-gradient(135deg,
  rgba(251, 191, 54, 0.15),
  rgba(245, 158, 11, 0.1)
);

/* Border */
border: 1px solid rgba(251, 191, 54, 0.4);
```

---

## Icons Used

- **Network Icon:** `<Network />` from lucide-react
- **Warning Icon:** `<AlertTriangle />` from lucide-react
- **Pulsing Dot:** Custom CSS animation (amber-400)

---

## Animation Specifications

### Pulse Animation (Indicator Dots)
```css
@keyframes pulse-subtle {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.85; }
}
/* Duration: 3s, Infinite */
```

### Shimmer Animation (Banner Line)
```css
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
/* Duration: 3s, Ease-in-out, Infinite */
```

### Hover Scale (Floating Badge)
```css
/* Base state: scale(1) */
/* Hover state: scale(1.05) */
/* Transition: 300ms ease */
```

---

## Accessibility Features

### Screen Reader Announcements
```html
<!-- Banner -->
<div role="alert" aria-live="polite">
  ⚠️ Testnet Environment
  You are connected to SEI Atlantic-2 Testnet.
</div>

<!-- Badge -->
<div role="status" aria-live="polite">
  SEI Testnet
</div>

<!-- Button Tooltip -->
<button title="Testnet - Not real money">
  SEI Testnet
</button>
```

### Keyboard Navigation
- All indicators are either non-interactive or fully keyboard accessible
- Tab order is preserved
- Focus states are visible

### Color Contrast
- All text meets WCAG AA standards (4.5:1 minimum)
- Multiple indicators beyond just color (text + icon + animation)

---

## User Actions

### What Users See
1. **First Visit (Not Connected)**
   - Navigation badge shows testnet
   - Banner explains testnet environment
   - Floating badge in corner

2. **After Connecting Wallet**
   - Network button shows "SEI Testnet" with amber style
   - Pulsing dots on multiple indicators
   - All three indicators confirm testnet status

3. **Wrong Network**
   - Network button shows "Wrong network" in red
   - User prompted to switch to correct network
   - Testnet indicators still visible if on any testnet

### How to Switch Networks
1. Click the network button in wallet area
2. Select correct network from modal
3. Approve network switch in wallet
4. Indicators update automatically

---

## Developer Notes

### How to Test
```bash
# Start development server
npm run dev

# Connect wallet to SEI Testnet (Chain ID: 1328)
# Verify all 4 indicators appear:
# 1. Navigation badge ✓
# 2. Banner (if on landing page) ✓
# 3. Network button (after connection) ✓
# 4. Floating badge ✓

# Switch to mainnet (Chain ID: 1329)
# Verify all indicators disappear ✓
```

### Manual Testing Checklist
- [ ] Navigation badge appears on testnet
- [ ] Navigation badge shows correct text (desktop vs mobile)
- [ ] Banner appears below navigation
- [ ] Banner text is readable on mobile
- [ ] Network button shows amber style on testnet
- [ ] Network button has pulsing dot
- [ ] Floating badge appears in bottom-right
- [ ] Floating badge is clickable (for future dismiss feature)
- [ ] All indicators disappear on mainnet
- [ ] Animations are smooth (no jank)
- [ ] Touch targets are 44x44px minimum on mobile
- [ ] Screen reader announces testnet status
- [ ] Keyboard navigation works

---

## Future Enhancements

### Planned Features
1. **Dismissible Banner**
   - Allow users to hide banner (with localStorage preference)
   - Show "minimize" button on banner
   - Keep other indicators visible

2. **Network Switching Assistant**
   - One-click network switch from indicators
   - Guided flow for users on wrong network
   - Automatic network detection

3. **Faucet Integration**
   - Link to testnet faucet from indicators
   - Show testnet token balance warnings
   - Request testnet tokens directly

4. **Custom Messages**
   - Different messages for devnet vs testnet
   - Countdown to mainnet launch
   - Custom warnings for beta features

---

## Support & Troubleshooting

### Indicators Not Showing
1. Check wallet is connected
2. Verify correct network (Chain ID 1328 or 713715)
3. Clear browser cache
4. Check environment variables
5. Ensure JavaScript is enabled

### Indicators Showing on Mainnet
1. Disconnect and reconnect wallet
2. Verify `NEXT_PUBLIC_CHAIN_ID` environment variable
3. Check wallet is on correct network
4. Report bug if persists

### Style Issues
1. Check browser DevTools for CSS conflicts
2. Verify Tailwind CSS is loaded
3. Clear browser cache
4. Try incognito/private mode

---

**Last Updated:** 2025-12-17
**Version:** 1.0.0
