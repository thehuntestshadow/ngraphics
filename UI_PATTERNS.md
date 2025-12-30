# UI_PATTERNS.md

Reference file for consistent UI patterns across NGRAPHICS pages. **COPY THESE EXACTLY** when creating new pages.

---

## Table of Contents

1. [Page Boilerplate](#page-boilerplate)
2. [Panel Headers](#panel-headers)
3. [Section Labels](#section-labels)
4. [Scene Grid Buttons](#scene-grid-buttons)
5. [Option Buttons](#option-buttons)
6. [Generate Button](#generate-button)
7. [API Settings Toggle](#api-settings-toggle)
8. [Advanced Options Toggle](#advanced-options-toggle)
9. [History Section](#history-section)
10. [Favorites Section](#favorites-section)
11. [Lightbox](#lightbox)
12. [Modals](#modals)
13. [Upload Zone](#upload-zone)
14. [Empty States](#empty-states)
15. [Message Boxes](#message-boxes)
16. [Footer](#footer)

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
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="pagename.css">
</head>
<body>
    <!-- Noise overlay -->
    <div class="noise-overlay"></div>

    <!-- Gradient orbs for atmosphere -->
    <div class="ambient-orb orb-1"></div>
    <div class="ambient-orb orb-2"></div>

    <!-- Header (rendered by SharedHeader) -->
    <header class="site-header"></header>

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
    <div class="option-buttons">
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

**CORRECT structure with `btn-glow`:**

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

**Icon examples by page:**
- Infographics: Lightning bolt
- Model Studio: Person with plus
- Bundle Studio: Four squares
- Lifestyle Studio: House

**WRONG - do not use:**
```html
<!-- WRONG: btn-loader instead of btn-glow -->
<span class="btn-loader"></span>
```

---

## API Settings Toggle

Uses simple sun-ray gear icon:

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
        <!-- API key input, model select, etc. -->
    </div>
</div>
```

**WRONG - complex gear icon:**
```html
<!-- WRONG: Complex gear path - too large and detailed -->
<svg viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06..."/>  <!-- TOO COMPLEX -->
</svg>
```

---

## Advanced Options Toggle

Uses slider/mixer icon:

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
        <!-- Advanced option groups -->
    </div>
</div>
```

---

## History Section

**CORRECT structure (stacked, not tabbed):**

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
        <p class="empty-state-text">Generated photos will appear here</p>
    </div>

    <!-- Favorites Section (nested inside, NOT separate tabs) -->
    <div class="favorites-section" id="favoritesSection">
        <!-- ... -->
    </div>
</div>
```

---

## Favorites Section

**CORRECT structure (nested inside history section):**

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
        <button class="btn-text-danger" id="clearFavoritesBtn">Clear All</button>
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

**WRONG - tabs instead of stacked:**
```html
<!-- WRONG: Using tabs for history/favorites -->
<div class="history-tabs">
    <button class="history-tab active" data-tab="history">History</button>
    <button class="history-tab" data-tab="favorites">Favorites</button>
</div>
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

- [ ] `btn-glow` used (not `btn-loader`) in generate button
- [ ] Settings toggle uses simple sun-ray gear icon
- [ ] Scene icons are `1rem` (not larger)
- [ ] Scene labels are `0.7rem`
- [ ] History and Favorites are stacked (not tabbed)
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

*Last updated: Dec 2024*
