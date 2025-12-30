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
| Bundle Studio | `bundle.html`, `bundle.js`, `bundle.css` | Create bundle/kit images from multiple products |
| Dashboard | `dashboard.html`, `dashboard.js`, `dashboard.css` | Analytics, storage management, quick access to recent work |
| Documentation | `docs.html`, `docs.css` | User documentation |

### Shared Resources
- `styles.css` - Base styles, CSS variables, theming, common components
- `core.js` - Core infrastructure: Reactive State, Event Bus, Image Compression, Virtual Scrolling, Lazy Loading
- `shared.js` - Shared utilities: API handling, history, favorites, UI helpers, upload handling, lightbox, keyboard shortcuts
- `api.js` - Unified API client with retry logic, rate limiting, response normalization
- `components.js` - Reusable Web Components and UI elements (see Components section below)
- `workers.js` - Web Worker and Service Worker managers
- `image-worker.js` - Web Worker for image processing (compression, thumbnails, enhancement)
- `service-worker.js` - Service Worker for caching and offline support

### Documentation Files
- `DESIGN.md` - **Design system** (colors, spacing, components, patterns) - consult for UI/UX consistency
- `PROMPTS.md` - **Prompt engineering patterns** - how to write effective AI image generation prompts
- `ROADMAP.md` - **Feature ideas & plans** - future directions and parking lot for ideas

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
- History management: Hybrid storage (thumbnails in localStorage, full images in IndexedDB)
- Language toggle: English/Romanian with proper diacritics support

### Features
- Multimodal input: Product photo uploaded and sent to AI as reference
- Background styles: Auto, Light, Dark, Gradient
- Generation history: Thumbnails in localStorage, full images in IndexedDB, viewable in modal
- Favorites: Save generations with settings/seed for style reuse across products
- Benefits section: Separate from features, auto-filled on image analysis (customer value propositions)
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

### Benefits Section
- Separate from features: Benefits are customer value propositions (why to buy)
- Features are technical specs (what it has)
- Auto-filled when analyzing product image
- Included in prompt generation and saved with favorites

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

**Generation Settings:**
- Seed control for reproducible generations
- Negative prompts to specify what to avoid

### Collage Mode
- Generate multi-angle product collages (2, 3, 4, or 6 angles)
- Face toggle: Show model face or product-only focus
- Variations: 1, 2, or 4 images

### Favorites
- Save generations with all settings and seed for style reuse
- Load favorite settings, upload new product, regenerate in same style

---

## Bundle Studio (`bundle.html` + `bundle.js` + `bundle.css`)

Create professional bundle/kit images from multiple individual product photos.

### Structure
- `state` object: Products array, layout, presentation, background, visual style settings
- `elements` object: Cached DOM references
- Description maps: Layout, container, surface, style, and lighting descriptions for prompts

### Key Functions
- `generatePrompt()`: Builds prompt from all products and settings
- `generateBundle()`: Makes API call with all product images
- `generateWithAdjustment()`: Regenerate with user feedback/modifications
- `analyzeProduct()`: Auto-detect product name and description
- `addProduct()` / `removeProduct()`: Manage product slots
- `updateLoadingStatus()`: Dynamic loading messages during generation

### Features
- Upload 2-6 product images with auto-analysis
- Edit product details manually if needed
- Drag to reorder (affects hero layout, numbering)
- Feedback-based adjustment: Regenerate with text feedback to refine results
- Keyboard shortcuts: Ctrl+Enter to generate, Ctrl+D to download
- Dynamic loading status messages during generation
- History and Favorites in right panel (matching other pages)
- API settings in collapsible section at bottom of form

### Layout Styles
- **Flat Lay**: Top-down arrangement, artfully scattered
- **Grouped**: Products clustered together naturally
- **Grid**: Clean rows/columns, equal spacing
- **Hero**: One main product large, others smaller around it
- **Unboxing**: Products in/around an open container
- **Numbered**: Products with sequence numbers (1, 2, 3...)

### Presentation Options
- **Container**: None, Gift Box, Shipping Box, Pouch/Bag, Tray, Basket, Custom
- **Background**: White/Clean, Soft Gradient, Surface/Texture, Lifestyle Scene
- **Surfaces**: White Marble, Light/Dark Wood, Linen, Concrete, Terrazzo, Custom

### Advanced Options
- Bundle Title: Optional text displayed on image
- Show Labels: Product names on image
- Show Numbering: Sequence numbers
- Visual Style: Commercial, Editorial, Lifestyle, Minimal, Luxury
- Lighting: Bright, Soft, Natural, Dramatic, Warm
- Aspect Ratio: 1:1, 4:5, 3:2, 16:9, 9:16
- Variations: 1, 2, or 4 images
- Seed control for reproducible results
- Negative prompts

### Favorites & History
- Save bundle with all settings, product references, and seed
- Load favorite to restore settings, upload new products, regenerate
- History and favorites displayed in right panel with grid view

---

## Dashboard (`dashboard.html` + `dashboard.js` + `dashboard.css`)

Central hub for analytics, storage management, and quick access to all studios.

### Features
- **Overview Cards**: Total generations, favorites count, storage used, API connection status
- **Charts** (Chart.js): Generation trends (7-day line chart), model usage (doughnut), studio breakdown (bar)
- **Quick Access Grid**: Recent generation thumbnails with lightbox preview
- **Storage Management**: Per-studio usage bars, Export All (JSON), Clear Old Items (>30 days)
- **Activity Table**: Recent generations with preview, title, studio, model, seed, time
- **Tab Filtering**: Overview (all studios) or filter by Infographics/Models/Bundles

### Key Functions
- `renderCards()`: Updates stat cards based on active tab filter
- `renderQuickAccess()`: Shows recent thumbnails, filtered by tab
- `renderActivityTable()`: Populates activity list, filtered by tab
- `initCharts()` / `updateChartsForTab()`: Chart.js initialization and updates
- `exportAllData()`: Downloads all history/favorites as JSON
- `clearOldItems()`: Removes items older than 30 days with confirmation

### Data Source
Uses `SharedDashboard` utility from shared.js to aggregate data from all three studios.

---

## Common Patterns

### State Management
Each page uses a `state` object for reactive state management, persisting key values to localStorage.

### Element Caching
DOM elements are cached in an `elements` object, initialized via `initElements()` on page load.

### Prompt Generation
Each page has a `generatePrompt()` function that builds detailed AI prompts by concatenating descriptions from various option maps.

### History
Generation history uses hybrid storage: thumbnails in localStorage for fast grid display, full images in IndexedDB. Supports view in modal/lightbox, download, and configurable limits (default 20 items).

### Error Handling
`showError()` function displays user-friendly error messages. API errors are caught and displayed appropriately.

### Favorites System
All pages support saving generations as favorites for style reuse:
- Save generated image(s) with all settings, seed, and reference images
- Supports multiple variants: when generating 2-4 variations, all are saved together
- Load favorite to restore settings, then upload new product to regenerate in same style
- Storage: Thumbnails in localStorage, full images in IndexedDB (hybrid approach)
- Storage keys: `ngraphics_favorites` (Infographics), `model_studio_favorites` (Model Studio), `bundle_studio_favorites` (Bundle Studio)

---

## Shared Utilities (`shared.js`)

Common functionality used across all pages.

### Classes

**SharedAPI** - API key management (localStorage)

**SharedRequest** - API request handling:
- `extractImageFromResponse(data)`: Handles multiple response formats (OpenAI, Gemini, Anthropic, DALL-E)
- `makeRequest(body, key, title, retries)`: Request with retry logic
- `formatError(error)`: User-friendly error messages

**SharedHistory** - Generation history with hybrid storage:
- Constructor: `new SharedHistory(storageKey, maxItems)`
- Stores metadata + thumbnails in localStorage, full images in IndexedDB
- Methods (async): `add(imageUrl, metadata)`, `remove(id)`, `clear()`, `getImages(id)`
- Methods (sync): `load()`, `save()`, `findById(id)`, `getAll()`, `setImageStore(store)`

**ImageStore** - IndexedDB storage for large images:
- Constructor: `new ImageStore(dbName)`
- Methods: `init()`, `save(id, images)`, `get(id)`, `delete(id)`, `clear()`

**SharedFavorites** - Favorites with hybrid storage:
- Constructor: `new SharedFavorites(storageKey, maxItems)`
- Stores metadata + thumbnails in localStorage, full images in IndexedDB
- Methods (async): `add(favorite)`, `remove(id)`, `clear()`, `getImages(id)`
- Methods (sync): `load()`, `save()`, `update(id, updates)`, `findById(id)`, `getAll()`

### Utility Objects

- **SharedTheme**: `init()`, `apply(theme)`, `toggle()`, `setupToggle(buttonEl)` - Theme management across all pages
- **SharedHeader**: `render(options)` - Renders consistent header across all pages
  - Options: `currentPage` (infographics|dashboard|models|bundles|docs), `showApiStatus`, `showLanguageToggle`
  - Centralizes all nav icons and page configurations
  - Auto-excludes current page from navigation links
- **SharedDashboard**: Cross-studio data aggregation for dashboard
  - `loadAllData()`: Loads history/favorites from all studios
  - `getMetrics(data)`: Returns totalGenerations, totalFavorites, perStudio counts
  - `getGenerationTrends(data, days)`: Returns array of {date, count} for charts
  - `getModelUsage(data)`: Returns model usage breakdown
  - `getRecentActivity(data, limit)`: Combined recent activity sorted by timestamp
  - `getStorageEstimate()`: Returns browser storage usage estimate
  - `clearOldItems(studioKey, days)`: Removes old history items
- **SharedUI**: `showError()`, `showSuccess()`, `updateApiStatus()`, `showLoading()`, `hideLoading()`
- **SharedUpload**: `setup(uploadArea, fileInput, callbacks)`, `handleFile(file, callbacks)`
- **SharedLightbox**: `setup()`, `open()`, `close()`
- **SharedDownload**: `downloadImage(imageUrl, prefix)`
- **SharedKeyboard**: `setup(handlers)` - Ctrl+Enter, Ctrl+D, Escape
- **SharedCollapsible**: `setup(toggleBtn, sectionEl)`
- **SharedComponents**: Factory functions for creating UI components dynamically

---

## Reusable Components (`components.js`)

Native Web Components for common UI patterns. No build step required.

### Web Components (Custom Elements)

| Component | Tag | Description |
|-----------|-----|-------------|
| UploadArea | `<upload-area>` | Drag-and-drop file upload with preview |
| CollapsibleSection | `<collapsible-section>` | Expandable content section |
| ModalDialog | `<modal-dialog>` | Modal overlay with header/body/actions |
| OptionGroup | `<option-group>` | Button group for single selection |
| SliderInput | `<slider-input>` | Range slider with label and value display |
| TagInput | `<tag-input>` | Add/remove tags with chips |
| LoadingSpinner | `<loading-spinner>` | Animated loading indicator |
| ToastNotification | `<toast-notification>` | Auto-dismissing notification |
| ImageGrid | `<image-grid>` | Grid of images with selection/delete |

### Web Component Usage Examples

```html
<!-- Upload Area -->
<upload-area
  label="Product Photo"
  hint="PNG, JPG up to 10MB"
  accept="image/*">
</upload-area>

<script>
  document.querySelector('upload-area').addEventListener('file-selected', (e) => {
    console.log(e.detail.file, e.detail.dataUrl);
  });
</script>

<!-- Collapsible Section -->
<collapsible-section title="Advanced Options" open>
  <p>Content goes here</p>
</collapsible-section>

<!-- Slider -->
<slider-input
  label="Quality"
  min="1" max="100" value="75"
  show-value>
</slider-input>
```

### Factory Functions (SharedComponents)

For more dynamic component creation via JavaScript:

```javascript
// Confirmation dialog
const confirmed = await SharedComponents.confirm('Delete this item?', {
  title: 'Confirm Delete',
  confirmText: 'Delete',
  type: 'danger'
});

// Option buttons
const buttons = SharedComponents.createOptionButtons({
  name: 'layout',
  options: [
    { value: 'grid', label: 'Grid' },
    { value: 'list', label: 'List' }
  ],
  value: 'grid',
  onChange: (val) => console.log('Selected:', val)
});

// Tabs
const tabs = SharedComponents.createTabs({
  tabs: [
    { id: 'tab1', label: 'First', content: '<p>Tab 1 content</p>' },
    { id: 'tab2', label: 'Second', content: '<p>Tab 2 content</p>' }
  ],
  activeTab: 'tab1',
  onTabChange: (tabId) => console.log('Switched to:', tabId)
});

// Dropdown menu
const dropdown = SharedComponents.createDropdown({
  trigger: document.querySelector('.menu-btn'),
  items: [
    { label: 'Edit', icon: '✏️', onClick: () => {} },
    { divider: true },
    { label: 'Delete', danger: true, onClick: () => {} }
  ]
});

// Progress bar
const progress = SharedComponents.createProgress({
  value: 45,
  max: 100,
  label: 'Uploading...'
});
progress.setValue(75); // Update progress

// Empty state
const empty = SharedComponents.createEmptyState({
  icon: '<svg>...</svg>',
  title: 'No Items',
  message: 'Get started by adding your first item.',
  action: { label: 'Add Item', onClick: () => {} }
});
```

### Available Factory Functions

- `createFormGroup({ id, label, type, value, placeholder, options })` - Form input with label
- `createOptionButtons({ name, options, value, onChange })` - Button group
- `confirm(message, options)` - Async confirmation dialog
- `createResultCard({ imageUrl, title, actions, onImageClick })` - Image result card
- `createProgress({ value, max, label, showPercent })` - Progress bar
- `wrapWithTooltip(element, text, position)` - Add tooltip to element
- `createTabs({ tabs, activeTab, onTabChange })` - Tab navigation
- `createDropdown({ trigger, items, position })` - Dropdown menu
- `createEmptyState({ icon, title, message, action })` - Empty state placeholder

---

## Core Infrastructure (`core.js`)

Foundational systems for state management, events, and performance optimization.

### Event Bus

Global pub/sub system for decoupled component communication:

```javascript
// Subscribe to events
events.on('image:generated', (data) => {
    console.log('Image generated:', data.imageUrl);
});

// Wildcard subscription
events.on('image:*', (data) => {
    console.log('Any image event:', data._event);
});

// Emit events
events.emit('image:generated', { imageUrl, seed, prompt });

// One-time listener
events.once('api:ready', () => initApp());

// Unsubscribe
const unsubscribe = events.on('event', handler);
unsubscribe();
```

### Reactive State

Proxy-based state management with automatic change detection:

```javascript
// Create reactive state
const state = new ReactiveState({
    apiKey: '',
    theme: 'dark',
    settings: { quality: 85 }
}, {
    persistKey: 'app_state',
    persistFields: ['apiKey', 'theme']
});

// Watch for changes
state.watch('apiKey', (newVal, oldVal) => {
    updateApiStatus();
});

// Deep watching
state.watch('settings', (val) => {
    console.log('Settings changed');
}, { deep: true });

// Debounced watching
state.watch('searchQuery', (val) => {
    search(val);
}, { debounce: 300 });

// Batch updates
state.batch((s) => {
    s.theme = 'light';
    s.quality = 90;
}); // Single notification

// Computed properties
state.computed('isReady', (s) => !!s.apiKey, ['apiKey']);
```

### Image Compression

Automatic compression on upload (files > 500KB):

```javascript
// Via SharedUpload (automatic)
SharedUpload.handleFile(file, {
    options: { maxWidth: 1920, quality: 0.85 },
    onLoad: (base64, file, compressionInfo) => {
        console.log('Compressed:', compressionInfo.compressionRatio);
    }
});

// Direct usage
const result = await imageCompressor.compress(file, {
    maxWidth: 1920,
    quality: 0.85
});
console.log(result.base64, result.compressionRatio);
```

### Virtual Scroller

Efficient rendering for large lists (history, favorites):

```javascript
const scroller = new VirtualScroller('#container', {
    itemHeight: 150,
    itemWidth: 150,
    gap: 12,
    columns: 'auto',
    renderItem: (item, index) => `
        <img src="${item.thumbnail}" alt="Item ${index}">
    `,
    onItemClick: (item) => openItem(item)
});

scroller.setItems(items);
scroller.scrollToItem(index);
```

---

## Workers (`workers.js`)

Web Worker and Service Worker managers.

### Image Worker

Offloads heavy image processing from main thread:

```javascript
// Compress image in background
const result = await imageWorker.compress(base64, {
    maxWidth: 1920,
    quality: 0.85
});

// Create thumbnail
const thumb = await imageWorker.thumbnail(base64, 150);

// Analyze image (colors, brightness)
const analysis = await imageWorker.analyze(base64);

// Enhance image
const enhanced = await imageWorker.enhance(base64, {
    contrast: 1.1,
    saturation: 1.1,
    autoLevels: true
});

// Batch processing with progress
const results = await imageWorker.batch(images, 'compress', {}, (current, total) => {
    console.log(`${current}/${total}`);
});
```

### Service Worker Manager

Handles caching and offline support:

```javascript
// Check for updates
await serviceWorkerManager.checkForUpdate();

// Apply update
serviceWorkerManager.applyUpdate();

// Cache specific URLs
await serviceWorkerManager.cacheUrls(['/api/models']);

// Get cache size
const size = await serviceWorkerManager.getCacheSize();

// Check offline status
if (serviceWorkerManager.isOffline) {
    showOfflineBanner();
}

// Listen for update available
serviceWorkerManager.onUpdateAvailable = () => {
    showUpdatePrompt();
};
```

---

## API Client (`api.js`)

Unified API client with retry logic and response normalization.

### Basic Usage

```javascript
// Set API key
api.apiKey = 'your-key';

// Generate image
const result = await api.generateImage({
    model: 'google/gemini-2.0-flash-exp',
    prompt: 'Product infographic...',
    images: [base64Image],
    seed: 12345
});

// Analyze image
const analysis = await api.analyzeImage({
    image: base64,
    prompt: 'Describe this product...'
});

// Generate text
const text = await api.generateText({
    prompt: 'Write a tagline...',
    maxTokens: 100
});
```

### Features

- **Automatic Retries**: Exponential backoff with jitter
- **Rate Limiting**: Queue-based request management
- **Response Normalization**: Handles Gemini, OpenAI, DALL-E formats
- **Request Cancellation**: AbortController support
- **Caching**: Optional response caching
- **Error Classification**: User-friendly error messages via `APIError.toUserMessage()`
