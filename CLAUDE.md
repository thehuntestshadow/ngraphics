# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NGRAPHICS - AI Product Graphics Studio. A web application suite for creating marketing materials using the OpenRouter API with various AI image generation models (Gemini, GPT, Flux, Recraft).

## Development

No build process required. To run:
- Open any `.html` file directly in a browser, or
- Serve with any static file server (e.g., `python3 -m http.server 8000`)

## Architecture

The application consists of multiple pages, each with its own JS file, sharing common styles:

### Pages

| Page | Files | Purpose |
|------|-------|---------|
| Infographics | `index.html`, `script.js` | Generate product infographics with features/callouts |
| Model Studio | `models.html`, `models.js`, `models.css` | Generate AI model photos wearing/holding products |
| Documentation | `docs.html`, `docs.css` | User documentation |

### Shared Resources
- `styles.css` - Base styles, CSS variables, theming (Anthropic-inspired color palette), common components
- `shared.js` - Shared utilities: API handling, history, favorites, UI helpers, upload handling, lightbox, keyboard shortcuts

## API Integration

Uses OpenRouter's `/api/v1/chat/completions` endpoint with `modalities: ['image', 'text']` for image generation. Response handling supports multiple formats (Gemini's inline_data, OpenAI's image_url, base64 responses).

---

## Infographics Generator (`index.html` + `script.js`)

Main page for creating product marketing infographics.

### Structure
- `state` object: Manages language, API key, uploaded images, generated images, history
- `elements` object: Cached DOM references (initialized in `initElements()`)
- `iconSuggestions` map: Keyword-to-icon mapping for smart icon suggestions

### Key Functions
- `generatePrompt()`: Builds comprehensive AI prompt based on all settings
- `generateInfographic()`: Makes API call to OpenRouter with multimodal support
- `enhanceImage()`: Client-side auto-levels and contrast adjustment
- History management: localStorage-based with 20-item limit
- Language toggle: English/Romanian with proper diacritics support

### Features
- Multimodal input: Product photo uploaded and sent to AI as reference
- Background styles: Auto, Light, Dark, Gradient
- Generation history: Stored in localStorage, viewable in modal, exportable
- Favorites: Save generations with settings/seed for style reuse across products
- Bilingual: English and Romanian with proper character support (ă, â, î, ș, ț)
- Feedback-based adjustment: Regenerate with text feedback to refine results
- SEO alt text: Auto-generated descriptive text with copy button
- Watermark system: Text or logo watermarks with position/opacity controls
- Keyboard shortcuts: Ctrl+Enter to generate, Ctrl+D to download, Escape to close modals

### Advanced Options

**Layout & Composition:**
- Layout Template: Auto, Product Center/Left/Right/Top, Grid, Hero
- Aspect Ratio: Auto, 1:1, 2:3, 4:5, 16:9, 9:16
- Product Focus: Auto, Full, Close-up, Dynamic, In Context (with custom description input), Floating, Multi-View
- Variations: Generate 1, 2, or 4 images at once (parallel API calls)

**Visual Style:**
- Visual Density Slider: Minimal to Rich (5 levels)
- Font Style: Auto, Modern Sans-Serif, Classic Serif, Bold, Playful, Technical, Elegant
- Icon Style: Auto, Realistic, Illustrated, 3D, Flat/Minimal, Outlined, Gradient, None
- Callout Lines: Toggle with thickness (1-5) and color mode (mono/multi/gradient/match)

**Colors:**
- Color Harmony: Match Product, Complementary, Analogous, Triadic, Monochrome, High Contrast
- Brand Colors: Custom hex codes to incorporate

**Style Reference:**
- Upload reference image to match visual style
- Style Influence Slider: 10-100% control

**Generation Settings:**
- Seed control for reproducible generations
- Negative prompts to specify what to avoid

### Characteristic Features
- Drag-to-reorder: Reposition features by dragging the grip handle
- Star button to mark primary features (shown larger/more prominent)
- Auto icons: AI automatically selects appropriate icons based on feature text

---

## Model Studio (`models.html` + `models.js` + `models.css`)

Generate AI model photos with products (person wearing/holding product).

### Structure
- `state` object: Product settings, model appearance, shot type, scene, quality enhancements
- `elements` object: Cached DOM references
- Description maps: Convert option values to detailed prompt text

### Key Functions
- `generatePrompt()`: Builds prompt for model photo generation
- `generateModelPhoto()`: Makes API call for model image
- `analyzeProductImage()`: Auto-detect product type and description

### Model Configuration

**Product Settings:**
- Product Type: Clothing, Footwear, Accessories, Beauty, Electronics, etc.
- Product Description: Auto-analyzed or manual input

**Model Appearance:**
- Gender: Female (default), Male
- Age: 18-25 (default), 25-35, 35-50, 50+
- Ethnicity: Caucasian (default), Any/Diverse, African/Black, Asian, Hispanic/Latino, Middle Eastern, South Asian, Mixed
- Body Type: Slim, Average, Curvy, Muscular (for clothing/footwear only)
- Hair: Any, Long, Short, Curly, Blonde, Bald

**Shot Types:**
- Full Body, Half Body, Portrait, Close-up, Hands Only, Product Detail

**Scenes (10 options):**
- Studio, Urban, Nature, Beach, Café, Office, Gym, Home, Luxury, Outdoor
- Scene Details: Auto (default description) or Custom (user-provided specific details)

**Photography Styles:**
- Editorial, Commercial, Lifestyle, Artistic

### Advanced Options

**Pose & Expression:**
- Pose: Natural, Confident, Casual, Dynamic, Elegant, Seated, Walking, Leaning
- Expression: Neutral, Smiling, Serious, Candid

**Camera Settings:**
- Lighting: Studio, Natural, Golden Hour, Soft, Dramatic, Bright, Dark, Backlit
- Camera Angle: Eye Level, Low, High
- Aspect Ratio: 1:1, 4:5, 3:4, 2:3, 9:16, 16:9

**Quality Enhancements:**
- Depth of Field: Auto, Shallow, Medium, Deep, Extreme Bokeh
- Color Grading: Auto, Warm, Cool, Airy, Vibrant, Muted, Cinematic, B&W
- Skin Retouch: Natural, Light, Moderate, Beauty, Flawless
- Composition: Auto, Centered, Off-Center, Negative Space
- Quality Level: Standard, High, Ultra, Masterpiece
- Realism: Auto, Photorealistic, Cinematic

**Camera & Technical:**
- Lens: Auto, 35mm, 50mm, 85mm, 135mm
- Film Grain: None, Subtle, Heavy
- Contrast: Auto, Low, High

**Product Enhancement:**
- Focus: Auto, Texture, Shine, Color Accuracy, Detail, In Context

### Collage Mode
- Generate multi-angle product collages (2, 3, 4, or 6 angles)
- Face toggle: Show model face or product-only focus
- Variations: 1, 2, or 4 images

### Favorites
- Save generations with all settings and seed for style reuse
- Load favorite settings, upload new product, regenerate in same style

---

## Common Patterns

### State Management
Each page uses a `state` object for reactive state management, persisting key values to localStorage.

### Element Caching
DOM elements are cached in an `elements` object, initialized via `initElements()` on page load.

### Prompt Generation
Each page has a `generatePrompt()` function that builds detailed AI prompts by concatenating descriptions from various option maps.

### History
Generation history stored in localStorage with configurable limits, supporting view, re-use, and export.

### Error Handling
`showError()` function displays user-friendly error messages. API errors are caught and displayed appropriately.

### Favorites System
Both pages support saving generations as favorites for style reuse:
- Save generated image with all settings, seed, and reference images
- Load favorite to restore settings, then upload new product to regenerate in same style
- Storage: Thumbnails in localStorage, full images in IndexedDB (hybrid approach)
- Storage keys: `ngraphics_favorites` (Infographics), `model_studio_favorites` (Model Studio)

---

## Shared Utilities (`shared.js`)

Common functionality used across all pages.

### Classes

**SharedAPI** - API key management (localStorage)

**SharedRequest** - API request handling:
- `extractImageFromResponse(data)`: Handles multiple response formats (OpenAI, Gemini, Anthropic, DALL-E)
- `makeRequest(body, key, title, retries)`: Request with retry logic
- `formatError(error)`: User-friendly error messages

**SharedHistory** - Generation history (localStorage):
- Constructor: `new SharedHistory(storageKey, maxItems)`
- Methods: `load()`, `save()`, `add(imageUrl, metadata)`, `clear()`, `findById(id)`, `getAll()`

**ImageStore** - IndexedDB storage for large images:
- Constructor: `new ImageStore(dbName)`
- Methods: `init()`, `save(id, images)`, `get(id)`, `delete(id)`, `clear()`

**SharedFavorites** - Favorites with hybrid storage:
- Constructor: `new SharedFavorites(storageKey, maxItems)`
- Stores metadata + thumbnails in localStorage, full images in IndexedDB
- Methods (async): `add(favorite)`, `remove(id)`, `clear()`, `getImages(id)`
- Methods (sync): `load()`, `save()`, `update(id, updates)`, `findById(id)`, `getAll()`

### Utility Objects

- **SharedUI**: `showError()`, `showSuccess()`, `updateApiStatus()`, `showLoading()`, `hideLoading()`
- **SharedUpload**: `setup(uploadArea, fileInput, callbacks)`, `handleFile(file, callbacks)`
- **SharedLightbox**: `setup()`, `open()`, `close()`
- **SharedDownload**: `downloadImage(imageUrl, prefix)`
- **SharedKeyboard**: `setup(handlers)` - Ctrl+Enter, Ctrl+D, Escape
- **SharedCollapsible**: `setup(toggleBtn, sectionEl)`
