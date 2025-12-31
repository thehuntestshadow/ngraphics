# UI_PATTERNS.md

Reference file for consistent UI patterns across NGRAPHICS pages. **COPY THESE EXACTLY** when creating new pages.

---

## Table of Contents

1. [Page Boilerplate](#page-boilerplate)
2. [Marketing Page Boilerplate](#marketing-page-boilerplate)
3. [Panel Headers](#panel-headers)
4. [Section Labels](#section-labels)
5. [Scene Grid Buttons](#scene-grid-buttons)
6. [Option Buttons](#option-buttons)
7. [Generate Button](#generate-button)
8. [API Settings Toggle](#api-settings-toggle)
9. [Advanced Options Toggle](#advanced-options-toggle)
10. [History & Favorites Sections](#history--favorites-sections)
11. [Lightbox](#lightbox)
12. [Modals](#modals)
13. [Upload Zone](#upload-zone)
14. [Empty States](#empty-states)
15. [Message Boxes](#message-boxes)
16. [Footer](#footer)
17. [Apple Design System Quick Reference](#apple-design-system-quick-reference)

---

## Page Boilerplate

Every page starts with this structure:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Name - NGRAPHICS</title>
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
                        <span class="logo-title">NGRAPHICS</span>
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
    <title>Page Title - NGRAPHICS</title>
    <!-- CRITICAL: Inline theme script prevents flash of wrong theme -->
    <script>if(localStorage.getItem('ngraphics_theme')==='light')document.documentElement.setAttribute('data-theme','light')</script>
    <meta name="description" content="Page description for search engines.">

    <!-- Open Graph -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://hefaistos.xyz/page.html">
    <meta property="og:title" content="Page Title - NGRAPHICS">
    <meta property="og:description" content="Page description for social sharing.">
    <meta property="og:image" content="https://hefaistos.xyz/assets/og-image.png">
    <meta property="og:site_name" content="NGRAPHICS">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Page Title - NGRAPHICS">
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
                    <span class="logo-title">NGRAPHICS</span>
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

For button groups (variations, gender, etc.):

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

## API Settings Toggle

Collapsible section for API key and model selection. Uses simple sun-ray gear icon.

### Required Structure

```html
<div class="settings-section" id="settingsSection">
    <button type="button" class="settings-toggle" id="settingsToggle">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
        </svg>
        <span>API Settings</span>
        <svg class="toggle-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"/>
        </svg>
    </button>
    <div class="settings-content">
        <div class="api-key-group">
            <label class="option-label">OpenRouter API Key</label>
            <div class="api-key-input">
                <input type="password" class="input-field" id="apiKey" placeholder="sk-or-...">
                <button type="button" class="btn-icon" id="toggleApiKey" title="Show/Hide">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                    </svg>
                </button>
                <button type="button" class="btn-secondary btn-sm" id="saveApiKey">Save</button>
            </div>
        </div>
    </div>
</div>
```

### Required Elements

| Element | Class/ID | Required | Notes |
|---------|----------|----------|-------|
| Container | `.settings-section` `#settingsSection` | ✅ | Wraps toggle and content |
| Toggle button | `.settings-toggle` `#settingsToggle` | ✅ | Collapsible trigger |
| Gear icon | Sun-ray gear SVG | ✅ | Simple rays, not complex gear teeth |
| Label | `<span>API Settings</span>` | ✅ | Text label |
| Chevron | `.toggle-chevron` | ✅ | Down arrow, rotates when open |
| Content | `.settings-content` | ✅ | Collapsed by default |
| API key group | `.api-key-group` | ✅ | Contains label and input row |
| Input row | `.api-key-input` | ✅ | Contains input, eye button, save button |
| API input | `#apiKey` | ✅ | Password type, placeholder "sk-or-..." |
| Toggle visibility | `#toggleApiKey` | ✅ | Eye icon button |
| Save button | `#saveApiKey` | ✅ | `.btn-secondary .btn-sm` |

### Icons

```html
<!-- Sun-ray gear icon (CORRECT) -->
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
</svg>

<!-- Eye icon for show/hide -->
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
</svg>

<!-- Chevron down -->
<svg class="toggle-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <polyline points="6 9 12 15 18 9"/>
</svg>
```

### WRONG Patterns (Do NOT use)

```html
<!-- WRONG: Complex gear icon with teeth -->
<svg viewBox="0 0 24 24">
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06..."/>
</svg>

<!-- WRONG: Inline API section without toggle -->
<div class="api-section">
    <input type="password" id="apiKeyInput">
</div>

<!-- WRONG: Different input ID -->
<input id="apiKeyInput">  <!-- Should be id="apiKey" -->

<!-- WRONG: Different container classes -->
<div class="api-input-row">  <!-- Should be .api-key-input -->
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
- [ ] Contains AI Model select with `#aiModel`
- [ ] Placed BEFORE generate button

**API Settings:**
- [ ] Uses `.settings-section` with `.settings-toggle` button
- [ ] Uses sun-ray gear icon (simple, not complex gear teeth)
- [ ] Has `.toggle-chevron` for expand indicator
- [ ] Uses `.api-key-input` container with input `#apiKey`
- [ ] Has eye toggle button `#toggleApiKey` and save button `#saveApiKey`
- [ ] Placed AFTER generate button

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
        <span>NGRAPHICS</span>
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
| `--apple-green` | `#34C759` | Success |
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
| Elevated surface | `--bg-elevated` | `#27272a` |
| Input/button bg | `--bg-surface` | `#3f3f46` |
| Hover state | `--bg-hover` | `#52525b` |

### Typography
- **Font**: Inter (not Outfit)
- **Weights**: 400 (body), 500 (labels/buttons), 600 (titles)
- **Letter-spacing**: `0` or `-0.01em` (never wide tracking)

### Border Radius
| Variable | Value | Usage |
|----------|-------|-------|
| `--radius-sm` | `8px` | Buttons, badges |
| `--radius-md` | `12px` | Inputs, cards |
| `--radius-lg` | `16px` | Panels |

### Shadows
```css
--shadow-sm: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08);
--shadow-md: 0 4px 12px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1);
```

### Animations
- **Easing**: `cubic-bezier(0.25, 0.1, 0.25, 1)` (no bounce)
- **Duration**: 0.2s (fast), 0.3s (normal)
- **Hover**: Use `filter: brightness(1.1)` instead of `translateY`
- **Active**: Use `transform: scale(0.99)` for press feedback
- **Gradient animation**: `gradientShift 8s ease infinite` for generate button

### Anti-Patterns (Avoid)
1. Glow/neon effects
2. Bounce/spring animations
3. Wide letter-spacing
4. Font weights above 600
5. Noise overlays
6. Ambient orbs/blurs
7. `translateY` hover effects
8. Solid colors on primary CTAs (use gradients)

---

*Last updated: Dec 2025*
