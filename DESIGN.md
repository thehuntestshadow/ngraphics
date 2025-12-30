# DESIGN.md

Design system documentation for NGRAPHICS. Use this as reference for consistent UI/UX.

## Design Philosophy

**Dark Editorial Brutalism × Tech Futurism**

- Dark, immersive interface with subtle noise texture
- Electric cyan (`--accent`) and hot magenta (`--secondary`) accents
- Clean typography with strong visual hierarchy
- Generous whitespace, not cramped
- Subtle animations and glow effects
- Professional, not playful

---

## Color Palette

### Backgrounds (Dark Mode)
| Variable | Value | Usage |
|----------|-------|-------|
| `--bg-deep` | `#0a0a0c` | Page background, deepest layer |
| `--bg-base` | `#0f0f12` | Panel backgrounds |
| `--bg-elevated` | `#151519` | Elevated surfaces (headers, cards) |
| `--bg-surface` | `#1a1a1f` | Form inputs, buttons |
| `--bg-hover` | `#222228` | Hover states |

### Text
| Variable | Value | Usage |
|----------|-------|-------|
| `--text-primary` | `#f0f0f2` | Headings, important text |
| `--text-secondary` | `#9a9aa8` | Body text, labels |
| `--text-muted` | `#5a5a68` | Helper text, hints |
| `--text-dim` | `#3a3a45` | Placeholders, disabled |

### Borders
| Variable | Value | Usage |
|----------|-------|-------|
| `--border-subtle` | `rgba(255,255,255,0.06)` | Dividers, section separators |
| `--border-default` | `rgba(255,255,255,0.1)` | Input borders, cards |
| `--border-strong` | `rgba(255,255,255,0.15)` | Hover states, emphasis |

### Accent Colors
| Variable | Value | Usage |
|----------|-------|-------|
| `--accent` | `#00d4ff` | Primary actions, links, focus |
| `--accent-dim` | `#00a8cc` | Darker accent variant |
| `--accent-glow` | `rgba(0,212,255,0.3)` | Glow effects |
| `--accent-subtle` | `rgba(0,212,255,0.08)` | Backgrounds, hover states |
| `--secondary` | `#ff2d95` | Secondary accent (magenta) |

### Functional Colors
| Variable | Value | Usage |
|----------|-------|-------|
| `--success` | `#00cc88` | Success messages, connected status |
| `--error` | `#ff4757` | Errors, destructive actions |
| `--warning` | `#ffb830` | Warnings, favorites star |

---

## Typography

### Font Families
- **Display**: `'Outfit', sans-serif` - All UI text
- **Mono**: `'JetBrains Mono', monospace` - Code, seeds, API keys

### Scale
| Size | Usage |
|------|-------|
| `1.25rem` | Logo title |
| `1rem` | Generate button, major headings |
| `0.9rem` | Panel titles, input text |
| `0.85rem` | Body text, select options |
| `0.8rem` | Labels, option text |
| `0.75rem` | Small labels, hints, status text |
| `0.7rem` | Keyboard hints, tiny labels |

### Weights
- `400` - Body text
- `500` - Labels, buttons
- `600` - Section labels, emphasis
- `700` - Titles, generate button
- `800` - Logo

---

## Spacing

### Standard Gaps
- `4px` - Tight (toggle buttons, inline elements)
- `6-8px` - Compact (button groups, small gaps)
- `10-12px` - Default (label to input, list items)
- `16px` - Comfortable (between form groups)
- `20px` - Section padding
- `24px` - Panel padding, major sections
- `32px` - Page margins, panel gaps

### Padding Patterns
- **Inputs**: `12px 16px` (default), `10px 12px` (small)
- **Buttons**: `8px 16px` (default), `6px 12px` (small)
- **Panels**: `24px` horizontal padding
- **Sections**: `20px 0` vertical padding

---

## Border Radius

| Variable | Value | Usage |
|----------|-------|-------|
| `--radius-sm` | `6px` | Small buttons, badges, checkboxes |
| `--radius-md` | `10px` | Inputs, cards, modals |
| `--radius-lg` | `14px` | Panels, large cards |
| `--radius-xl` | `20px` | Special containers |

---

## Component Patterns

### Buttons

**Primary (Generate)**
```css
.btn-generate {
    padding: 18px 24px;
    background: radial-gradient(...accent...);
    color: var(--bg-deep);
    font-weight: 700;
    border-radius: var(--radius-md);
}
/* Hover: translateY(-2px), glow shadow */
```

**Secondary**
```css
.btn-secondary {
    padding: 10px 16px;
    background: transparent;
    border: 1px solid var(--border-default);
    color: var(--text-secondary);
}
/* Hover: border-color accent, color accent */
```

**Icon Button**
```css
.btn-icon {
    width: 36px;
    height: 36px;
    background: var(--bg-surface);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
}
```

**Text Button**
```css
.btn-text {
    background: none;
    border: none;
    color: var(--text-muted);
    font-size: 0.75rem;
}
/* Hover: color text-secondary */

.btn-text-danger {
    color: var(--error);
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
/* Focus: border-color accent, box-shadow accent-subtle */
```

**Textarea**
```css
.textarea-field {
    min-height: 80px;
    resize: vertical;
}
```

### Panels

**Two-Panel Layout**
```css
.app-grid {
    display: grid;
    grid-template-columns: minmax(400px, 480px) 1fr;
    gap: 32px;
}
```

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

### Form Sections

**Config Section**
```css
.config-section {
    padding: 20px 0;
    border-bottom: 1px solid var(--border-subtle);
}
```

**Section Label**
```html
<div class="section-label">
    <span class="label-icon"><svg>...</svg></span>
    <span>Label Text</span>
</div>
```

**Option Row**
```css
.option-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
}
```

### Toggle Group (Segmented Control)
```html
<div class="toggle-group">
    <button class="toggle-btn active" data-value="1">Option 1</button>
    <button class="toggle-btn" data-value="2">Option 2</button>
</div>
```
```css
.toggle-group {
    display: flex;
    gap: 4px;
    padding: 4px;
    background: var(--bg-surface);
    border-radius: var(--radius-md);
}
.toggle-btn.active {
    background: var(--accent);
    color: var(--bg-deep);
}
```

### Collapsible Section
```html
<div class="advanced-section">
    <button class="advanced-toggle" id="advancedToggle">
        <span>Advanced Options</span>
        <svg class="toggle-chevron">...</svg>
    </button>
    <div class="advanced-content">...</div>
</div>
```

### Messages
```html
<div class="message message-error">
    <div class="message-icon">!</div>
    <div class="message-content">Error text</div>
</div>
```

### Empty States
```html
<div class="empty-state">
    <div class="empty-state-icon"><svg>...</svg></div>
    <p class="empty-state-title">No items yet</p>
    <p class="empty-state-text">Description text</p>
</div>
```

---

## Animation & Transitions

### Durations
| Variable | Value | Usage |
|----------|-------|-------|
| `--duration-fast` | `0.15s` | Hover states, small changes |
| `--duration-normal` | `0.25s` | Standard transitions |
| `--duration-slow` | `0.4s` | Large animations, modals |

### Easing
| Variable | Value | Usage |
|----------|-------|-------|
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Most transitions |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Bouncy effects |

### Common Patterns
- **Hover lift**: `transform: translateY(-2px)`
- **Focus glow**: `box-shadow: 0 0 0 3px var(--accent-subtle)`
- **Button press**: No transform on disabled

---

## Icons

- Use inline SVGs with `stroke="currentColor"` for color inheritance
- Default stroke-width: `2` (sometimes `1.5` for larger icons)
- Standard sizes: `14px`, `16px`, `18px`, `20px`

### Icon Size by Context
| Context | Size | Example |
|---------|------|---------|
| Section label icons | `16px` | `.section-label .label-icon svg` |
| History/Favorites header icons | `14px` | `.history-header h3 svg`, `.favorites-title svg` |
| Option/scene buttons | `20px` | `.scene-btn svg`, `.option-btn svg` |
| Small buttons | `14-16px` | `.btn-icon svg`, `.btn-text svg` |
| Result placeholder icons | `48px` | `.placeholder-icon svg` |
| Empty state icons | `64px` | `.empty-state-icon svg` |

---

## Shadows

| Variable | Usage |
|----------|-------|
| `--shadow-sm` | Subtle elevation |
| `--shadow-md` | Cards, dropdowns |
| `--shadow-lg` | Modals, overlays |
| `--shadow-glow` | Accent glow on hover |

---

## Layout Patterns

### Header
- Sticky, blur backdrop
- Logo left, controls right
- Gap between controls: `20px`

### Navigation Links
```css
.docs-link, .btn-back {
    padding: 6px 12px;
    font-size: 0.75-0.8rem;
    background: var(--bg-surface);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
}
```

### Result Panel (Right)
- Contains: result image, result info, feedback section
- History and Favorites sections with grid layout
- Grid: `repeat(auto-fill, minmax(100px, 1fr))`

### History & Favorites Component

Standardized component for all pages. See `UI_PATTERNS.md` for full HTML.

| Element | Class | Styling |
|---------|-------|---------|
| History header | `.history-header` | Flex, space-between |
| History title | `h3` with clock icon | Icon 14px, label "Recent" |
| History count | `.history-count` | Accent badge style |
| History grid | `.history-grid` | Auto-fill grid, 140px min |
| Favorites header | `.favorites-header` | Flex, space-between |
| Favorites title | `.favorites-title` | Icon 14px yellow, uppercase |
| Favorites count | `.favorites-count` | Warning badge style |
| Favorites grid | `.favorites-grid` | Auto-fill grid, 140px min |
| Clear buttons | `.btn-text`, `.btn-text-danger` | Text-only buttons |

**Key rules:**
- History label is "Recent" (not "History")
- Favorites icon is star (not heart)
- Sections are stacked, not tabbed
- Header icons are 14px (not 16px)
- Favorites nested inside history-section

### Generate Button Component

| Element | Class | Notes |
|---------|-------|-------|
| Button | `.btn-generate` | Only this class, NOT `.btn .btn-primary` |
| Content wrapper | `.btn-content` | Contains icon + text |
| Icon | SVG inside `.btn-content` | Page-specific icon |
| Glow effect | `.btn-glow` | MUST be after `.btn-content` |
| Shortcut hint | `.shortcut-hint` | Below button, shows Ctrl+Enter |

**Key rules:**
- `.btn-content` wraps icon and text
- `.btn-glow` comes AFTER `.btn-content` (not before)
- Never use `.btn-loader` (deprecated)
- Never add `.btn .btn-primary` classes

### Advanced Options Component

| Element | Class/ID | Notes |
|---------|----------|-------|
| Container | `.advanced-section` `#advancedSection` | Collapsible section |
| Toggle | `.advanced-toggle` `#advancedToggle` | Button with slider icon |
| Icon | `.toggle-icon` | 3-slider mixer icon |
| Chevron | `.toggle-chevron` | Expands/collapses |
| Content | `.advanced-content` | Contains option groups |
| AI Model | `#aiModel` | Select dropdown |

**Key rules:**
- Uses 3-slider mixer icon (not gear)
- Placed BEFORE generate button
- Contains AI model select and variations

### API Settings Component

| Element | Class/ID | Notes |
|---------|----------|-------|
| Container | `.settings-section` `#settingsSection` | Collapsible section |
| Toggle | `.settings-toggle` `#settingsToggle` | Button with gear icon |
| Icon | Sun-ray gear | Simple rays, not complex teeth |
| Chevron | `.toggle-chevron` | Expands/collapses |
| Content | `.settings-content` | Contains API key group |
| Input row | `.api-key-input` | NOT `.api-input-row` |
| API input | `#apiKey` | Password type |
| Eye toggle | `#toggleApiKey` | Show/hide button |
| Save button | `#saveApiKey` | `.btn-secondary .btn-sm` |

**Key rules:**
- Uses sun-ray gear icon (simple)
- Placed AFTER generate button
- API input ID is `apiKey` (not `apiKeyInput`)

### Section Order (Bottom of Config Panel)

1. Advanced Options (`.advanced-section`)
2. Generate Button (`.btn-generate`)
3. API Settings (`.settings-section`)

### Modal
```html
<div class="modal">
    <div class="modal-backdrop"></div>
    <div class="modal-content">
        <div class="modal-header">
            <h3>Title</h3>
            <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">...</div>
        <div class="modal-footer">...</div>
    </div>
</div>
```

---

## Anti-Patterns (Avoid These)

1. **Generic AI aesthetics** - No gradients everywhere, no excessive glow
2. **Cramped layouts** - Always use proper spacing
3. **Inconsistent border radius** - Stick to the scale
4. **Mixed button styles** - Use established patterns
5. **Placeholder text as labels** - Use proper `<label>` elements
6. **Orphaned icons** - Icons should have text or tooltips
7. **Harsh color transitions** - Use subtle hover states
8. **Breaking the grid** - Align to the established layout
9. **Overusing accent color** - Reserve for primary actions
10. **Ignoring disabled states** - Always style `:disabled`

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

- Focus states: Always visible with accent color
- Color contrast: Text passes WCAG AA
- Keyboard navigation: All interactive elements focusable
- Touch targets: Minimum 36px for buttons
