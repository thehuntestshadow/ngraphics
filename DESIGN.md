# DESIGN.md

Design system documentation for HEFAISTOS. Use this as reference for consistent UI/UX.

## Design Philosophy

**Refined Apple-inspired Aesthetic**

- Clean, minimal interface with subtle depth
- Soft shadows and frosted glass effects
- Pure colors with Apple's system palette
- Generous whitespace and clear hierarchy
- Smooth, subtle animations
- Professional, premium feel

---

## Color Palette

### Backgrounds (Dark Mode)
| Variable | Value | Usage |
|----------|-------|-------|
| `--bg-deep` | `#09090b` | Page background, deepest layer |
| `--bg-base` | `#18181b` | Panel backgrounds |
| `--bg-elevated` | `#27272a` | Elevated surfaces (headers, cards) |
| `--bg-surface` | `#3f3f46` | Form inputs, buttons |
| `--bg-hover` | `#52525b` | Hover states |

### Backgrounds (Light Mode)
| Variable | Value | Usage |
|----------|-------|-------|
| `--bg-deep` | `#ffffff` | Page background |
| `--bg-base` | `#f2f2f7` | Panel backgrounds |
| `--bg-elevated` | `#ffffff` | Elevated surfaces |
| `--bg-surface` | `#e5e5ea` | Form inputs, buttons |
| `--bg-hover` | `#d1d1d6` | Hover states |

### Text
| Variable | Dark Mode | Light Mode | Usage |
|----------|-----------|------------|-------|
| `--text-primary` | `#fafafa` | `#000000` | Headings, important text |
| `--text-secondary` | `#a1a1aa` | `#3c3c43` | Body text, labels |
| `--text-muted` | `#71717a` | `#8e8e93` | Helper text, hints |
| `--text-dim` | `#52525b` | `#aeaeb2` | Disabled text |

### Borders
| Variable | Value | Usage |
|----------|-------|-------|
| `--border-subtle` | `rgba(255,255,255,0.08)` | Dividers, section separators |
| `--border-default` | `rgba(255,255,255,0.14)` | Input borders, cards |
| `--border-strong` | `rgba(255,255,255,0.22)` | Hover states, emphasis |
| `--border-highlight` | `rgba(255,255,255,0.30)` | Active states |

### Apple Color Palette
| Variable | Value | Usage |
|----------|-------|-------|
| `--apple-blue` | `#007AFF` | Primary accent, links, CTAs |
| `--apple-indigo` | `#5856D6` | Secondary accent, gradients |
| `--apple-purple` | `#AF52DE` | Tertiary accent, gradients |
| `--apple-pink` | `#FF2D55` | Accent highlights |
| `--apple-red` | `#FF3B30` | Errors, destructive actions |
| `--apple-orange` | `#FF9500` | Warnings, alerts |
| `--apple-yellow` | `#FFCC00` | Favorites star, highlights |
| `--apple-green` | `#34C759` | Success, connected status |
| `--apple-teal` | `#5AC8FA` | Info, secondary highlights |

### Accent Colors
| Variable | Value | Usage |
|----------|-------|-------|
| `--accent` | `var(--apple-blue)` | Primary actions, links, focus |
| `--accent-dim` | `#0056B3` | Darker accent variant |
| `--accent-glow` | `rgba(0,122,255,0.25)` | Focus rings (subtle) |
| `--accent-subtle` | `rgba(0,122,255,0.12)` | Backgrounds, hover states |
| `--secondary` | `var(--apple-indigo)` | Secondary accent |

### Gradient Presets
| Variable | Value | Usage |
|----------|-------|-------|
| `--gradient-primary` | `linear-gradient(135deg, var(--apple-blue), var(--apple-indigo))` | Primary buttons, active states |
| `--gradient-primary-hover` | `linear-gradient(135deg, var(--apple-indigo), var(--apple-purple))` | Primary button hover |
| `--gradient-success` | `linear-gradient(135deg, var(--apple-green), var(--apple-teal))` | Success states |
| `--gradient-warning` | `linear-gradient(135deg, var(--apple-orange), var(--apple-yellow))` | Warning states |
| `--gradient-danger` | `linear-gradient(135deg, var(--apple-red), var(--apple-orange))` | Error/danger states |

### Beautiful Gradient Patterns

**Rainbow Animated Gradient (Generate Button)**
```css
.btn-generate {
    background: linear-gradient(135deg,
        var(--apple-blue), var(--apple-indigo),
        var(--apple-purple), var(--apple-pink),
        var(--apple-blue));
    background-size: 300% 300%;
    animation: gradientShift 8s ease infinite;
}

@keyframes gradientShift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
}
```

**Subtle Mesh Gradient (Backgrounds)**
```css
.gradient-mesh {
    background:
        radial-gradient(at 40% 20%, rgba(0, 122, 255, 0.08) 0px, transparent 50%),
        radial-gradient(at 80% 0%, rgba(175, 82, 222, 0.06) 0px, transparent 50%),
        radial-gradient(at 0% 50%, rgba(88, 86, 214, 0.05) 0px, transparent 50%),
        var(--bg-base);
}
```

**Shimmer Loading Effect**
```css
.shimmer {
    background: linear-gradient(
        90deg,
        var(--bg-surface) 0%,
        var(--bg-hover) 50%,
        var(--bg-surface) 100%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s ease-in-out infinite;
}

@keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}
```

**Glass Gradient Overlay**
```css
.glass-gradient {
    background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.1) 0%,
        rgba(255, 255, 255, 0.05) 50%,
        rgba(255, 255, 255, 0.02) 100%
    );
    backdrop-filter: saturate(180%) blur(20px);
}
```

**Accent Glow Gradient**
```css
.accent-glow {
    background: radial-gradient(
        ellipse at center,
        rgba(0, 122, 255, 0.15) 0%,
        transparent 70%
    );
}
```

### Functional Colors
| Variable | Value | Usage |
|----------|-------|-------|
| `--success` | `var(--apple-green)` | Success messages, connected status |
| `--error` | `var(--apple-red)` | Errors, destructive actions |
| `--warning` | `var(--apple-orange)` | Warnings |

---

## Typography

### Font Families
- **Display**: `'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif` - All UI text
- **Mono**: `'SF Mono', 'JetBrains Mono', 'Fira Code', monospace` - Code, seeds, API keys

### Type Scale (CSS Variables)
| Variable | Value | Usage |
|----------|-------|-------|
| `--font-size-xs` | `0.6875rem` (11px) | Tiny labels, keyboard hints |
| `--font-size-sm` | `0.75rem` (12px) | Small labels, hints |
| `--font-size-base` | `0.8125rem` (13px) | Body text, labels |
| `--font-size-md` | `0.875rem` (14px) | Emphasized text, inputs |
| `--font-size-lg` | `0.9375rem` (15px) | Section titles |
| `--font-size-xl` | `1.0625rem` (17px) | Panel titles |
| `--font-size-2xl` | `1.25rem` (20px) | Page titles |
| `--font-size-3xl` | `1.5rem` (24px) | Hero text |

### Font Weights (CSS Variables)
| Variable | Value | Usage |
|----------|-------|-------|
| `--font-weight-normal` | `400` | Body text |
| `--font-weight-medium` | `500` | Labels, buttons, section labels |
| `--font-weight-semibold` | `600` | Titles, emphasis, primary buttons |

### Letter Spacing
- Default: `0` (no tracking)
- Negative for large text: `-0.01em`
- Small uppercase text: `0.02em`
- Avoid wide letter-spacing

---

## Spacing

### 8px Grid System (CSS Variables)
| Variable | Value | Usage |
|----------|-------|-------|
| `--space-0` | `0` | No spacing |
| `--space-1` | `4px` | Tight (inline elements) |
| `--space-2` | `8px` | Compact (button groups) |
| `--space-3` | `12px` | Default (label to input) |
| `--space-4` | `16px` | Comfortable (form groups) |
| `--space-5` | `20px` | Section padding |
| `--space-6` | `24px` | Panel padding, major sections |
| `--space-8` | `32px` | Page margins, panel gaps |
| `--space-10` | `40px` | Large gaps between panels |
| `--space-12` | `48px` | Hero sections |
| `--space-16` | `64px` | Major page sections |

### Padding Patterns
- **Inputs**: `11px 14px` (refined)
- **Buttons**: `8px 16px` (pill buttons), `16px 24px` (generate)
- **Panels**: `24px` horizontal padding
- **Sections**: `var(--space-6) 0` vertical padding

### Layout
- **Max-width**: `1280px` for main content
- **Grid gap**: `var(--space-10)` (40px) between panels

---

## Border Radius

| Variable | Value | Usage |
|----------|-------|-------|
| `--radius-xs` | `4px` | Small elements, checkboxes |
| `--radius-sm` | `6px` | Inputs, small elements |
| `--radius-md` | `10px` | Cards, modals |
| `--radius-lg` | `14px` | Panels, large cards |
| `--radius-xl` | `20px` | Special containers |
| `--radius-pill` | `9999px` | Pill-shaped buttons, toggles |

---

## Shadows

### Soft Shadow System
| Variable | Value | Usage |
|----------|-------|-------|
| `--shadow-xs` | `0 1px 2px rgba(0,0,0,0.04)` | Minimal elevation |
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)` | Subtle elevation |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04)` | Cards, dropdowns |
| `--shadow-lg` | `0 10px 20px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.04)` | Modals, overlays |
| `--shadow-glow` | `0 0 20px rgba(0,122,255,0.15)` | Focus states (subtle) |
| `--shadow-primary` | `0 4px 14px rgba(0,122,255,0.25)` | Active buttons with accent |
| `--shadow-success` | `0 4px 14px rgba(52,199,89,0.25)` | Success states |

### Glassmorphism
| Variable | Value | Usage |
|----------|-------|-------|
| `--glass-bg` | `rgba(28,28,30,0.72)` | Frosted glass background |
| `--glass-blur` | `saturate(180%) blur(20px)` | Backdrop filter |
| `--glass-border` | `rgba(255,255,255,0.08)` | Glass panel border |

---

## Animation & Transitions

### Durations (Faster, Snappier)
| Variable | Value | Usage |
|----------|-------|-------|
| `--duration-fast` | `0.15s` | Hover states, small changes |
| `--duration-normal` | `0.25s` | Standard transitions |
| `--duration-slow` | `0.4s` | Large animations, modals |

### Easing Curves
| Variable | Value | Usage |
|----------|-------|-------|
| `--ease-default` | `cubic-bezier(0.25, 0.1, 0.25, 1)` | Standard smooth easing |
| `--ease-out` | `cubic-bezier(0.25, 0.1, 0.25, 1)` | Exit transitions |
| `--ease-out-soft` | `cubic-bezier(0, 0, 0.58, 1)` | Gentle deceleration |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Spring effect with overshoot |
| `--ease-in` | `cubic-bezier(0.42, 0, 1, 1)` | Entry acceleration |

### Modal Animations
```css
@keyframes modal-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
}
@keyframes modal-enter {
    from { opacity: 0; transform: scale(0.95) translateY(10px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
}
.modal-content {
    animation: modal-enter var(--duration-slow) var(--ease-spring);
}
```

### Common Patterns
- **Hover**: `filter: brightness(1.1)` for buttons
- **Active**: `transform: scale(0.99)` for press feedback
- **Focus**: Double ring effect with `box-shadow: 0 0 0 3px var(--accent-subtle), 0 0 0 1px var(--apple-blue)`
- **Toggles**: Spring animation on state change

### Beautiful Animation Patterns

**Smooth Fade In**
```css
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}
.fade-in { animation: fadeIn 0.3s var(--ease-out); }
```

**Slide Up Entrance**
```css
@keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}
.slide-up { animation: slideUp 0.4s var(--ease-out); }
```

**Scale Pop**
```css
@keyframes scalePop {
    0% { transform: scale(0.95); opacity: 0; }
    70% { transform: scale(1.02); }
    100% { transform: scale(1); opacity: 1; }
}
.scale-pop { animation: scalePop 0.3s var(--ease-spring); }
```

**Pulse Glow (Loading/Active)**
```css
@keyframes pulseGlow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(0, 122, 255, 0.4); }
    50% { box-shadow: 0 0 0 8px rgba(0, 122, 255, 0); }
}
.pulse-glow { animation: pulseGlow 2s ease-in-out infinite; }
```

**Spinner Rotation**
```css
@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
.spinner { animation: spin 1s linear infinite; }
```

**Floating Effect**
```css
@keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
}
.floating { animation: float 3s ease-in-out infinite; }
```

**Stagger Children Animation**
```css
.stagger-children > * {
    opacity: 0;
    animation: slideUp 0.4s var(--ease-out) forwards;
}
.stagger-children > *:nth-child(1) { animation-delay: 0.05s; }
.stagger-children > *:nth-child(2) { animation-delay: 0.1s; }
.stagger-children > *:nth-child(3) { animation-delay: 0.15s; }
.stagger-children > *:nth-child(4) { animation-delay: 0.2s; }
```

**Skeleton Loading**
```css
@keyframes skeleton {
    0% { background-position: -200px 0; }
    100% { background-position: calc(200px + 100%) 0; }
}
.skeleton {
    background: linear-gradient(
        90deg,
        var(--bg-surface) 0px,
        var(--bg-hover) 40px,
        var(--bg-surface) 80px
    );
    background-size: 200px 100%;
    animation: skeleton 1.2s ease-in-out infinite;
}
```

---

## Decorative Elements

### Subtle Background Patterns

**Dot Grid**
```css
.dot-grid {
    background-image: radial-gradient(
        circle,
        rgba(255, 255, 255, 0.05) 1px,
        transparent 1px
    );
    background-size: 24px 24px;
}
```

**Subtle Lines**
```css
.subtle-lines {
    background-image: linear-gradient(
        90deg,
        transparent 0%,
        transparent 49%,
        rgba(255, 255, 255, 0.03) 50%,
        transparent 51%,
        transparent 100%
    );
    background-size: 60px 100%;
}
```

### Accent Decorations

**Gradient Border**
```css
.gradient-border {
    border: 1px solid transparent;
    background: linear-gradient(var(--bg-base), var(--bg-base)) padding-box,
                linear-gradient(135deg, var(--apple-blue), var(--apple-purple)) border-box;
}
```

**Top Accent Line**
```css
.accent-top {
    position: relative;
}
.accent-top::before {
    content: '';
    position: absolute;
    top: 0;
    left: 20%;
    right: 20%;
    height: 2px;
    background: linear-gradient(90deg,
        transparent,
        var(--apple-blue),
        var(--apple-indigo),
        transparent
    );
    border-radius: 2px;
}
```

**Corner Glow**
```css
.corner-glow {
    position: relative;
}
.corner-glow::before {
    content: '';
    position: absolute;
    top: -50px;
    right: -50px;
    width: 150px;
    height: 150px;
    background: radial-gradient(
        circle,
        rgba(0, 122, 255, 0.1) 0%,
        transparent 70%
    );
    pointer-events: none;
}
```

### Visual Polish

**Card Shine Effect**
```css
.card-shine {
    position: relative;
    overflow: hidden;
}
.card-shine::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
        to bottom right,
        rgba(255, 255, 255, 0.1) 0%,
        rgba(255, 255, 255, 0.05) 40%,
        transparent 50%
    );
    pointer-events: none;
}
```

**Frosted Glass Card**
```css
.frosted-card {
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: saturate(180%) blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow:
        0 4px 6px rgba(0, 0, 0, 0.04),
        inset 0 1px 0 rgba(255, 255, 255, 0.06);
}
```

**Inset Shadow Depth**
```css
.inset-depth {
    box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.05),
        inset 0 -1px 0 rgba(0, 0, 0, 0.1),
        0 1px 2px rgba(0, 0, 0, 0.05);
}
```

---

## Component Patterns

### Buttons

**Primary (Generate) - Animated Rainbow Gradient**
```css
.btn-generate {
    padding: 16px 24px;
    background: linear-gradient(135deg,
        var(--apple-blue), var(--apple-indigo),
        var(--apple-purple), var(--apple-pink),
        var(--apple-blue));
    background-size: 300% 300%;
    animation: gradientShift 8s ease infinite;
    color: #ffffff;
    font-weight: 600;
    border-radius: var(--radius-md);
}
/* Animated gradient cycles through Apple colors */
/* Hover: filter: brightness(1.1), box-shadow: var(--shadow-md) */
/* Active: filter: brightness(0.95), transform: scale(0.99) */
```

**Secondary**
```css
.btn-secondary {
    padding: 10px 16px;
    background: var(--bg-surface);
    border: 1px solid var(--border-default);
    color: var(--text-secondary);
}
/* Hover: background: var(--bg-hover), color: var(--text-primary) */
```

**Option Button (Pill Style)**
```css
.option-btn {
    padding: 8px 16px;
    background: var(--bg-surface);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-pill);  /* Pill shape */
    box-shadow: var(--shadow-xs);
    font-weight: 500;
    transition: all var(--duration-fast) var(--ease-out);
}
.option-btn:hover {
    background: var(--bg-hover);
    border-color: var(--border-strong);
}
.option-btn.active {
    background: linear-gradient(135deg, var(--apple-blue), var(--apple-indigo));
    border-color: transparent;
    color: #ffffff;
    box-shadow: var(--shadow-primary);
}
```

### Inputs

**Text Input / Select (Refined)**
```css
.input-field, .select-field {
    padding: 11px 14px;
    background: var(--bg-surface);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
    font-size: var(--font-size-md);
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
    transition: all var(--duration-fast) var(--ease-out);
}
/* Focus: Double ring effect */
.input-field:focus {
    border-color: var(--apple-blue);
    box-shadow: 0 0 0 3px var(--accent-subtle), 0 0 0 1px var(--apple-blue);
    outline: none;
}
```

### Toggle Switches (Premium)
```css
.toggle-switch {
    width: 44px;
    height: 24px;
    border-radius: var(--radius-pill);
    background: var(--bg-hover);
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.05);
}
.toggle-switch::after {
    width: 18px;
    height: 18px;
    background: #ffffff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    transition: transform var(--duration-normal) var(--ease-spring);
}
.toggle-checkbox:checked + .toggle-switch {
    background: var(--apple-green);
}
.toggle-checkbox:checked + .toggle-switch::after {
    transform: translateX(20px);
}
```

### Panels

**Panel Structure**
```html
<section class="panel panel-config">
    <div class="panel-header">
        <h2 class="panel-title">
            <span class="title-number">01</span>
            Section Name
        </h2>
    </div>
    <form class="config-form">
        <div class="config-section">...</div>
    </form>
</section>
```

**Panel Title**
```css
.panel-title {
    font-size: 0.95rem;
    font-weight: 600;
    letter-spacing: 0;
}
.title-number {
    background: var(--bg-surface);
    color: var(--text-muted);
}
```

### Section Labels
```css
.section-label {
    font-size: 0.8rem;
    font-weight: 500;
    letter-spacing: 0;
    color: var(--text-secondary);
}
.label-icon {
    color: var(--text-muted);  /* Not accent color */
}
```

### Section Dividers (Fade-Edge)
```css
.config-section {
    position: relative;
}
.config-section::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 10%;
    right: 10%;
    height: 1px;
    background: linear-gradient(90deg,
        transparent 0%,
        var(--border-subtle) 20%,
        var(--border-subtle) 80%,
        transparent 100%
    );
}
.config-section:last-of-type::after {
    display: none;
}
```

---

## Icons

- Use inline SVGs with `stroke="currentColor"` for color inheritance
- Default stroke-width: `1.5` to `2`
- Standard sizes: `14px`, `16px`, `18px`, `20px`
- Label icons: `14px` (subtle, muted color)
- Button icons: `18px`

---

## Design Patterns

### Gradient Usage
Gradients are used throughout the app for interactive elements:

1. **Generate button** - Animated rainbow gradient (blue → indigo → purple → pink)
2. **Active states** - Blue → Indigo gradient for toggles, tabs, checkboxes
3. **Progress bars** - Blue → Indigo gradient (warning: orange, danger: red)
4. **Dashboard nav icons** - Unique colorful gradient per studio
5. **Title numbers** - Blue gradient for panel headers

### Anti-Patterns (Avoid These)

1. **Glow effects** - Use subtle shadows instead
2. **Bounce/spring animations** - Use smooth easing
3. **Wide letter-spacing** - Keep tracking tight
4. **Heavy font weights** - Use 500-600, not 700-800
5. **Accent-colored icons in labels** - Use muted colors
6. **TranslateY hover effects** - Use brightness filter
7. **Noise overlays** - Removed for clean aesthetic
8. **Ambient orbs/blurs** - Removed for simplicity
9. **Uppercase text** - Use sparingly, reduce tracking
10. **Solid colors for CTAs** - Use gradients for primary actions

---

## Responsive Breakpoints

```css
@media (max-width: 1024px) {
    /* Stack panels vertically */
    .app-grid { grid-template-columns: 1fr; }
}
```

---

## Accessibility Notes

- Focus states: Always visible with accent color ring
- Color contrast: Text passes WCAG AA
- Keyboard navigation: All interactive elements focusable
- Touch targets: Minimum 36px for buttons
