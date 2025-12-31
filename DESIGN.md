# DESIGN.md

Design system documentation for NGRAPHICS. Use this as reference for consistent UI/UX.

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

### Accent Colors
| Variable | Value | Usage |
|----------|-------|-------|
| `--accent` | `#3b82f6` | Primary actions, links, focus |
| `--accent-dim` | `#2563eb` | Darker accent variant |
| `--accent-glow` | `rgba(59,130,246,0.25)` | Focus rings (subtle) |
| `--accent-subtle` | `rgba(59,130,246,0.12)` | Backgrounds, hover states |
| `--secondary` | `#8b5cf6` | Secondary accent (indigo) |

### Functional Colors
| Variable | Value | Usage |
|----------|-------|-------|
| `--success` | `#22c55e` | Success messages, connected status |
| `--error` | `#ef4444` | Errors, destructive actions |
| `--warning` | `#eab308` | Warnings, favorites star |

---

## Typography

### Font Families
- **Display**: `'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif` - All UI text
- **Mono**: `'SF Mono', 'JetBrains Mono', 'Fira Code', monospace` - Code, seeds, API keys

### Scale
| Size | Usage |
|------|-------|
| `1.2rem` | Logo title |
| `0.95rem` | Panel titles, generate button |
| `0.9rem` | Input text, major headings |
| `0.85rem` | Body text, action buttons |
| `0.8rem` | Labels, option text |
| `0.75rem` | Small labels, hints |
| `0.7rem` | Keyboard hints, tiny labels |

### Weights
- `400` - Body text
- `500` - Labels, buttons, section labels
- `600` - Titles, emphasis, primary buttons

### Letter Spacing
- Default: `0` (no tracking)
- Negative for large text: `-0.01em`
- Small uppercase text: `0.02em`
- Avoid wide letter-spacing

---

## Spacing

### Standard Gaps
- `4px` - Tight (inline elements)
- `6-8px` - Compact (button groups, small gaps)
- `10-12px` - Default (label to input, list items)
- `16px` - Comfortable (between form groups)
- `20px` - Section padding
- `24px` - Panel padding, major sections
- `32px` - Page margins, panel gaps

### Padding Patterns
- **Inputs**: `12px 16px` (default)
- **Buttons**: `8px 14px` (option buttons), `16px 24px` (generate)
- **Panels**: `24px` horizontal padding
- **Sections**: `20px 0` vertical padding

---

## Border Radius

| Variable | Value | Usage |
|----------|-------|-------|
| `--radius-xs` | `4px` | Small elements, checkboxes |
| `--radius-sm` | `8px` | Buttons, badges, option buttons |
| `--radius-md` | `12px` | Inputs, cards, modals |
| `--radius-lg` | `16px` | Panels, large cards |
| `--radius-xl` | `22px` | Special containers |

---

## Shadows

| Variable | Value | Usage |
|----------|-------|-------|
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)` | Subtle elevation |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1)` | Cards, dropdowns |
| `--shadow-lg` | `0 8px 24px rgba(0,0,0,0.2), 0 4px 8px rgba(0,0,0,0.1)` | Modals, overlays |
| `--shadow-glow` | `0 0 20px rgba(0,122,255,0.15)` | Focus states (subtle) |

---

## Animation & Transitions

### Durations
| Variable | Value | Usage |
|----------|-------|-------|
| `--duration-fast` | `0.2s` | Hover states, small changes |
| `--duration-normal` | `0.3s` | Standard transitions |
| `--duration-slow` | `0.5s` | Large animations, modals |

### Easing
| Variable | Value | Usage |
|----------|-------|-------|
| `--ease-out` | `cubic-bezier(0.25, 0.1, 0.25, 1)` | All transitions (smooth) |
| `--ease-spring` | `cubic-bezier(0.25, 0.1, 0.25, 1)` | Same as ease-out (no bounce) |

### Common Patterns
- **Hover**: `filter: brightness(1.1)` for buttons
- **Active**: `transform: scale(0.99)` for press feedback
- **Focus**: `box-shadow: 0 0 0 3px var(--accent-subtle)` for focus rings
- No `translateY` hover effects (or very subtle)

---

## Component Patterns

### Buttons

**Primary (Generate)**
```css
.btn-generate {
    padding: 16px 24px;
    background: var(--accent);
    color: #ffffff;
    font-weight: 600;
    border-radius: var(--radius-md);
}
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

**Option Button**
```css
.option-btn {
    padding: 8px 14px;
    background: var(--bg-surface);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
    font-weight: 500;
}
.option-btn.active {
    background: var(--accent);
    border-color: var(--accent);
    color: #ffffff;
}
```

### Inputs

**Text Input / Select**
```css
.input-field, .select-field {
    padding: 12px 16px;
    background: var(--bg-surface);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    font-size: 0.9rem;
}
/* Focus: border-color: var(--accent), box-shadow: 0 0 0 3px var(--accent-subtle) */
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

---

## Icons

- Use inline SVGs with `stroke="currentColor"` for color inheritance
- Default stroke-width: `1.5` to `2`
- Standard sizes: `14px`, `16px`, `18px`, `20px`
- Label icons: `14px` (subtle, muted color)
- Button icons: `18px`

---

## Anti-Patterns (Avoid These)

1. **Gradients on buttons** - Use solid colors
2. **Glow effects** - Use subtle shadows instead
3. **Bounce/spring animations** - Use smooth easing
4. **Wide letter-spacing** - Keep tracking tight
5. **Heavy font weights** - Use 500-600, not 700-800
6. **Accent-colored icons in labels** - Use muted colors
7. **TranslateY hover effects** - Use brightness filter
8. **Noise overlays** - Removed for clean aesthetic
9. **Ambient orbs/blurs** - Removed for simplicity
10. **Uppercase text** - Use sparingly, reduce tracking

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
