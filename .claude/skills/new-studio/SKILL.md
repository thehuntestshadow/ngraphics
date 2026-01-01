---
name: new-studio
description: Scaffold a new studio page for HEFAISTOS following established patterns. Creates HTML, JS, and CSS files with correct structure.
---

# New Studio Page Scaffolding

This skill creates a new studio page for HEFAISTOS following all established patterns from `UI_PATTERNS.md`.

## Usage

```
/new-studio [page-name] [description]
```

Example: `/new-studio social "Social media graphics generator"`

## What Gets Created

1. **`{name}.html`** - Page with:
   - Correct boilerplate (noise overlay, ambient orbs, header)
   - Left panel (config) with form sections
   - Right panel (output) with placeholder, loading, result display
   - History and Favorites sections (stacked, not tabbed)
   - Lightbox and Favorites modal
   - Footer with keyboard hint
   - Scripts in correct order

2. **`{name}.js`** - JavaScript with:
   - `state` object with common fields
   - `elements` object initialized via `initElements()`
   - Description maps for options
   - `generatePrompt()` function
   - `generate{Name}()` API call function
   - `showLoading()`, `hideLoading()`, `showResult()`, `showError()`, `showSuccess()`
   - History and Favorites management
   - Lightbox and Modal handlers
   - `setupEventListeners()` with keyboard shortcuts
   - `init()` function with SharedHeader, theme, API key loading

3. **`{name}.css`** - Styles with:
   - Page-specific customizations
   - Import patterns from `styles.css`

## After Creation

The skill will remind you to:
1. Update `SharedHeader` in `shared.js` to add navigation link
2. Update `CLAUDE.md` to document the new page
3. Update `ROADMAP.md` if applicable

## File Templates

### HTML Structure
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <!-- Standard head from UI_PATTERNS.md -->
</head>
<body>
    <div class="noise-overlay"></div>
    <div class="ambient-orb orb-1"></div>
    <div class="ambient-orb orb-2"></div>
    <header class="site-header"></header>

    <main class="app-main">
        <div class="app-grid">
            <section class="panel panel-config">
                <!-- 01 Configure panel -->
            </section>
            <section class="panel panel-output">
                <!-- 02 Output panel -->
            </section>
        </div>
    </main>

    <!-- Lightbox -->
    <!-- Favorites Modal -->
    <!-- Footer -->

    <!-- Scripts -->
    <script src="core.js"></script>
    <script src="shared.js"></script>
    <script src="api.js"></script>
    <script src="components.js"></script>
    <script src="workers.js"></script>
    <script src="{name}.js"></script>
</body>
</html>
```

### JavaScript Structure
```javascript
// State
const state = {
    apiKey: '',
    uploadedImage: null,
    uploadedImageBase64: null,
    generatedImageUrl: null,
    generatedImages: [],
    history: [],
    lastPrompt: null,
    lastSeed: null,
    selectedFavorite: null,
    // Page-specific state...
};

// Elements cache
const elements = {};

// Storage
const history = new SharedHistory('{name}_studio_history', 20);
const favorites = new SharedFavorites('{name}_studio_favorites', 50);

function initElements() { /* ... */ }
function generatePrompt() { /* ... */ }
async function generate{Name}() { /* ... */ }
function showLoading() { /* ... */ }
function hideLoading() { /* ... */ }
function showResult(imageUrl) { /* ... */ }
function showError(message) { /* ... */ }
function showSuccess(message) { /* ... */ }
async function addToHistory(imageUrl, allImages) { /* ... */ }
function renderHistory() { /* ... */ }
async function saveFavorite() { /* ... */ }
function renderFavorites() { /* ... */ }
function loadFavorite(id) { /* ... */ }
function openLightbox(imageUrl) { /* ... */ }
function closeLightbox() { /* ... */ }
async function openFavoritesModal(id) { /* ... */ }
function closeFavoritesModal() { /* ... */ }
function downloadImage() { /* ... */ }
function setupEventListeners() { /* ... */ }
function init() { /* ... */ }

document.addEventListener('DOMContentLoaded', init);
```

## Patterns to Follow

Refer to these files for correct patterns:
- `UI_PATTERNS.md` - HTML/CSS patterns
- `CLAUDE.md` - Architecture and function documentation
- `lifestyle.js` - Clean example of page structure
- `models.js` - Example with many options
