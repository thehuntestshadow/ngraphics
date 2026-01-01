# API Reference

Code examples and usage patterns for HEFAISTOS shared infrastructure. See CLAUDE.md for architecture overview.

---

## Web Components (`components.js`)

### Usage Examples

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

---

## Event Bus (`core.js`)

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

---

## Reactive State (`core.js`)

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

---

## Image Compression (`core.js`)

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

---

## Virtual Scroller (`core.js`)

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

## Image Worker (`workers.js`)

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

---

## Service Worker Manager (`workers.js`)

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
