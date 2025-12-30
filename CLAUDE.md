# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NGRAPHICS - AI E-commerce Toolkit. A collection of web-based tools that e-commerce brands need and use every day. Uses the OpenRouter API with various AI models (Gemini, GPT, Flux, Recraft) for image generation and text content.

**What we build:**
- **Visual content tools** - Product photography, infographics, lifestyle shots, model photos
- **Marketing graphics** - Comparisons, size guides, packaging mockups
- **Content writing** - Product descriptions, FAQs, SEO copy
- **Utility tools** - Analyzers, generators, exporters

**Guiding principles:**
- Each tool solves one specific problem well
- No accounts, no subscriptions - works locally in browser
- AI-powered but user-controlled
- Fast iteration: upload → configure → generate → download

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
| Bundle Studio | `bundle.html`, `bundle.js`, `bundle.css` | Create bundle/kit images from multiple products |
| Lifestyle Studio | `lifestyle.html`, `lifestyle.js`, `lifestyle.css` | Product photography in lifestyle environments (no overlays) |
| Copywriter | `copywriter.html`, `copywriter.js`, `copywriter.css` | AI-powered marketing copy generator from product images |
| Packaging Mockup | `packaging.html`, `packaging.js`, `packaging.css` | Product packaging visualization (boxes, bottles, bags, etc.) |
| Comparison | `comparison.html`, `comparison.js`, `comparison.css` | Side-by-side and before/after product comparisons |
| Size Visualizer | `size-visualizer.html`, `size-visualizer.js`, `size-visualizer.css` | Product scale visualization with reference objects |
| FAQ Generator | `faq-generator.html`, `faq-generator.js`, `faq-generator.css` | Generate product Q&As with text and image output |
| Background Studio | `background.html`, `background.js`, `background.css` | Remove and replace product backgrounds |
| Dashboard | `dashboard.html`, `dashboard.js`, `dashboard.css` | Analytics, storage management, quick access to recent work |
| Documentation | `docs.html`, `docs.css` | User documentation |

### Shared Resources
- `styles.css` - Base styles, CSS variables, theming, common components
- `core.js` - Core infrastructure: Reactive State, Event Bus, Image Compression, Virtual Scrolling, Lazy Loading
- `shared.js` - Shared utilities: API handling, history, favorites, UI helpers, upload handling, lightbox, keyboard shortcuts
- `api.js` - Unified API client with retry logic, rate limiting, response normalization
- `components.js` - Reusable Web Components and UI elements
- `workers.js` - Web Worker and Service Worker managers
- `image-worker.js` - Web Worker for image processing (compression, thumbnails, enhancement)
- `service-worker.js` - Service Worker for caching and offline support

### Documentation Files
- `DESIGN.md` - Design system (colors, spacing, components, patterns)
- `PROMPTS.md` - Prompt engineering patterns for AI image generation
- `ROADMAP.md` - Feature ideas & plans
- `UI_PATTERNS.md` - HTML/CSS patterns for consistent UI
- `API_REFERENCE.md` - Code examples for shared infrastructure

## API Integration

Uses OpenRouter's `/api/v1/chat/completions` endpoint with `modalities: ['image', 'text']` for image generation. Response handling supports multiple formats (Gemini's inline_data, OpenAI's image_url, base64 responses).

**Default Model:** Gemini 3 Pro - Best balance of quality and speed for image generation tasks.

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

### Features
- Multimodal input, background styles (Auto/Light/Dark/Gradient), generation history
- Favorites with settings/seed for style reuse, benefits section (auto-filled on analysis)
- Bilingual (English/Romanian), feedback-based adjustment, SEO alt text, watermarks
- Keyboard shortcuts: Ctrl+Enter generate, Ctrl+D download, Escape close modals

### Advanced Options
- **Layout**: Template, Aspect Ratio, Product Focus, Variations (1/2/4)
- **Visual Style**: Density slider, Font Style, Icon Style, Callout Lines
- **Colors**: Color Harmony, Brand Colors
- **Style Reference**: Upload reference image (10-100% influence)
- **Generation**: Seed control, Negative prompts

---

## Model Studio (`models.html` + `models.js`)

Generate AI model photos with products (person wearing/holding product).

### Key Functions
- `generatePrompt()`: Builds prompt for model photo generation
- `generateModelPhoto()`: Makes API call for model image
- `analyzeProductImage()`: Auto-detect product type and description

### Configuration
- **Product**: Type, Description (auto-analyzed or manual)
- **Model Appearance**: Gender, Age, Ethnicity, Body Type, Hair
- **Shot Types**: Full Body, Half Body, Portrait, Close-up, Hands Only, Product Detail
- **Scenes**: Studio, Urban, Nature, Beach, Café, Office, Gym, Home, Luxury, Outdoor
- **Photography Style**: Editorial, Commercial, Lifestyle, Artistic

### Advanced Options
- **Pose & Expression**: Pose (8 options), Expression (4 options)
- **Camera**: Lighting (8), Angle (3), Aspect Ratio (6)
- **Quality**: Depth of Field, Color Grading, Skin Retouch, Composition, Quality Level, Realism
- **Technical**: Lens, Film Grain, Contrast, Product Focus
- **Collage Mode**: Multi-angle collages (2/3/4/6 angles), Face toggle

---

## Bundle Studio (`bundle.html` + `bundle.js`)

Create professional bundle/kit images from multiple individual product photos.

### Key Functions
- `generatePrompt()`: Builds prompt from all products and settings
- `generateBundle()`: Makes API call with all product images
- `analyzeProduct()`: Auto-detect product name and description
- `addProduct()` / `removeProduct()`: Manage product slots (2-6)

### Layout Styles
- **Flat Lay**: Top-down, artfully scattered
- **Grouped**: Clustered naturally
- **Grid**: Clean rows/columns
- **Hero**: One large, others smaller
- **Unboxing**: In/around container
- **Numbered**: With sequence numbers

### Options
- **Container**: None, Gift Box, Shipping Box, Pouch/Bag, Tray, Basket, Custom
- **Background**: White/Clean, Soft Gradient, Surface/Texture, Lifestyle Scene
- **Surfaces**: White Marble, Light/Dark Wood, Linen, Concrete, Terrazzo, Custom
- **Advanced**: Bundle Title, Labels, Numbering, Visual Style, Lighting, Aspect Ratio

---

## Lifestyle Studio (`lifestyle.html` + `lifestyle.js`)

Pure product photography in lifestyle environments - no infographic overlays.

### Key Differences from Infographics "In Context"
- **Output**: Pure photography (no text, icons, or callouts)
- **Controls**: Rich scene, mood, lighting, and seasonal options
- **Use Case**: Catalog/lookbook imagery vs marketing graphics

### Options
- **Scene**: Living Room, Kitchen, Bedroom, Office, Outdoor, Café, Beach, Gym, Garden, Urban
- **Mood**: Cozy, Energetic, Calm, Luxurious, Minimal, Vibrant, Romantic, Fresh
- **Time**: Morning, Midday, Golden Hour, Evening, Night
- **Season**: Auto, Spring, Summer, Fall, Winter, Holiday
- **Advanced**: Lighting, Shot Type, Camera Angle, Style, Quality, Depth of Field, Color Grading

---

## Copywriter (`copywriter.html` + `copywriter.js`)

AI-powered marketing copy generator from product images.

### Key Functions
- `analyzeProductImages()`: AI analysis to auto-fill product title, features, benefits
- `buildCopyPrompt()`: Constructs comprehensive marketing copy generation prompt
- `generateCopy()`: Generates all marketing copy via `api.generateText()`

### Generated Content
- **E-commerce**: Title, Short/Long Description, Feature Bullets, Benefits List
- **SEO**: Meta Title (<60 chars), Meta Description (<160 chars), Keywords, Alt Text
- **Social Media**: Instagram, Facebook, Twitter/X posts
- **Extras**: Taglines, Email subject lines

### Options
- Multi-image upload (up to 4), Feature management with starring, Tone selection
- Bilingual (English/Romanian), Copy individual fields or all content

---

## Packaging Mockup (`packaging.html` + `packaging.js`)

Visualize products in professional packaging designs.

### Packaging Types
Box, Bottle, Bag, Pouch, Jar, Tube, Can, Label

### Options
- **Box**: Type (product/shipping/gift/display/mailer/sleeve), Material
- **Bottle**: Shape (cylinder/square/dropper/pump/spray), Material
- **Scene**: Studio, Retail Shelf, Unboxing, Lifestyle, Gift, Flat Lay
- **View**: Front, 3/4 View, Side, Top Down, Isometric
- **Branding**: Color Scheme, Design Style (Modern/Luxury/Organic/Playful/Vintage/Tech)

---

## Comparison Generator (`comparison.html` + `comparison.js`)

Side-by-side and before/after product comparison images.

### Comparison Types
| Type | Description | Required Images |
|------|-------------|-----------------|
| Before/After | Transformation comparison | 2 images |
| vs-competitor | Product versus competitor | 2 images + features |
| Feature Table | Feature comparison table | 1 image + feature/value pairs |
| Size Lineup | Size variants (S, M, L, XL) | 2-4 images |
| Multi-Product | Product comparison grid | 2-4 images |

### Options
- **Layout**: Split, Slider, Grid, Table
- **Style**: Clean, Bold, Professional, Playful, Luxury
- **Advanced**: Winner Badge, Show Prices, Aspect Ratio

---

## Size Visualizer (`size-visualizer.html` + `size-visualizer.js`)

Product scale visualization with reference objects.

### Reference Objects
Hand, Smartphone, Coin, Ruler, Credit Card, Pen, Coffee Mug, Laptop, Person

### Display Modes
- **Side-by-Side**: Product next to reference
- **In Hand**: Product held in hand
- **Context Scene**: In real-world environment (Desk, Pocket, Bag, Shelf, Car, Kitchen)
- **Technical Drawing**: Blueprint-style with dimension lines

### Options
- Product dimensions (W/H/D) with cm/inches toggle
- Show Dimensions, Scale, Grid toggles
- Visual Style, Background, Multi-Angle options

---

## FAQ Generator (`faq-generator.html` + `faq-generator.js`)

Generate product Q&As with text output and optional visual FAQ infographic.

### Categories
General, Technical, Shipping, Usage, Comparison, Warranty

### Output
- FAQ text with questions and answers
- Schema.org JSON-LD for SEO
- Visual FAQ infographic image (Infographic, Q&A Card, Top 5 styles)

### Options
- Q&A count per category (3/5/7), Tone (Professional/Friendly/Casual/Technical)
- Bilingual (EN/RO), Export as Markdown, Copy individual or all FAQs

---

## Background Studio (`background.html` + `background.js`)

Remove and replace product backgrounds for e-commerce ready images.

### Key Functions
- `generatePrompt()`: Builds prompt for background replacement
- `generateBackground()`: Makes API call with product image
- `adjustBackground()`: Regenerate with user feedback

### Background Types
- **Solid**: Pure colors (white, gray, black, custom)
- **Gradient**: Vertical, horizontal, or radial gradients
- **Scene**: AI-generated scenes (studio, living room, kitchen, office, outdoor, marble, wood, concrete)
- **Custom**: Upload custom background image
- **Transparent**: PNG with alpha channel

### Options
- **Shadow**: None, Drop, Reflection, Natural, Contact
- **Padding**: 0-50% slider
- **Aspect Ratio**: 1:1, 4:5, 3:4, 16:9, 9:16
- **Quality**: Standard, High, Ultra
- **Variations**: 1, 2, or 4 images

---

## Dashboard (`dashboard.html` + `dashboard.js`)

Central hub for analytics, storage management, and quick access.

### Features
- Overview cards (generations, favorites, storage, API status)
- Charts: Generation trends (7-day), model usage, studio breakdown
- Quick access grid with recent thumbnails
- Storage management: per-studio usage, Export All, Clear Old Items
- Activity table with filtering by studio

---

## Common Patterns

### State Management
Each page uses a `state` object for reactive state management, persisting key values to localStorage.

### Element Caching
DOM elements cached in `elements` object, initialized via `initElements()` on page load.

### Prompt Generation
Each page has `generatePrompt()` that builds AI prompts by concatenating descriptions from option maps.

### History & Favorites
- Hybrid storage: thumbnails in localStorage, full images in IndexedDB
- History: view in modal, download, configurable limits (default 20)
- Favorites: save with all settings/seed/reference images, supports multiple variants
- Storage keys: `ngraphics_*`, `model_studio_*`, `bundle_studio_*`, `lifestyle_studio_*`, `copywriter_*`, `packaging_*`, `comparison_generator_*`, `size_visualizer_*`, `faq_generator_*`, `background_studio_*`

### Error Handling
`showError()` displays user-friendly error messages. API errors caught and displayed appropriately.

---

## Shared Utilities (`shared.js`)

### Classes
- **SharedAPI**: API key management (localStorage)
- **SharedRequest**: `extractImageFromResponse()`, `makeRequest()`, `formatError()`
- **SharedHistory**: Hybrid storage with `add()`, `remove()`, `clear()`, `getImages()`, `findById()`, `getAll()`
- **ImageStore**: IndexedDB storage with `init()`, `save()`, `get()`, `delete()`, `clear()`
- **SharedFavorites**: Hybrid storage with same interface as SharedHistory

### Utility Objects
- **SharedTheme**: `init()`, `apply()`, `toggle()`, `setupToggle()`
- **SharedHeader**: `render(options)` - consistent header across pages
- **SharedDashboard**: `loadAllData()`, `getMetrics()`, `getGenerationTrends()`, `getModelUsage()`, `getRecentActivity()`, `getStorageEstimate()`, `clearOldItems()`
- **SharedUI**: `showError()`, `showSuccess()`, `updateApiStatus()`, `showLoading()`, `hideLoading()`
- **SharedUpload**: `setup()`, `handleFile()`
- **SharedLightbox**: `setup()`, `open()`, `close()`
- **SharedDownload**: `downloadImage()`
- **SharedKeyboard**: `setup(handlers)` - Ctrl+Enter, Ctrl+D, Escape
- **SharedCollapsible**: `setup()`

---

## Reusable Components (`components.js`)

### Web Components
| Component | Tag | Description |
|-----------|-----|-------------|
| UploadArea | `<upload-area>` | Drag-and-drop file upload |
| CollapsibleSection | `<collapsible-section>` | Expandable content |
| ModalDialog | `<modal-dialog>` | Modal overlay |
| OptionGroup | `<option-group>` | Button group selection |
| SliderInput | `<slider-input>` | Range slider |
| TagInput | `<tag-input>` | Add/remove tags |
| LoadingSpinner | `<loading-spinner>` | Loading indicator |
| ToastNotification | `<toast-notification>` | Auto-dismissing notification |
| ImageGrid | `<image-grid>` | Grid with selection/delete |

### Factory Functions (SharedComponents)
- `createFormGroup()`, `createOptionButtons()`, `confirm()`, `createResultCard()`
- `createProgress()`, `wrapWithTooltip()`, `createTabs()`, `createDropdown()`, `createEmptyState()`

See `API_REFERENCE.md` for usage examples.

---

## Core Infrastructure (`core.js`)

- **Event Bus**: Global pub/sub with `on()`, `once()`, `emit()`, wildcard support
- **Reactive State**: Proxy-based with `watch()`, `batch()`, `computed()`, persistence
- **Image Compression**: Auto-compress on upload (files > 500KB)
- **Virtual Scroller**: Efficient rendering for large lists

See `API_REFERENCE.md` for usage examples.

---

## Workers (`workers.js`)

- **Image Worker**: Background processing - `compress()`, `thumbnail()`, `analyze()`, `enhance()`, `batch()`
- **Service Worker Manager**: Caching, offline support - `checkForUpdate()`, `applyUpdate()`, `cacheUrls()`, `getCacheSize()`

See `API_REFERENCE.md` for usage examples.

---

## API Client (`api.js`)

- `generateImage()`: Image generation with multimodal support
- `analyzeImage()`: Image analysis
- `generateText()`: Text generation
- Features: Automatic retries, rate limiting, response normalization, request cancellation, caching, error classification

See `API_REFERENCE.md` for usage examples.
