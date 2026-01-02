# UI_PATTERNS.md

Reference file for consistent UI patterns across HEFAISTOS pages. **COPY THESE EXACTLY** when creating new pages.

---

## Table of Contents

1. [DOM ID Conventions](#dom-id-conventions)
2. [Page Boilerplate](#page-boilerplate)
3. [Marketing Page Boilerplate](#marketing-page-boilerplate)
4. [Panel Headers](#panel-headers)
5. [Section Labels](#section-labels)
6. [Scene Grid Buttons](#scene-grid-buttons)
7. [Option Buttons](#option-buttons)
8. [Toggle Switches](#toggle-switches)
9. [Auto-Mode Toggle](#auto-mode-toggle)
10. [Basic Settings Collapsible](#basic-settings-collapsible)
11. [Generate Button](#generate-button)
12. [API Settings Toggle](#api-settings-toggle)
13. [Advanced Options Toggle](#advanced-options-toggle)
14. [History & Favorites Sections](#history--favorites-sections)
15. [Bottom Panels Layout](#bottom-panels-layout)
16. [Lightbox](#lightbox)
17. [Modals](#modals)
18. [Upload Zone](#upload-zone)
19. [Empty States](#empty-states)
20. [Message Boxes](#message-boxes)
21. [Footer](#footer)
22. [JavaScript Element Caching Pattern](#javascript-element-caching-pattern)
23. [JavaScript Safety Patterns](#javascript-safety-patterns)
24. [Onboarding Tour](#onboarding-tour)
25. [Mobile Optimization](#mobile-optimization)
26. [Apple Design System Quick Reference](#apple-design-system-quick-reference)

---

## DOM ID Conventions

Standard DOM IDs ensure consistency across studios. Use these exact IDs for elements that interact with `StudioBootstrap` and shared utilities.

### Required IDs (all studios must have)

| ID | Element | Purpose |
|----|---------|---------|
| `generateBtn` | `<button>` | Main generate/create action |
| `resultContainer` | `<div>` | Wrapper for all result states |
| `resultPlaceholder` | `<div>` | Empty state before generation |
| `loadingContainer` | `<div>` | Loading state during generation |
| `resultDisplay` | `<div>` | Result display after generation |
| `errorMessage` | `<div>` | Error message display |
| `successMessage` | `<div>` | Success message display |
| `themeToggle` | `<button>` | Theme toggle button |
| `accountContainer` | `<div>` | Account menu mount point |

### Optional Standard IDs

| ID | Element | Purpose |
|----|---------|---------|
| `downloadBtn` | `<button>` | Download current result |
| `favoriteBtn` | `<button>` | Add to favorites |
| `historySection` | `<div>` | History panel |
| `historyGrid` | `<div>` | History items grid |
| `favoritesModal` | `<div>` | Favorites modal |
| `favoritesGrid` | `<div>` | Favorites items grid |
| `imageInfoBtn` | `<button>` | Toggle image info overlay |
| `imageInfoOverlay` | `<div>` | Image metadata display |
| `seedInput` | `<input>` | Seed control input |
| `presetSelectorContainer` | `<div>` | Preset selector mount point |
| `costEstimatorContainer` | `<div>` | Cost estimator mount point |

### Data Attributes for Event Delegation

Use data attributes for option buttons and dynamic content:

```html
<!-- Option buttons -->
<button data-option="variations" data-value="1" class="active">1</button>
<button data-option="variations" data-value="2">2</button>
<button data-option="variations" data-value="4">4</button>

<!-- Scene/Mood buttons -->
<button class="scene-btn active" data-scene="living-room">Living Room</button>
<button class="mood-btn" data-mood="cozy">Cozy</button>

<!-- History items -->
<div class="history-item" data-id="${item.id}">...</div>
```

### Class Naming Convention

| Class | Usage |
|-------|-------|
| `.scene-btn` | Scene selection buttons |
| `.mood-btn` | Mood selection buttons |
| `.time-btn` | Time of day buttons |
| `.option-btn` | Generic option buttons |
| `.history-item` | History grid items |
| `.favorite-item` | Favorites grid items |
| `.result-grid-item` | Multi-result grid items |

---

## Page Boilerplate

Every page starts with this structure:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Name - HEFAISTOS</title>
    <!-- CRITICAL: Inline theme script prevents flash of wrong theme -->
    <script>if(localStorage.getItem('ngraphics_theme')==='light')document.documentElement.setAttribute('data-theme','light')</script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="pagename.css">
</head>
<body>
    <!-- Header (pre-rendered to prevent flash, JS sets up theme toggle) -->
    <header class="site-header">
        <div class="header-content">
            <a href="index.html" class="logo-link">
                <div class="logo-group">
                    <div class="logo-mark">
                        <svg viewBox="0 0 40 40" fill="none">
                            <rect x="2" y="2" width="36" height="36" rx="4" stroke="currentColor" stroke-width="2"/>
                            <path d="M12 28V12h4l8 10V12h4v16h-4l-8-10v10h-4z" fill="currentColor"/>
                        </svg>
                    </div>
                    <div class="logo-text">
                        <span class="logo-title">HEFAISTOS</span>
                        <span class="logo-subtitle">Page Name Studio</span>
                    </div>
                </div>
            </a>
            <div class="header-controls">
                <a href="dashboard.html" class="docs-link" title="Dashboard">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="7" height="9" rx="1"/>
                        <rect x="14" y="3" width="7" height="5" rx="1"/>
                        <rect x="14" y="12" width="7" height="9" rx="1"/>
                        <rect x="3" y="16" width="7" height="5" rx="1"/>
                    </svg>
                    <span>Dashboard</span>
                </a>
                <button class="theme-toggle" id="themeToggle" title="Toggle light/dark mode">
                    <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                    </svg>
                    <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="5"/>
                        <line x1="12" y1="1" x2="12" y2="3"/>
                        <line x1="12" y1="21" x2="12" y2="23"/>
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                        <line x1="1" y1="12" x2="3" y2="12"/>
                        <line x1="21" y1="12" x2="23" y2="12"/>
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                    </svg>
                </button>
            </div>
        </div>
    </header>

    <!-- Main Application -->
    <main class="app-main">
        <div class="app-grid">
            <!-- Left Panel: Configuration -->
            <section class="panel panel-config">
                <!-- ... -->
            </section>

            <!-- Right Panel: Output -->
            <section class="panel panel-output">
                <!-- ... -->
            </section>
        </div>
    </main>

    <!-- Scripts (order matters) -->
    <script src="core.js"></script>
    <script src="shared.js"></script>
    <script src="api.js"></script>
    <script src="components.js"></script>
    <script src="workers.js"></script>
    <script src="pagename.js"></script>
</body>
</html>
```

**Note:** Headers are pre-rendered in HTML to prevent layout shift and logo flash. JavaScript only sets up the theme toggle:

```javascript
// In page JS initialization
SharedTheme.init();
SharedTheme.setupToggle(document.getElementById('themeToggle'));
```

For the **home page (index.html)**, omit the `<a href="index.html" class="logo-link">` wrapper around the logo group since you're already on the home page.

---

## Marketing Page Boilerplate

Marketing pages (Landing, Gallery, FAQ) have a different structure with SEO meta tags:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Title - HEFAISTOS</title>
    <!-- CRITICAL: Inline theme script prevents flash of wrong theme -->
    <script>if(localStorage.getItem('ngraphics_theme')==='light')document.documentElement.setAttribute('data-theme','light')</script>
    <meta name="description" content="Page description for search engines.">

    <!-- Open Graph -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://hefaistos.xyz/page.html">
    <meta property="og:title" content="Page Title - HEFAISTOS">
    <meta property="og:description" content="Page description for social sharing.">
    <meta property="og:image" content="https://hefaistos.xyz/assets/og-image.png">
    <meta property="og:site_name" content="HEFAISTOS">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Page Title - HEFAISTOS">
    <meta name="twitter:description" content="Page description for Twitter.">
    <meta name="twitter:image" content="https://hefaistos.xyz/assets/og-image.png">

    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,...">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="pagename.css">
</head>
<body>
    <!-- Header with navigation -->
    <header class="site-header">
        <div class="header-content">
            <div class="logo-group">
                <div class="logo-mark">...</div>
                <div class="logo-text">
                    <span class="logo-title">HEFAISTOS</span>
                </div>
            </div>
            <nav class="header-nav">
                <a href="gallery.html">Gallery</a>
                <a href="pricing.html">Pricing</a>
                <a href="docs.html">Docs</a>
                <a href="faq.html">FAQ</a>
            </nav>
            <div class="header-controls">
                <div id="accountContainer"></div>
                <button class="theme-toggle" id="themeToggle">...</button>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <main class="pagename-main">
        <!-- Page-specific content -->
    </main>

    <!-- Footer -->
    <footer class="pagename-footer">
        <!-- Multi-column footer for landing, simple footer for others -->
    </footer>

    <!-- Scripts -->
    <script src="config.js"></script>
    <script src="supabase.js"></script>
    <script src="auth-ui.js"></script>
    <script src="cloud-sync.js"></script>
    <script src="shared.js"></script>
    <script src="pagename.js"></script>
</body>
</html>
```

**Key differences from studio pages:**
- SEO meta tags (Open Graph, Twitter Cards)
- Navigation links in header (Gallery, Pricing, Docs, FAQ)
- No Dashboard link in header
- Simplified script loading (no core.js, api.js, etc.)
- Multi-column footer on landing, simple footer on others

---

## Panel Headers

Both left and right panels use numbered titles:

```html
<div class="panel-header">
    <h2 class="panel-title">
        <span class="title-number">01</span>
        Configure
    </h2>
</div>
```

```html
<div class="panel-header">
    <h2 class="panel-title">
        <span class="title-number">02</span>
        Output
    </h2>
</div>
```

---

## Section Labels

Section labels have an icon + text:

```html
<div class="section-label">
    <span class="label-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <!-- icon path -->
        </svg>
    </span>
    Section Title
</div>
```

**With hint:**
```html
<div class="section-label">
    <span class="label-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <path d="M21 15l-5-5L5 21"/>
        </svg>
    </span>
    Product Image
    <span class="label-hint">Reference image</span>
</div>
```

**Icon sizing in CSS:**
```css
.panel-config .section-label .label-icon {
    width: 16px;
    height: 16px;
    min-width: 16px;
}

.panel-config .section-label .label-icon svg {
    width: 16px;
    height: 16px;
}
```

---

## Scene Grid Buttons

For scene/setting selection with emoji icons:

```html
<div class="scene-grid">
    <button type="button" class="scene-btn active" data-scene="studio">
        <span class="scene-icon">📷</span>
        <span>Studio</span>
    </button>
    <button type="button" class="scene-btn" data-scene="urban">
        <span class="scene-icon">🏙️</span>
        <span>Urban</span>
    </button>
    <button type="button" class="scene-btn" data-scene="nature">
        <span class="scene-icon">🌿</span>
        <span>Nature</span>
    </button>
    <!-- more buttons... -->
</div>
```

**Critical CSS values:**
```css
.scene-btn .scene-icon {
    font-size: 1rem;      /* NOT 1.25rem - that's too big */
    line-height: 1;
}

.scene-btn span:last-child {
    font-size: 0.7rem;    /* NOT 0.65rem */
    font-weight: 600;
}
```

---

## Option Buttons

For button groups (variations, gender, etc.). Uses **pill-shaped buttons** with shadow depth.

```html
<div class="model-option">
    <label class="option-label">Variations</label>
    <div class="option-buttons" role="group" aria-label="Variations">
        <button type="button" class="option-btn active" data-option="variations" data-value="1">1</button>
        <button type="button" class="option-btn" data-option="variations" data-value="2">2</button>
        <button type="button" class="option-btn" data-option="variations" data-value="4">4</button>
    </div>
</div>
```

**Pill Button Styling (from styles.css):**
```css
.option-btn {
    padding: 8px 16px;
    border-radius: var(--radius-pill);  /* Pill shape */
    box-shadow: var(--shadow-xs);
    transition: all var(--duration-fast) var(--ease-out);
}
.option-btn.active {
    background: linear-gradient(135deg, var(--apple-blue), var(--apple-indigo));
    border-color: transparent;
    box-shadow: var(--shadow-primary);
}
```

**JavaScript handler pattern:**
```javascript
document.querySelectorAll('.option-btn[data-option="variations"]').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.option-btn[data-option="variations"]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.variations = parseInt(btn.dataset.value);
    });
});
```

---

## Toggle Switches

Use toggle switches (not checkboxes) for binary on/off preferences. The toggle pattern from `styles.css` provides a consistent Apple-style appearance.

### Required Structure

```html
<label class="toggle-label">
    <input type="checkbox" class="toggle-checkbox" id="someToggle" checked>
    <span class="toggle-switch"></span>
</label>
```

### Required Elements

| Element | Class | Required | Notes |
|---------|-------|----------|-------|
| Container | `.toggle-label` | ✅ | Wraps input and visual switch |
| Checkbox | `.toggle-checkbox` | ✅ | Hidden but accessible |
| Visual switch | `.toggle-switch` | ✅ | The visible toggle track |

### Styling (from styles.css)

The toggle uses Apple-style dimensions and colors:

```css
.toggle-label {
    position: relative;
    display: inline-block;
    cursor: pointer;
}

.toggle-checkbox {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
}

.toggle-switch {
    display: block;
    width: 44px;
    height: 24px;
    background: var(--bg-elevated);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-pill);
    transition: all var(--duration-fast) var(--ease-spring);
}

.toggle-switch::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 18px;
    height: 18px;
    background: white;
    border-radius: 50%;
    box-shadow: var(--shadow-sm);
    transition: transform var(--duration-fast) var(--ease-spring);
}

.toggle-checkbox:checked + .toggle-switch {
    background: var(--apple-green);
    border-color: var(--apple-green);
}

.toggle-checkbox:checked + .toggle-switch::after {
    transform: translateX(20px);
}
```

### JavaScript Pattern

```javascript
// Element caching
elements.someToggle = document.getElementById('someToggle');

// Load saved preference
state.somePreference = localStorage.getItem('studio_some_pref') !== 'false';
if (elements.someToggle) {
    elements.someToggle.checked = state.somePreference;
    elements.someToggle.addEventListener('change', (e) => {
        state.somePreference = e.target.checked;
        localStorage.setItem('studio_some_pref', state.somePreference);
    });
}
```

### WRONG Patterns (Do NOT use)

```html
<!-- WRONG: Native checkbox without toggle styling -->
<input type="checkbox" id="someOption">

<!-- WRONG: Custom toggle without proper structure -->
<div class="toggle" onclick="toggle()">
    <div class="toggle-knob"></div>
</div>

<!-- WRONG: Missing toggle-switch span -->
<label class="toggle-label">
    <input type="checkbox" class="toggle-checkbox">
</label>
```

---

## Auto-Mode Toggle

For "auto-generate on upload" and similar auto-action preferences. Placed near the upload area to indicate immediate behavior.

### Full Structure (Recommended)

The enhanced pattern includes an icon and hint text for better UX:

```html
<div class="auto-mode-row">
    <div class="auto-mode-info">
        <div class="auto-mode-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
        </div>
        <div class="auto-mode-text">
            <span class="auto-mode-label">Auto-generate on upload</span>
            <span class="auto-mode-hint">Instantly create when image is added</span>
        </div>
    </div>
    <label class="toggle-label">
        <input type="checkbox" class="toggle-checkbox" id="autoModeToggle" checked>
        <span class="toggle-switch"></span>
    </label>
</div>
```

### Compact Structure (Legacy)

For tighter layouts, use the compact variant:

```html
<div class="auto-mode-row compact">
    <span class="auto-mode-label">Auto-generate on upload</span>
    <label class="toggle-label">
        <input type="checkbox" class="toggle-checkbox" id="autoModeToggle" checked>
        <span class="toggle-switch"></span>
    </label>
</div>
```

### Required Elements

| Element | Class | Required | Notes |
|---------|-------|----------|-------|
| Container | `.auto-mode-row` | Yes | Wraps everything |
| Info wrapper | `.auto-mode-info` | Recommended | Groups icon and text |
| Icon container | `.auto-mode-icon` | Recommended | 32x32 icon box |
| Text wrapper | `.auto-mode-text` | Recommended | Groups label and hint |
| Label | `.auto-mode-label` | Yes | Main toggle text |
| Hint | `.auto-mode-hint` | Recommended | Explains behavior |
| Toggle | `.toggle-label` | Yes | Standard toggle switch |

### CSS (in styles.css)

The auto-mode styles are included in `styles.css`:

```css
.auto-mode-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;
    padding: 14px 16px;
    background: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
}

.auto-mode-icon {
    width: 32px;
    height: 32px;
    background: var(--accent-subtle);
    border-radius: var(--radius-sm);
    color: var(--apple-blue);
}

.auto-mode-label {
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--text-primary);
}

.auto-mode-hint {
    font-size: 0.7rem;
    color: var(--text-muted);
}

/* Compact variant hides icon and hint */
.auto-mode-row.compact { padding: 10px 12px; }
.auto-mode-row.compact .auto-mode-icon,
.auto-mode-row.compact .auto-mode-hint { display: none; }
```

### JavaScript Pattern (Using SharedAutoMode)

Use the `SharedAutoMode` helper for standardized initialization:

```javascript
// State
const state = {
    autoMode: true,  // ON by default for 30-second experience
    // ...
};

// Initialize with SharedAutoMode (recommended)
SharedAutoMode.init({
    studioId: STUDIO_ID,
    toggleElement: elements.autoModeToggle,
    state: state,
    defaultOn: true  // Default to ON for quick experience
});

// In upload handler - chain generation if auto mode
async function onImageUpload(base64, file) {
    // ... setup preview ...

    if (state.autoMode) {
        showLoading();
        updateLoadingStatus('Analyzing product...');
        await analyzeProductImage();  // This chains to generation
    } else {
        await analyzeProductImage();  // Just analyze, don't generate
    }
}
```

### Manual JavaScript Pattern (Legacy)

If not using `SharedAutoMode`:

```javascript
// Load preference (default true)
state.autoMode = localStorage.getItem(`${STUDIO_ID}_auto_mode`) !== 'false';
if (elements.autoModeToggle) {
    elements.autoModeToggle.checked = state.autoMode;
    elements.autoModeToggle.addEventListener('change', (e) => {
        state.autoMode = e.target.checked;
        localStorage.setItem(`${STUDIO_ID}_auto_mode`, state.autoMode);
    });
}
```

### Storage Key Convention

Always use the pattern `{studioId}_auto_mode`:
- `models_auto_mode`
- `lifestyle_auto_mode`
- `infographics_auto_mode`

### Behavior

| Auto Mode | Behavior |
|-----------|----------|
| ON | Upload → Analyze → Auto-generate → Result |
| OFF | Upload → Analyze → Wait for Generate click |

---

## Basic Settings Collapsible

Hides basic options (Scene, Mood, Time, etc.) behind a collapsible section. Uses the same pattern as Advanced Options but collapsed by default for a cleaner initial experience.

### Required Structure

```html
<div class="advanced-section" id="basicSection">
    <button type="button" class="advanced-toggle" id="basicToggle" aria-expanded="false" aria-controls="basicContent">
        <svg class="toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
        <span>Basic Settings</span>
        <svg class="toggle-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"/>
        </svg>
    </button>
    <div class="advanced-content" id="basicContent">
        <!-- Scene, Mood, Time options inside -->
    </div>
</div>
```

### Icon Options

Use the **sun-ray settings icon** for Basic Settings (same as API Settings):

```html
<svg class="toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
</svg>
```

### JavaScript Pattern

```javascript
// Element caching
elements.basicSection = document.getElementById('basicSection');
elements.basicToggle = document.getElementById('basicToggle');

// Toggle handler (same pattern as advanced)
if (elements.basicToggle) {
    elements.basicToggle.addEventListener('click', () => {
        const isOpen = elements.basicSection?.classList.toggle('open');
        elements.basicToggle.setAttribute('aria-expanded', isOpen);
    });
}
```

### Key Differences from Advanced Options

| Aspect | Basic Settings | Advanced Options |
|--------|---------------|------------------|
| Default state | Collapsed | Collapsed |
| Icon | Sun-ray gear | 3-slider mixer |
| Contents | Scene, Mood, Time | AI Model, Seed, Variations |
| Purpose | Reduce initial options | Power user controls |

---

## Generate Button

The generate button **MUST** follow this exact structure for consistent styling.

### Required Structure

```html
<button type="submit" class="btn-generate" id="generateBtn">
    <span class="btn-content">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <!-- Page-specific icon -->
        </svg>
        Generate [Page Name]
    </span>
    <span class="btn-glow"></span>
</button>
<div class="shortcut-hint">
    <kbd>Ctrl</kbd><span>+</span><kbd>Enter</kbd>
</div>
```

### Required Elements

| Element | Class | Required | Notes |
|---------|-------|----------|-------|
| Button | `.btn-generate` | ✅ | Only this class, NOT `.btn .btn-primary` |
| Content wrapper | `.btn-content` | ✅ | Wraps icon and text |
| Icon | SVG inside `.btn-content` | ✅ | Page-specific, before text |
| Text | Plain text | ✅ | "Generate [Page Name]" |
| Glow effect | `.btn-glow` | ✅ | Keep for compatibility (hidden by CSS) |
| Shortcut hint | `.shortcut-hint` | ✅ | Below button |

### Apple-inspired Button Styling

The generate button uses an **animated rainbow gradient** with Apple colors:
- **Background**: `linear-gradient(135deg, blue → indigo → purple → pink → blue)`
- **Animation**: `gradientShift 8s ease infinite` - slowly cycles through colors
- **Hover**: `filter: brightness(1.1)` with subtle shadow
- **Active**: `filter: brightness(0.95)` with slight scale
- **`.btn-glow`**: Hidden via CSS but kept for compatibility

### Icon by Page

| Page | Icon | Path |
|------|------|------|
| Infographics | Lightning bolt | `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>` |
| Model Studio | Person | `<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>` |
| Bundle Studio | Four squares | `<rect x="3" y="3" width="7" height="7"/>...` |
| Lifestyle | House | `<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>` |
| Background | Grid | `<rect x="3" y="3" width="18" height="18"/>...` |
| Packaging | Box 3D | `<path d="M21 16V8a2 2 0 00-1-1.73l-7-4..."/>` |

### WRONG Patterns (Do NOT use)

```html
<!-- WRONG: Using .btn .btn-primary classes -->
<button class="btn btn-primary btn-generate">

<!-- WRONG: btn-glow BEFORE btn-content -->
<button class="btn-generate">
    <span class="btn-glow"></span>
    <svg>...</svg>
    Generate
</button>

<!-- WRONG: No btn-content wrapper -->
<button class="btn-generate">
    <svg>...</svg>
    Generate
    <span class="btn-glow"></span>
</button>

<!-- WRONG: btn-loader instead of btn-glow -->
<span class="btn-loader"></span>

<!-- WRONG: btn-icon class on SVG -->
<svg class="btn-icon">...</svg>
```

---

## Advanced Options Toggle

Collapsible section for advanced generation settings. Uses slider/mixer icon. **Placed BEFORE the Generate button.**

### Required Structure

```html
<div class="advanced-section" id="advancedSection">
    <button type="button" class="advanced-toggle" id="advancedToggle">
        <svg class="toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="4" y1="21" x2="4" y2="14"/>
            <line x1="4" y1="10" x2="4" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12" y2="3"/>
            <line x1="20" y1="21" x2="20" y2="16"/>
            <line x1="20" y1="12" x2="20" y2="3"/>
            <circle cx="4" cy="12" r="2"/>
            <circle cx="12" cy="10" r="2"/>
            <circle cx="20" cy="14" r="2"/>
        </svg>
        <span>Advanced Options</span>
        <svg class="toggle-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"/>
        </svg>
    </button>
    <div class="advanced-content">
        <!-- AI Model Selection -->
        <div class="option-group">
            <label class="option-label">AI Model</label>
            <select class="select-field select-sm" id="aiModel">
                <option value="google/gemini-3-pro-image-preview" selected>Gemini 3 Pro (Best)</option>
                <option value="google/gemini-2.0-flash-exp:free">Gemini 2.0 Flash (Free)</option>
            </select>
        </div>

        <!-- Variations -->
        <div class="option-group">
            <label class="option-label">Variations</label>
            <div class="option-buttons" id="variationsOptions" role="group" aria-label="Variations">
                <button type="button" class="option-btn active" data-value="1">1</button>
                <button type="button" class="option-btn" data-value="2">2</button>
                <button type="button" class="option-btn" data-value="4">4</button>
            </div>
        </div>

        <!-- Seed -->
        <div class="option-group">
            <label class="option-label">Seed (optional)</label>
            <div class="seed-row">
                <input type="number" class="input-field input-sm" id="seedInput" placeholder="Random">
                <button type="button" class="btn-icon" id="randomSeed" title="Randomize">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="1 4 1 10 7 10"/>
                        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                    </svg>
                </button>
            </div>
        </div>

        <!-- Negative Prompt -->
        <div class="option-group">
            <label class="option-label">Negative Prompt</label>
            <textarea class="textarea-field textarea-sm" id="negativePrompt"
                placeholder="Elements to avoid..." rows="2"></textarea>
        </div>
    </div>
</div>
```

### Required Elements

| Element | Class/ID | Required | Notes |
|---------|----------|----------|-------|
| Container | `.advanced-section` `#advancedSection` | ✅ | Wraps toggle and content |
| Toggle button | `.advanced-toggle` `#advancedToggle` | ✅ | Collapsible trigger |
| Slider icon | `.toggle-icon` SVG | ✅ | 3-slider mixer icon |
| Label | `<span>Advanced Options</span>` | ✅ | Text label |
| Chevron | `.toggle-chevron` | ✅ | Down arrow, rotates when open |
| Content | `.advanced-content` | ✅ | Collapsed by default |
| Option groups | `.option-group` | ✅ | Each contains label and control |
| AI Model | `#aiModel` | ✅ | Select dropdown |
| Variations | `#variationsOptions` | Optional | Button group |
| Seed | `#seedInput` | Optional | Number input with randomize button |
| Negative prompt | `#negativePrompt` | Optional | Textarea |

### Slider Icon (3-slider mixer)

```html
<svg class="toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <line x1="4" y1="21" x2="4" y2="14"/>
    <line x1="4" y1="10" x2="4" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="12"/>
    <line x1="12" y1="8" x2="12" y2="3"/>
    <line x1="20" y1="21" x2="20" y2="16"/>
    <line x1="20" y1="12" x2="20" y2="3"/>
    <circle cx="4" cy="12" r="2"/>
    <circle cx="12" cy="10" r="2"/>
    <circle cx="20" cy="14" r="2"/>
</svg>
```

### Section Order (Bottom of Config Panel)

The correct order for sections at the bottom of the config panel:

1. **Advanced Options** (`.advanced-section`)
2. **Generate Button** (`.btn-generate`)
3. **API Settings** (`.settings-section`)

```html
<!-- 1. Advanced Options -->
<div class="advanced-section" id="advancedSection">...</div>

<!-- 2. Generate Button -->
<button type="submit" class="btn-generate" id="generateBtn">...</button>
<div class="shortcut-hint">...</div>

<!-- 3. API Settings -->
<div class="settings-section" id="settingsSection">...</div>
```

---

## History & Favorites Sections

History and Favorites sections **MUST** follow this exact pattern for consistency. These sections are stacked (not tabbed) and nested.

### Required Elements

| Element | Class | Required | Notes |
|---------|-------|----------|-------|
| History container | `.history-section` | ✅ | Wraps everything |
| History header | `.history-header` | ✅ | Contains title and clear button |
| History icon | Clock SVG inside `h3` | ✅ | 14px size |
| History label | "Recent" text | ✅ | Not "History" |
| History count | `.history-count` | ✅ | Shows item count |
| Clear button | `.btn-text` | ✅ | Text: "Clear" |
| History grid | `.history-grid` | ✅ | Contains items |
| Empty state | `.empty-state` | ✅ | Shown when empty |
| Favorites container | `.favorites-section` | ✅ | Nested inside history |
| Favorites header | `.favorites-header` | ✅ | Contains title group and clear button |
| Favorites title group | `.favorites-title-group` | ✅ | Wraps title and count |
| Favorites icon | Star SVG inside `.favorites-title` | ✅ | 14px size, yellow color |
| Favorites label | "Favorites" text | ✅ | — |
| Favorites count | `.favorites-count` | ✅ | Shows item count |
| Clear button | `.btn-text-danger` | ✅ | Text: "Clear All" |
| Favorites grid | `.favorites-grid` | ✅ | Contains items |
| Empty state | `.empty-state` | ✅ | Shown when empty |

### Icons

```html
<!-- History Icon (clock) -->
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
</svg>

<!-- Favorites Icon (star) - ALWAYS use star, not heart -->
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
</svg>
```

### History Section HTML

```html
<div class="history-section" id="historySection">
    <div class="history-header">
        <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
            </svg>
            Recent
            <span class="history-count" id="historyCount">0</span>
        </h3>
        <button type="button" class="btn-text" id="clearHistoryBtn">Clear</button>
    </div>
    <div class="history-grid" id="historyGrid"></div>
    <div class="empty-state" id="historyEmpty">
        <div class="empty-state-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="M21 15l-5-5L5 21"/>
            </svg>
        </div>
        <p class="empty-state-title">No images yet</p>
        <p class="empty-state-text">Generated images will appear here</p>
    </div>

    <!-- Favorites Section (MUST be nested inside history-section) -->
    <div class="favorites-section" id="favoritesSection">
        <!-- ... see below ... -->
    </div>
</div>
```

### Favorites Section HTML

```html
<div class="favorites-section" id="favoritesSection">
    <div class="favorites-header">
        <div class="favorites-title-group">
            <h3 class="favorites-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                Favorites
            </h3>
            <span class="favorites-count" id="favoritesCount">0</span>
        </div>
        <button type="button" class="btn-text-danger" id="clearFavoritesBtn">Clear All</button>
    </div>
    <div class="favorites-grid" id="favoritesGrid"></div>
    <div class="empty-state" id="favoritesEmpty">
        <div class="empty-state-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
        </div>
        <p class="empty-state-title">No favorites yet</p>
        <p class="empty-state-text">Click the star on generated images to save them</p>
    </div>
</div>
```

### Required CSS (page-specific)

Every page CSS file MUST include these icon size rules:

```css
/* History/Favorites Header Icons - MUST be 14px */
.history-header h3 svg,
.favorites-header h3 svg,
.favorites-title svg {
    width: 14px;
    height: 14px;
}
```

### WRONG Patterns (Do NOT use)

```html
<!-- WRONG: Tabs instead of stacked -->
<div class="history-tabs">
    <button class="history-tab active">History</button>
    <button class="history-tab">Favorites</button>
</div>

<!-- WRONG: Missing header structure -->
<div class="history-section">
    <div class="history-grid"></div>  <!-- No header! -->
</div>

<!-- WRONG: Using section-header-row instead of history-header -->
<div class="section-header-row">
    <h3 class="section-subtitle">History</h3>
</div>

<!-- WRONG: Using heart icon for favorites -->
<svg><!-- heart icon --></svg>

<!-- WRONG: Using "History" label instead of "Recent" -->
<h3>History</h3>

<!-- WRONG: Using icon button for clear instead of text -->
<button class="btn-icon-sm"><svg><!-- trash --></svg></button>
```

---

## Bottom Panels Layout

An alternative layout that places History and Favorites as separate panels below the main content area. Used when the right panel is fully dedicated to output/result display.

### When to Use

- When the right panel needs full width for result display
- When History and Favorites benefit from a wider, more prominent view
- When you want panels hidden until they have content

### Required Structure

```html
</main>  <!-- End of main content -->

<!-- Bottom Panels (outside main, hidden by default) -->
<section class="bottom-panels-section">
    <div class="bottom-panels-grid">
        <!-- History Panel -->
        <div class="bottom-panel" id="historySection" style="display: none;">
            <div class="history-header">
                <h3>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    Recent
                    <span class="history-count" id="historyCount">0</span>
                </h3>
                <button type="button" class="btn-text" id="clearHistoryBtn">Clear</button>
            </div>
            <div class="history-grid" id="historyGrid"></div>
        </div>

        <!-- Favorites Panel -->
        <div class="bottom-panel" id="favoritesSection" style="display: none;">
            <div class="favorites-header">
                <div class="favorites-title-group">
                    <h3 class="favorites-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        Favorites
                    </h3>
                    <span class="favorites-count" id="favoritesCount">0</span>
                </div>
                <button type="button" class="btn-text-danger" id="clearFavoritesBtn">Clear All</button>
            </div>
            <div class="favorites-grid" id="favoritesGrid"></div>
        </div>
    </div>
</section>
```

### Required CSS

```css
/* Bottom Panels Section */
.bottom-panels-section {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--space-8) var(--space-8);
}

.bottom-panels-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
}

.bottom-panel {
    background: var(--bg-base);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-lg);
    padding: 20px;
}

/* Mobile: Stack vertically */
@media (max-width: 768px) {
    .bottom-panels-grid {
        grid-template-columns: 1fr;
    }
}
```

### JavaScript Pattern

Show/hide panels based on content:

```javascript
function renderHistory() {
    const items = history.getAll();

    // Show/hide entire panel based on content
    if (elements.historySection) {
        elements.historySection.style.display = items.length === 0 ? 'none' : 'block';
    }

    if (elements.historyCount) {
        elements.historyCount.textContent = items.length;
    }

    if (elements.historyGrid) {
        elements.historyGrid.innerHTML = items.map(item => `
            <div class="history-item" data-id="${item.id}">
                <img src="${item.thumbnail}" alt="" loading="lazy">
            </div>
        `).join('');
    }
}

function renderFavorites() {
    const items = favorites.getAll();

    // Show/hide entire panel based on content
    if (elements.favoritesSection) {
        elements.favoritesSection.style.display = items.length === 0 ? 'none' : 'block';
    }

    if (elements.favoritesCount) {
        elements.favoritesCount.textContent = items.length;
    }

    // ... render grid ...
}
```

### Key Differences from Nested Layout

| Aspect | Nested Layout | Bottom Panels Layout |
|--------|--------------|---------------------|
| Location | Inside right panel | Below main content |
| Width | Panel width (~60%) | Full page width (1200px) |
| Visibility | Always visible | Hidden when empty |
| Structure | Favorites inside History | Two separate panels |
| Use case | Compact, always visible | Prominent, content-first |

---

## Lightbox

```html
<div class="lightbox" id="lightbox">
    <button class="lightbox-close" id="lightboxClose">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
    </button>
    <img id="lightboxImage" alt="Full size image">
    <button class="lightbox-download" id="lightboxDownload">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Download
    </button>
</div>
```

---

## Modals

**Favorites Modal:**

```html
<div class="modal favorites-modal" id="favoritesModal">
    <div class="modal-backdrop"></div>
    <div class="modal-content">
        <div class="modal-header">
            <h3 class="modal-title">Favorite</h3>
            <button class="modal-close" id="closeFavoritesModal">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        </div>
        <div class="modal-body">
            <div class="favorite-preview-container">
                <img src="" alt="Favorite preview" id="favoritePreviewImg">
                <div class="favorite-variants" id="favoriteVariants" style="display: none;"></div>
            </div>
            <div class="favorite-details">
                <div class="favorite-name-row">
                    <input type="text" class="favorite-name-input" id="favoriteNameInput" placeholder="Favorite name...">
                </div>
                <div class="favorite-meta">
                    <div class="favorite-meta-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12,6 12,12 16,14"/>
                        </svg>
                        <span id="favoriteDate"></span>
                    </div>
                    <div class="favorite-meta-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                        </svg>
                        <span>Seed:</span>
                        <code class="favorite-seed-value" id="favoriteSeedValue"></code>
                        <button class="btn-copy-seed" id="copyFavoriteSeed">Copy</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="modal-actions">
            <button class="btn btn-load" id="loadFavoriteBtn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                    <polyline points="17,8 12,3 7,8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                Load Settings
            </button>
            <button class="btn btn-secondary" id="downloadFavoriteBtn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                    <polyline points="7,10 12,15 17,10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download
            </button>
            <button class="btn btn-danger" id="deleteFavoriteBtn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3,6 5,6 21,6"/>
                    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                </svg>
            </button>
        </div>
    </div>
</div>
```

---

## Upload Zone

```html
<div class="upload-zone" id="uploadArea">
    <div class="upload-content">
        <div class="upload-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="17,8 12,3 7,8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
        </div>
        <p class="upload-text">Drop image or click to upload</p>
        <p class="upload-formats">PNG, JPG, WebP • Max 10MB</p>
    </div>
    <input type="file" class="upload-input" id="productPhoto" accept="image/png,image/jpeg,image/jpg,image/webp">
</div>
<div class="image-preview" id="imagePreview" style="display: none;">
    <img id="previewImg" alt="Preview" class="preview-img">
    <button type="button" class="preview-remove" id="removeImage">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
    </button>
</div>
```

---

## Empty States

```html
<div class="empty-state" id="historyEmpty">
    <div class="empty-state-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <!-- contextual icon -->
        </svg>
    </div>
    <p class="empty-state-title">No images yet</p>
    <p class="empty-state-text">Generated photos will appear here</p>
</div>
```

---

## Message Boxes

```html
<!-- Error Message -->
<div class="message message-error" id="errorMessage">
    <div class="message-icon">!</div>
    <div class="message-content">
        <span class="error-text"></span>
    </div>
</div>

<!-- Success Message -->
<div class="message message-success" id="successMessage">
    <div class="message-icon">✓</div>
    <div class="message-content">Generated successfully</div>
</div>
```

---

## Common Icons Reference

| Purpose | Icon |
|---------|------|
| Clock/History | `<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>` |
| Star/Favorite | `<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>` |
| Download | `<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>` |
| Upload | `<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/>` |
| Close/X | `<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>` |
| Settings (sun-ray) | `<circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>` |
| Sliders/Advanced | `<line x1="4" y1="21" x2="4" y2="14"/>...<circle cx="4" cy="12" r="2"/>...` |
| Chevron Down | `<polyline points="6 9 12 15 18 9"/>` |
| Image | `<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>` |

---

## JavaScript Element Caching Pattern

Always cache DOM elements in an `elements` object:

```javascript
const elements = {};

function initElements() {
    // History
    elements.historySection = document.getElementById('historySection');
    elements.historyGrid = document.getElementById('historyGrid');
    elements.historyCount = document.getElementById('historyCount');
    elements.historyEmpty = document.getElementById('historyEmpty');
    elements.clearHistoryBtn = document.getElementById('clearHistoryBtn');

    // Favorites
    elements.favoritesSection = document.getElementById('favoritesSection');
    elements.favoritesGrid = document.getElementById('favoritesGrid');
    elements.favoritesCount = document.getElementById('favoritesCount');
    elements.favoritesEmpty = document.getElementById('favoritesEmpty');
    elements.clearFavoritesBtn = document.getElementById('clearFavoritesBtn');

    // ... etc
}
```

---

## JavaScript Safety Patterns

### Null-Safe Element Access

When accessing cached elements, use null checks to prevent `TypeError: Cannot read properties of undefined`:

```javascript
// WRONG: Direct access without null check
function updateApiStatus() {
    elements.apiStatus.classList.add('connected');  // Crashes if apiStatus doesn't exist!
}

// RIGHT: Use optional chaining
function updateApiStatus() {
    elements.apiStatus?.classList.add('connected');
}

// RIGHT: Use guard clause
function updateApiStatus() {
    if (!elements.apiStatus) return;
    elements.apiStatus.classList.add('connected');
}

// RIGHT: Use SharedUI utility (has built-in null safety)
SharedUI.updateApiStatus(elements.apiStatus, true);
```

### SharedUI Utilities with Null Safety

These SharedUI methods have built-in null checks and are safe to call with undefined elements:

```javascript
// Safe - returns early if element is null
SharedUI.updateApiStatus(elements.apiStatus, true);
SharedUI.showError('Error message');
SharedUI.showSuccess('Success message');
SharedUI.showLoading(elements.container);
SharedUI.hideLoading(elements.container);
```

### Common Pitfalls

| Pattern | Risk | Solution |
|---------|------|----------|
| `elements.foo.classList.add()` | Crash if `foo` undefined | Use `elements.foo?.classList.add()` |
| `elements.foo.value.trim()` | Crash if `foo` undefined | Use `elements.foo?.value?.trim()` |
| `elements.foo.querySelector()` | Crash if `foo` undefined | Use `elements.foo?.querySelector()` |
| Custom `updateApiStatus()` | Element may not exist in HTML | Use SharedUI or add null check |

### Element Existence Verification

Before using an element in event handlers, verify it exists:

```javascript
// WRONG: Assumes element always exists
elements.saveApiKey.onclick = () => { ... };

// RIGHT: Check before attaching
if (elements.saveApiKey) {
    elements.saveApiKey.onclick = () => { ... };
}
```

---

## Checklist for New Pages

Before finishing a new page, verify:

**Head Section:**
- [ ] Inline theme script immediately after `</title>` tag (prevents flash of wrong theme)
- [ ] Script: `<script>if(localStorage.getItem('ngraphics_theme')==='light')document.documentElement.setAttribute('data-theme','light')</script>`

**Header:**
- [ ] Header is pre-rendered in HTML (NOT empty for JS to populate)
- [ ] Contains full logo SVG, title, subtitle
- [ ] Has `<a href="index.html" class="logo-link">` wrapper (except on index.html)
- [ ] Dashboard link in header controls
- [ ] Theme toggle button with `#themeToggle` ID
- [ ] JS only calls `SharedTheme.init()` and `SharedTheme.setupToggle()` (NOT `SharedHeader.render()`)

**Generate Button:**
- [ ] Uses `.btn-generate` class only (NOT `.btn .btn-primary`)
- [ ] Has `.btn-content` wrapper containing SVG icon + text
- [ ] Has `.btn-glow` span AFTER `.btn-content` (hidden by CSS, kept for compatibility)
- [ ] Has `.shortcut-hint` below button with Ctrl+Enter

**Advanced Options:**
- [ ] Uses `.advanced-section` with `.advanced-toggle` button
- [ ] Uses 3-slider mixer icon (`.toggle-icon`)
- [ ] Has `.toggle-chevron` for expand indicator
- [ ] Placed BEFORE generate button

**History/Favorites:**
- [ ] History and Favorites are stacked (not tabbed)
- [ ] History/Favorites header icons are `14px` (not 16px)
- [ ] History uses `.history-header` with clock icon and "Recent" label
- [ ] Favorites uses `.favorites-header` with star icon (not heart)
- [ ] Favorites nested inside `.history-section`
- [ ] Both use `.empty-state` pattern for empty state
- [ ] History uses `.btn-text` "Clear", Favorites uses `.btn-text-danger` "Clear All"

**Apple Design Guidelines:**
- [ ] Uses Inter font (NOT Outfit)
- [ ] No noise overlay or ambient orb elements
- [ ] Generate button uses animated gradient (blue → indigo → purple → pink)
- [ ] Active states use `var(--gradient-primary)` gradient
- [ ] Hover uses `filter: brightness()` (no `translateY`)
- [ ] Letter-spacing is `0` or negative (no wide tracking)
- [ ] Font weights are 500-600 (not 700-800)
- [ ] Label icons use muted colors (not accent)
- [ ] Option buttons use pill shape (`--radius-pill`)
- [ ] Toggle switches are 44x24px with Apple green when on
- [ ] Inputs have inner shadow and double ring focus
- [ ] Shadows are soft (low opacity, multi-layer)
- [ ] Modal uses spring animation with scale + translate

**Auto-Mode & Progressive Disclosure:**
- [ ] Auto-mode toggle uses `.toggle-label` + `.toggle-checkbox` + `.toggle-switch` pattern
- [ ] Auto-mode is ON by default for 30-second experience
- [ ] Auto-mode preference persists to localStorage
- [ ] Basic Settings uses collapsible section (collapsed by default)
- [ ] If using Bottom Panels layout, panels are hidden when empty

**JavaScript:**
- [ ] Element access uses null checks or optional chaining (`?.`)
- [ ] Custom utility functions have null guards (e.g., `if (!element) return;`)
- [ ] Event handlers check element existence before attaching
- [ ] Use `SharedUI.updateApiStatus()` instead of custom implementations

**Other:**
- [ ] Scene icons are `1rem` (not larger)
- [ ] Scene labels are `0.7rem`
- [ ] All element IDs match JavaScript references
- [ ] Count badges present on History and Favorites headers
- [ ] Empty states have icon, title, and text
- [ ] Lightbox structure matches other pages
- [ ] Scripts loaded in correct order
- [ ] Footer present with keyboard shortcut hint
- [ ] Favorites modal implemented (if page has favorites)

---

## Footer

All pages include a consistent footer:

```html
<!-- Footer -->
<footer class="site-footer">
    <div class="footer-content">
        <span>HEFAISTOS</span>
        <span class="footer-divider">•</span>
        <span>Powered by OpenRouter AI</span>
        <span class="footer-divider">•</span>
        <span class="footer-shortcut"><kbd>Ctrl</kbd>+<kbd>D</kbd> Download</span>
    </div>
</footer>
```

Place the footer after all scripts, before `</body>`.

---

## Apple Design System Quick Reference

### Apple Color Palette
| Variable | Value | Usage |
|---------|----------|-------|
| `--apple-blue` | `#007AFF` | Primary accent |
| `--apple-indigo` | `#5856D6` | Gradients, secondary |
| `--apple-purple` | `#AF52DE` | Gradients |
| `--apple-pink` | `#FF2D55` | Highlights |
| `--apple-red` | `#FF3B30` | Errors |
| `--apple-orange` | `#FF9500` | Warnings |
| `--apple-yellow` | `#FFCC00` | Favorites |
| `--apple-green` | `#34C759` | Success, toggles |
| `--apple-teal` | `#5AC8FA` | Info |

### Gradient Presets
| Variable | Colors | Usage |
|----------|--------|-------|
| `--gradient-primary` | blue → indigo | Active states, checkboxes |
| `--gradient-primary-hover` | indigo → purple | Hover states |
| Generate button | blue → indigo → purple → pink | Animated CTA |

### Colors (Dark Mode)
| Purpose | Variable | Value |
|---------|----------|-------|
| Page background | `--bg-deep` | `#09090b` |
| Panel background | `--bg-base` | `#18181b` |
| Elevated surface | `--bg-elevated` | `#1c1c1f` |
| Input/button bg | `--bg-surface` | `#28282c` |
| Hover state | `--bg-hover` | `#35353a` |

### Typography Scale
| Variable | Value | Usage |
|----------|-------|-------|
| `--font-size-xs` | `0.6875rem` (11px) | Tiny labels |
| `--font-size-sm` | `0.75rem` (12px) | Small labels |
| `--font-size-base` | `0.8125rem` (13px) | Body text |
| `--font-size-md` | `0.875rem` (14px) | Inputs |
| `--font-size-lg` | `0.9375rem` (15px) | Section titles |
| `--font-size-xl` | `1.0625rem` (17px) | Panel titles |

### Font Weights
| Variable | Value | Usage |
|----------|-------|-------|
| `--font-weight-normal` | `400` | Body text |
| `--font-weight-medium` | `500` | Labels, buttons |
| `--font-weight-semibold` | `600` | Titles |

### 8px Spacing Grid
| Variable | Value | Usage |
|----------|-------|-------|
| `--space-1` | `4px` | Tight |
| `--space-2` | `8px` | Compact |
| `--space-3` | `12px` | Default |
| `--space-4` | `16px` | Comfortable |
| `--space-6` | `24px` | Panel padding |
| `--space-8` | `32px` | Page margins |
| `--space-10` | `40px` | Panel gaps |

### Border Radius
| Variable | Value | Usage |
|----------|-------|-------|
| `--radius-xs` | `4px` | Checkboxes |
| `--radius-sm` | `6px` | Inputs |
| `--radius-md` | `10px` | Cards |
| `--radius-lg` | `14px` | Panels |
| `--radius-pill` | `9999px` | Pill buttons, toggles |

### Shadows (Soft)
```css
--shadow-xs: 0 1px 2px rgba(0,0,0,0.04);
--shadow-sm: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
--shadow-md: 0 4px 6px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04);
--shadow-lg: 0 10px 20px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.04);
--shadow-primary: 0 4px 14px rgba(0,122,255,0.25);  /* Active accent buttons */
```

### Glassmorphism
```css
--glass-bg: rgba(28, 28, 30, 0.72);
--glass-blur: saturate(180%) blur(20px);
--glass-border: rgba(255, 255, 255, 0.08);
```

### Animations
- **Easing**: `--ease-out: cubic-bezier(0.25, 0.1, 0.25, 1)` (smooth)
- **Spring**: `--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1)` (with overshoot, for toggles)
- **Duration**: `0.15s` (fast), `0.25s` (normal), `0.4s` (slow/modals)
- **Hover**: Use `filter: brightness(1.1)` instead of `translateY`
- **Active**: Use `transform: scale(0.99)` for press feedback
- **Gradient animation**: `gradientShift 8s ease infinite` for generate button
- **Modal**: `animation: modal-enter 0.4s var(--ease-spring)` with scale + translate

### Toggle Switches (Premium)
```css
.toggle-switch {
    width: 44px;
    height: 24px;
    border-radius: var(--radius-pill);
}
.toggle-switch::after {
    width: 18px;
    height: 18px;
    transition: transform var(--duration-normal) var(--ease-spring);
}
.toggle-checkbox:checked + .toggle-switch {
    background: var(--apple-green);  /* Apple green when on */
}
```

### Input Fields (Refined)
```css
.input-field {
    padding: 11px 14px;
    border-radius: var(--radius-sm);
    box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);  /* Inner shadow */
}
.input-field:focus {
    box-shadow: 0 0 0 3px var(--accent-subtle), 0 0 0 1px var(--apple-blue);  /* Double ring */
}
```

### Section Dividers (Fade-Edge)
```css
.config-section::after {
    background: linear-gradient(90deg,
        transparent 0%, var(--border-subtle) 20%,
        var(--border-subtle) 80%, transparent 100%
    );
}
```

### Layout
- **Max-width**: `1280px` (narrower for focus)
- **Grid gap**: `var(--space-10)` (40px between panels)

### Anti-Patterns (Avoid)
1. Glow/neon effects (use soft shadows)
2. Wide letter-spacing (keep 0 or negative)
3. Font weights above 600
4. Noise overlays
5. Ambient orbs/blurs
6. `translateY` hover effects (use brightness)
7. Solid colors on primary CTAs (use gradients)
8. Hard shadow edges (use multi-layer soft shadows)

---

## Beautiful Gradients, Animations & Decorations

### Gradient Patterns

**Animated Rainbow CTA**
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

**Active State Gradient**
```css
.option-btn.active,
.toggle-checkbox:checked + .toggle-switch {
    background: linear-gradient(135deg, var(--apple-blue), var(--apple-indigo));
}
```

**Subtle Mesh Background**
```css
.panel {
    background:
        radial-gradient(at 40% 20%, rgba(0, 122, 255, 0.06) 0px, transparent 50%),
        radial-gradient(at 80% 0%, rgba(175, 82, 222, 0.04) 0px, transparent 50%),
        var(--bg-base);
}
```

**Glass Effect**
```css
.modal-content {
    background: rgba(28, 28, 30, 0.85);
    backdrop-filter: saturate(180%) blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.08);
}
```

**Gradient Border**
```css
.featured-card {
    border: 1px solid transparent;
    background:
        linear-gradient(var(--bg-base), var(--bg-base)) padding-box,
        linear-gradient(135deg, var(--apple-blue), var(--apple-purple)) border-box;
}
```

### Animation Patterns

**Modal Entrance**
```css
@keyframes modal-enter {
    from {
        opacity: 0;
        transform: scale(0.95) translateY(10px);
    }
    to {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}
.modal-content { animation: modal-enter 0.4s var(--ease-spring); }
```

**Slide Up Items**
```css
@keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

.history-item { animation: slideUp 0.3s var(--ease-out); }
```

**Shimmer Loading**
```css
@keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}

.skeleton {
    background: linear-gradient(
        90deg,
        var(--bg-surface) 0%,
        var(--bg-hover) 50%,
        var(--bg-surface) 100%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s ease-in-out infinite;
}
```

**Pulse Glow**
```css
@keyframes pulseGlow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(0, 122, 255, 0.4); }
    50% { box-shadow: 0 0 0 8px rgba(0, 122, 255, 0); }
}

.generating { animation: pulseGlow 2s ease-in-out infinite; }
```

**Spinner**
```css
@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

.loading-spinner { animation: spin 1s linear infinite; }
```

**Stagger Children**
```css
.grid-items > * {
    opacity: 0;
    animation: slideUp 0.3s var(--ease-out) forwards;
}
.grid-items > *:nth-child(1) { animation-delay: 0.05s; }
.grid-items > *:nth-child(2) { animation-delay: 0.1s; }
.grid-items > *:nth-child(3) { animation-delay: 0.15s; }
```

### Decorative Elements

**Section Divider (Fade Edge)**
```css
.section::after {
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
```

**Accent Top Line**
```css
.panel::before {
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
.hero::after {
    content: '';
    position: absolute;
    top: -100px;
    right: -100px;
    width: 300px;
    height: 300px;
    background: radial-gradient(
        circle,
        rgba(0, 122, 255, 0.1) 0%,
        transparent 60%
    );
    pointer-events: none;
}
```

**Card Shine**
```css
.card::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 50%;
    background: linear-gradient(
        to bottom,
        rgba(255, 255, 255, 0.05),
        transparent
    );
    pointer-events: none;
}
```

**Dot Grid Background**
```css
.background-pattern {
    background-image: radial-gradient(
        circle,
        rgba(255, 255, 255, 0.04) 1px,
        transparent 1px
    );
    background-size: 24px 24px;
}
```

### Hover & Interactive States

**Button Hover (Brightness)**
```css
.btn:hover {
    filter: brightness(1.1);
    transition: filter 0.15s ease;
}

.btn:active {
    filter: brightness(0.95);
    transform: scale(0.99);
}
```

**Card Hover (Lift)**
```css
.card {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
}
```

**Focus Ring (Double Ring)**
```css
.input:focus {
    border-color: var(--apple-blue);
    box-shadow:
        0 0 0 3px var(--accent-subtle),
        0 0 0 1px var(--apple-blue);
    outline: none;
}
```

**Icon Hover Glow**
```css
.icon-btn:hover svg {
    filter: drop-shadow(0 0 4px var(--apple-blue));
}
```

### Complete Examples

**Premium History Item**
```css
.history-item {
    background: var(--bg-surface);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    overflow: hidden;
    transition: all 0.2s ease;
    animation: slideUp 0.3s ease-out;
}

.history-item:hover {
    border-color: var(--border-strong);
    box-shadow: var(--shadow-md);
    transform: translateY(-1px);
}

.history-item img {
    transition: transform 0.3s ease;
}

.history-item:hover img {
    transform: scale(1.02);
}
```

**Glowing Upload Zone**
```css
.upload-zone {
    border: 2px dashed var(--border-default);
    border-radius: var(--radius-lg);
    transition: all 0.2s ease;
}

.upload-zone:hover,
.upload-zone.dragover {
    border-color: var(--apple-blue);
    background: rgba(0, 122, 255, 0.05);
    box-shadow: 0 0 20px rgba(0, 122, 255, 0.1);
}
```

**Animated Status Badge**
```css
.status-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: var(--radius-pill);
    background: var(--bg-surface);
    font-size: 0.75rem;
}

.status-badge.connected::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--apple-green);
    animation: pulseGlow 2s ease infinite;
}
```

---

## Onboarding Tour

First-time user guidance with spotlight highlighting. Implemented in `onboarding.js`.

### Tour Types

| Tour | Trigger | Steps |
|------|---------|-------|
| `landing` | First visit to index.html | Studio grid → CTA button |
| `studio` | First visit to any studio | Upload zone → Config form → Generate button → Result panel |

### Initialization

```javascript
// In init() function of each page
if (typeof OnboardingTour !== 'undefined') {
    OnboardingTour.init('landing');  // or 'studio' for studio pages
}
```

### HTML Script Tag

Add to all HTML files before `</body>`:
```html
<script src="onboarding.js"></script>
```

### CSS Classes

```css
.onboarding-overlay { position: fixed; inset: 0; z-index: 10000; }
.onboarding-highlight { box-shadow: 0 0 0 4px var(--accent), 0 0 0 9999px rgba(0,0,0,0.75); }
.onboarding-tooltip { position: fixed; width: 320px; background: var(--bg-elevated); }
```

### Storage Keys

| Key | Purpose |
|-----|---------|
| `ngraphics_onboarding.landing_tour_complete` | Landing tour completed |
| `ngraphics_onboarding.studio_tour_complete` | Studio tour completed |
| `ngraphics_onboarding.dismissed_at` | Last skip timestamp (24h cooldown) |

---

## Mobile Optimization

CSS patterns for mobile devices. Implemented in `styles.css` (lines 9330+).

### Small Screens (<360px)

```css
@media (max-width: 360px) {
    .header-content { padding: 8px 10px; }
    .brand-name { font-size: 0.8rem; }
    .option-btn { font-size: 0.7rem; padding: 8px 10px; }
}
```

### Landscape Orientation

```css
@media (max-height: 500px) and (orientation: landscape) {
    .site-header { padding: 8px 16px; }
    .modal-content { max-height: 100vh; border-radius: 0; }
    .upload-zone { min-height: 100px; }
}
```

### Safe Area Insets (iPhone X+)

```css
@supports (padding: env(safe-area-inset-top)) {
    .site-header {
        padding-top: max(12px, env(safe-area-inset-top));
        padding-left: max(16px, env(safe-area-inset-left));
        padding-right: max(16px, env(safe-area-inset-right));
    }
    .site-footer {
        padding-bottom: max(16px, env(safe-area-inset-bottom));
    }
}
```

### Touch Improvements

```css
/* Prevent double-tap zoom on interactive elements */
button, a, .option-btn, .studio-card {
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
}

/* Smooth scrolling in modals */
.modal-body, .panel-config {
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
}

/* Prevent text selection on buttons */
.option-btn, .btn-generate {
    user-select: none;
    -webkit-user-select: none;
}
```

### Minimum Tap Targets (44px)

```css
@media (max-width: 768px) {
    .option-btn { min-height: 44px; }
    .modal-close { width: 44px; height: 44px; }
    .account-dropdown-item { min-height: 48px; }
}
```

---

*Last updated: January 2026*
