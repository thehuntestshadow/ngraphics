# STUDIO.md

The philosophy and patterns for HEFAISTOS studio pages.

---

## The 30 Seconds to Fun Philosophy

> "Design is not just what it looks like and feels like. Design is how it works." — Steve Jobs

Every studio must deliver value within **30 seconds** of landing on the page. This isn't a guideline—it's a requirement.

### The First 30 Seconds

| Second | User Action | Studio Response |
|--------|-------------|-----------------|
| 0-5 | Page loads | Instant render, no loading spinners, no layout shift |
| 5-10 | Eyes scan the page | Clear hierarchy: one primary action dominates |
| 10-20 | Upload an image | Drag-drop or click, immediate preview |
| 20-30 | **Auto-generate** | Magic happens automatically. Result appears. |

If a user can't go from zero to generated result in 30 seconds, the studio has failed.

### Auto-Generate Mode

The ultimate expression of "30 seconds to fun" is **auto-generate on upload**:

```
Upload Image → AI Analyzes → Auto-Generates → Result Appears
```

No clicking required. The user uploads, and magic happens.

**Implementation:**
- Toggle: "Auto-generate on upload" (ON by default)
- When enabled: upload → analyze product → generate with smart defaults
- Persists preference to localStorage
- Shows loading immediately: "Analyzing product..." → "Generating..."

```html
<div class="auto-mode-row">
    <span class="auto-mode-label">Auto-generate on upload</span>
    <label class="toggle-label">
        <input type="checkbox" class="toggle-checkbox" id="autoModeToggle" checked>
        <span class="toggle-switch"></span>
    </label>
</div>
```

Power users can disable it to customize settings before generating.

### What This Means in Practice

1. **No configuration required** - Sensible defaults for everything
2. **No account required** - Works fully offline, accounts are optional
3. **No documentation required** - The interface IS the documentation
4. **No waiting** - Perceived performance matters; show progress, not spinners

---

## Design Philosophy

### Invisible Complexity

The best interface is no interface. Every option we add is a decision the user must make. Every decision is friction. Every friction is a chance to lose them.

```
Wrong: "Configure your output parameters"
Right: "Generate" (with smart defaults)

Wrong: 47 options visible at once
Right: 3 options visible, 44 hidden in "Advanced"
```

### Progressive Disclosure

1. **Level 0 (Auto)**: Auto-generate on upload—user uploads, magic happens
2. **Level 1 (Visible)**: Auto-mode toggle + Upload area + Generate button
3. **Level 2 (One Click)**: Basic Settings dropdown (Scene, Mood, Style)
4. **Level 3 (Two Clicks)**: Advanced Settings dropdown (technical options)

The casual user never needs to open any dropdowns. The power user can access everything.

**Implementation - Standard Layout Order:**
```
┌─────────────────────────────────────┐
│  [Auto-generate on upload]  [ON]   │  ← Always at top
├─────────────────────────────────────┤
│  [Upload Area]                      │  ← Primary action
│  Drop image or click to upload      │
├─────────────────────────────────────┤
│  ▶ Basic Settings                   │  ← Collapsed by default
│    (Scene, Style, Mood, etc.)       │
├─────────────────────────────────────┤
│  ▶ Advanced Settings                │  ← Collapsed by default
│    (Quality, Seed, Technical)       │
├─────────────────────────────────────┤
│  [====== Generate ======]           │  ← Primary CTA
└─────────────────────────────────────┘
```

- Auto-mode toggle ALWAYS at the very top
- Upload area immediately below (the main action)
- Basic Settings collapsed (common customizations)
- Advanced Settings collapsed (power user options)
- Generate button at bottom (natural flow endpoint)

### Opinionated Defaults

We make decisions so users don't have to:

- **Aspect Ratio**: 1:1 (works everywhere)
- **Quality**: High (not Ultra—diminishing returns)
- **Variations**: 1 (show them it works first)
- **Style**: Whatever looks best for this studio type

Every default should be the choice a professional would make for a client.

---

## Visual Language

### The Glance Test

A user glancing at any studio should instantly understand:
1. What it does (headline)
2. Where to start (upload area)
3. What happens next (generate button)

If they need to read instructions, we've failed.

### Spatial Hierarchy

**Standard Layout** (History/Favorites in right panel):

```
┌─────────────────────────────────────────────────────────┐
│  Left Panel (40%)          │  Right Panel (60%)        │
│  ─────────────────         │  ─────────────────        │
│  [Upload Area]             │  [Output/Result]          │
│                            │                           │
│  Configuration             │  Preview                  │
│  (Progressive Disclosure)  │  History                  │
│                            │  Favorites                │
│  [Generate Button]         │                           │
└─────────────────────────────────────────────────────────┘
```

**Bottom Panels Layout** (History/Favorites below main):

```
┌─────────────────────────────────────────────────────────┐
│  Left Panel (40%)          │  Right Panel (60%)        │
│  ─────────────────         │  ─────────────────        │
│  [Upload Area]             │  [Output/Result]          │
│                            │                           │
│  Configuration             │  Full-size Preview        │
│  (Progressive Disclosure)  │                           │
│                            │                           │
│  [Generate Button]         │                           │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│  [History Panel]           │  [Favorites Panel]        │
│  (Hidden when empty)       │  (Hidden when empty)      │
└─────────────────────────────────────────────────────────┘
```

Use Bottom Panels when:
- The result area benefits from full panel width
- History and Favorites should only appear when populated
- Users primarily care about the current generation

- **Left**: Input and configuration (cause)
- **Right**: Output and results (effect)
- **Flow**: Top to bottom, left to right

### The Generate Button

The most important element on the page. It must be:
- **Large** - Can't miss it
- **Colored** - The only primary-colored element
- **Bottom of left panel** - Natural endpoint of configuration flow
- **Always visible** - Never scrolled out of view

```css
/* The generate button is ALWAYS the accent color */
.generate-btn {
    background: var(--color-accent);
    /* Full width of its container */
    width: 100%;
    /* Generous padding */
    padding: 16px 24px;
}
```

---

## Interaction Patterns

### Upload Experience

The upload area is the front door. Make it welcoming:

```
┌─────────────────────────────────────┐
│                                     │
│            ↑                        │
│     Drop image or click             │
│     PNG, JPG, WebP • Max 10MB       │
│                                     │
└─────────────────────────────────────┘
```

- Dashed border (invites interaction)
- Large drop zone (hard to miss)
- Accepts drag-and-drop AND click
- Shows format hints (reduces errors)
- Immediate preview on upload

### Loading States

Never show a blank loading state. Always show:

1. **What's happening**: "Generating your lifestyle photo..."
2. **Progress indication**: Skeleton, shimmer, or percentage
3. **Cancel option**: User is always in control

```
Wrong: [Spinner]
Right: "Creating your image..." with pulsing skeleton
```

### Empty States

Empty states are opportunities, not dead ends:

```
┌─────────────────────────────────────┐
│           🏠                        │
│                                     │
│     No images yet                   │
│     Generated photos appear here    │
│                                     │
└─────────────────────────────────────┘
```

- Centered icon (visual anchor)
- Friendly message (not an error)
- Hint at what to do (implicit guidance)

### Results Display

When generation completes:
1. **Celebrate** - Subtle animation, the image appears
2. **Enable actions** - Download, favorite, info buttons
3. **Update history** - New item appears in Recent
4. **Clear loading** - Instant transition, no delay

---

## Functional Requirements

### Every Studio Must Have

| Feature | Required | Notes |
|---------|----------|-------|
| Image upload | ✓ | Drag-drop + click |
| Generate button | ✓ | Primary action |
| Result display | ✓ | Shows generated output |
| Download | ✓ | One-click save |
| History | ✓ | Last 20 generations |
| Favorites | ✓ | User-saved items |
| Keyboard shortcuts | ✓ | Ctrl+Enter, Ctrl+D, Escape |
| Theme support | ✓ | Light/dark mode |
| Offline capability | ✓ | Works without account |
| Error handling | ✓ | Friendly, actionable messages |

### Keyboard Shortcuts

Every studio uses the same shortcuts:
- `Ctrl/Cmd + Enter` - Generate
- `Ctrl/Cmd + D` - Download current result
- `Escape` - Close modals, cancel operations

### State Persistence

Studios remember user preferences:
- Last used options (scene, style, etc.)
- API key (encrypted in localStorage)
- History and favorites (IndexedDB for images)

---

## Code Patterns

### File Structure

```
studio-name.html    # Page markup
studio-name.js      # Page logic
studio-name.css     # Page-specific styles (optional)
```

### JavaScript Structure

```javascript
// ============================================
// 1. CONSTANTS & CONFIG
// ============================================
const STUDIO_ID = 'studio-name';

// ============================================
// 2. STATE & ELEMENTS
// ============================================
let state = { /* reactive state */ };
let elements = { /* cached DOM refs */ };

// ============================================
// 3. LIFECYCLE
// ============================================
async function init() { /* bootstrap */ }

// ============================================
// 4. RENDER FUNCTIONS (pure DOM updates)
// ============================================
function render() { /* update UI from state */ }

// ============================================
// 5. ACTION FUNCTIONS (side effects)
// ============================================
async function handleGenerate() { /* API call */ }

// ============================================
// 6. EVENT BINDING
// ============================================
function bindEvents() { /* attach listeners */ }
```

### Required DOM IDs

```html
<!-- Upload -->
<div id="uploadArea">...</div>
<input id="productPhoto" type="file">
<div id="imagePreview">...</div>

<!-- Actions -->
<button id="generateBtn">Generate</button>
<button id="downloadBtn">Download</button>

<!-- Output -->
<div id="resultContainer">...</div>
<div id="loadingContainer">...</div>
<div id="errorMessage">...</div>

<!-- History & Favorites -->
<div id="historyGrid">...</div>
<div id="historyEmpty">...</div>
<div id="favoritesGrid">...</div>
<div id="favoritesEmpty">...</div>
```

---

## Performance Budget

| Metric | Target | Rationale |
|--------|--------|-----------|
| First Contentful Paint | < 1s | User sees content immediately |
| Time to Interactive | < 2s | User can start working |
| Layout Shift | 0 | No jarring movement |
| Bundle Size | < 100KB | Fast load on mobile |

### Performance Rules

1. **No blocking scripts in head** - All JS deferred or at end of body
2. **No layout shift** - Reserve space for dynamic content
3. **Lazy load images** - History thumbnails load on scroll
4. **Cache aggressively** - Service worker for offline support

---

## Error Philosophy

### Errors Are Our Fault

When something goes wrong, assume the user did everything right. Our job is to:

1. **Explain** what happened (in human terms)
2. **Suggest** what to do next
3. **Enable** recovery without starting over

```
Wrong: "Error 429: Rate limit exceeded"
Right: "Too many requests. Wait a moment and try again."

Wrong: "Invalid API key"
Right: "API key not recognized. Check your key in Settings."
```

### Graceful Degradation

If a feature fails, the studio should still work:
- API down? → Show cached results, allow retry
- Storage full? → Warn user, continue working
- Network offline? → Work with local data

---

## The Feeling

A HEFAISTOS studio should feel like a **professional tool that respects your time**.

- **Confident**: It knows what it's doing
- **Quiet**: No unnecessary alerts, badges, or notifications
- **Fast**: Responds instantly to every action
- **Honest**: Shows real progress, admits errors
- **Delightful**: Small moments of polish and care

> "Simple can be harder than complex: You have to work hard to get your thinking clean to make it simple. But it's worth it in the end because once you get there, you can move mountains." — Steve Jobs

---

## Exceptions

Some studios deviate from standard patterns due to their unique nature:

### Studios Without Auto-Generate Toggle

These studios don't have the auto-generate toggle because they don't fit the "upload image → auto-generate" pattern:

| Studio | Reason |
|--------|--------|
| **Copywriter** | Text generation from images, not image generation. Analysis happens on upload, but generation is multi-step (7 tabs of content). |
| **Export Center** | Utility tool for resizing/compressing/watermarking. No AI generation involved. |
| **Size Chart** | Generates from data table input, not from image analysis. |
| **Badge Generator** | Text-based badge creator with style selection. No image upload required. |

### Copywriter DOM IDs

Copywriter uses `historyList`/`favoritesList` instead of `historyGrid`/`favoritesGrid` because it displays text content in a list format rather than image thumbnails in a grid layout.

---

## Checklist for New Studios

Before shipping a new studio, verify:

- [ ] 30-second test: Can a new user generate something in 30 seconds?
- [ ] Auto-mode test: Does upload → auto-generate work when enabled?
- [ ] Glance test: Is the purpose obvious without reading?
- [ ] Mobile test: Does it work on a phone?
- [ ] Offline test: Does it work without network?
- [ ] Dark mode test: Does it look good in both themes?
- [ ] Error test: What happens when things go wrong?
- [ ] Empty test: What does it look like with no data?
- [ ] Keyboard test: Can power users work without a mouse?
- [ ] Progressive disclosure: Are basic settings collapsed by default?

---

*"The details are not the details. They make the design." — Charles Eames*
