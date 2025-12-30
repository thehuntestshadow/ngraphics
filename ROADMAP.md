# ROADMAP.md

Feature ideas and future plans for NGRAPHICS. Not commitments, just possibilities.

---

## Vision

**For** e-commerce sellers, marketers, and small brands
**Who** need professional product visuals but lack design resources or budget
**NGRAPHICS** is an AI-powered studio that generates marketing-ready images in seconds
**Unlike** hiring photographers or learning complex design tools
**We** let anyone create infographics, model photos, and bundle shots with just a product image and a few clicks

---

## Current State

### Completed Pages
- **Infographics** - Product marketing infographics with features/callouts
- **Model Studio** - AI model photos wearing/holding products
- **Bundle Studio** - Multi-product bundle/kit images
- **Dashboard** - Analytics, storage management, quick access hub
- **Documentation** - User docs

### Core Features (All Pages)
- OpenRouter API integration
- Multiple AI model support (Gemini, GPT)
- Generation history (localStorage)
- Favorites with settings/seed preservation (IndexedDB)
- Keyboard shortcuts (Ctrl+Enter, Ctrl+D, Escape)
- Feedback-based regeneration
- Seed control for reproducibility
- Negative prompts
- Multiple variations (1, 2, 4)

---

## Potential Features

### 🚀 Quick Wins (1-2 hours each)

**Keyboard Shortcuts Modal** ✅
- Press `?` to show all shortcuts
- Works on all pages (Infographics, Model Studio, Bundle Studio)
- Difficulty: Easy

**Download as ZIP** ✅
- Bundle all variations into ZIP with metadata JSON
- Uses JSZip library (loaded dynamically)
- Difficulty: Easy

**Copy Prompt Button** ✅
- Copy the generated prompt to clipboard
- Already implemented in result actions
- Difficulty: Easy

**Image Info Overlay** ✅
- Show seed, model, dimensions on image
- Toggle with info button
- Works on all pages
- Difficulty: Easy

**Clear History Confirmation** ✅
- Confirmation dialog before clearing
- Already uses SharedUI.confirm
- Difficulty: Easy

### ⚡ Medium Effort (half day each)

**Preset System** ✅
- Save current settings as named preset
- Load/delete presets
- Export/import as JSON
- Built-in presets (e.g., "E-commerce White", "Social Media Vibrant")
- Difficulty: Medium

**Comparison Slider** ✅
- Before/after slider view
- Compare two variations side-by-side
- Drag handle to reveal
- Difficulty: Medium

**Batch Processing** ✅
- Upload multiple products via batch mode toggle
- Queue with visual progress bar
- Process sequentially with cancellation support
- Individual item removal before processing
- Difficulty: Medium

**Cost Estimator** ✅
- Show estimated cost before generation
- Based on model pricing from OpenRouter
- Running total for session
- Difficulty: Medium

**Image Cropping**
- Crop before sending to API
- Aspect ratio presets
- Uses built-in canvas
- Difficulty: Medium

**Prompt Templates**
- Save successful prompts as templates
- Variables for product name, features
- Quick-apply from dropdown
- Difficulty: Medium

### 🔧 Larger Features (1+ day each)

**Style Library**
- Save style reference images with metadata
- Tag and search styles
- Preview style effect
- Extends existing Favorites system
- Difficulty: Medium-Hard

**Background Removal**
- Remove background before generation
- Uses remove.bg API or local ML
- Preview before/after
- Difficulty: Hard

**Smart Suggestions**
- Analyze product image for category
- Suggest relevant features/styles
- Learn from user selections
- Difficulty: Hard

**Trash / Recycle Bin** ✅
- Deleted items go to trash instead of permanent delete
- 7-day retention before auto-cleanup
- Restore accidentally deleted items
- Accessible from Dashboard
- Difficulty: Easy

**Onboarding Tour**
- Step-by-step first-time guide
- Highlight key features
- Skip/resume capability
- Difficulty: Medium

**Mobile Optimization**
- Touch-friendly controls
- Responsive layouts
- Swipe gestures
- Difficulty: Hard

### Lower Priority / Exploratory

**New Page Ideas**

*Social Media Studio* (partially covered by Infographics platform presets)
- Auto-sizing for different platforms
- Caption generation
- Story/Reel templates

*Ad Creative Studio*
- Banner ad layouts
- A/B variant generation
- Text overlay templates

*Packaging Mockup*
- Product on packaging mockups
- Box/bag/label mockups
- 3D mockup generation

*Lifestyle Scene*
- Product in lifestyle contexts
- Room/environment generation
- Seasonal themes

**Advanced Features**

*Video Generation*
- Product turntables
- Simple animations
- Slideshow creation

*Multi-language*
- Full i18n support
- Auto-translation of features
- RTL language support

*Collaboration*
- Shareable generation links
- Team workspaces
- Comment/feedback on generations

*Analytics* (partially covered by Dashboard)
- Popular styles/settings
- Generation success rates
- Export analytics data

---

## Technical Improvements

### Performance
- [x] Image compression before upload (core.js, image-worker.js)
- [x] Web Worker for background processing (image-worker.js)
- [x] Service worker for caching/offline (service-worker.js)
- [x] Virtual scrolling for large lists (core.js)
- [x] Request deduplication (core.js)
- [ ] IndexedDB cleanup for old entries
- [ ] Lazy loading of page-specific code

### Code Quality
- [x] Unified API client with retries (api.js)
- [x] Reusable Web Components (components.js)
- [x] Event bus for decoupled communication (core.js)
- [x] Reactive state management (core.js)
- [ ] TypeScript migration (optional)
- [ ] Unit tests for shared utilities
- [ ] E2E tests for critical flows
- [ ] ESLint/Prettier setup

### UX Improvements
- [ ] Tooltips for all options
- [ ] Drag-and-drop reordering everywhere
- [ ] Skeleton loading states
- [ ] Progress indicators for long operations
- [x] Keyboard shortcut help modal (see Quick Wins)
<!-- Onboarding, Mobile listed in Larger Features section -->

### API
- [x] Unified API client (api.js)
- [x] Rate limiting with queue (api.js)
- [x] Response normalization (api.js)
- [x] Error classification with user-friendly messages (api.js)
- [x] Cost estimation before generation (see Medium Effort)
- [ ] Model capability detection
- [ ] Fallback model chains
- [ ] Usage statistics/tracking

---

## Ideas Parking Lot

Random ideas to evaluate later:

- Chrome extension for quick generation from any product page
- Figma plugin integration
- Shopify app integration
- WordPress plugin
- API endpoint for programmatic access
- White-label version
- Gallery of community generations
- Template marketplace
- AI-powered product description generation
- Automatic A/B testing integration
- Brand kit management (extends existing brand colors feature)
- Seasonal auto-theming

---

## Won't Do (Anti-Goals)

Things explicitly out of scope:

- **Full photo editor** - Use Photoshop/Figma for that
- **Video editing** - Complex, different tools exist
- **Social media posting** - Use native platforms or Buffer/Hootsuite
- **Inventory management** - Not our domain
- **Complex animations** - Stick to static images
- **User accounts/auth** - Keep it simple, local-first

---

## Version Ideas

### v1.0 (Current)
Core generation across 3 studios with history/favorites

### v1.1 (In Progress)
- [x] Unified API client
- [x] Image compression
- [x] Service worker caching
- [x] Web Components library
- [x] Event bus architecture

### v1.5 (Near-term)
- [x] Presets system
- [x] ZIP export with metadata
- [x] Comparison slider
- [x] Keyboard shortcuts modal
- [x] Cost estimator
- [x] Batch processing
- [x] Image info overlay

### v2.0 (Future)
- [ ] Style library
- [ ] Prompt templates
- [ ] Background removal
- [ ] 1-2 new studio pages

---

## What to Work On Next?

Pick based on your goals:

| Goal | Recommended Feature |
|------|---------------------|
| User convenience | Prompt Templates |
| New capability | Background Removal |
| Better UX | Onboarding Tour |
| Mobile users | Mobile Optimization |
| New page | Ad Creative Studio |

---

*Last updated: Dec 2024*
*Add ideas freely - this is a living document*
