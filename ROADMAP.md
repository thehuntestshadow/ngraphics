# ROADMAP.md

Feature ideas and future plans for NGRAPHICS. Not commitments, just possibilities.

---

## Current State

### Completed Pages
- **Infographics** - Product marketing infographics with features/callouts
- **Model Studio** - AI model photos wearing/holding products
- **Bundle Studio** - Multi-product bundle/kit images
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

### High Priority / Quick Wins

**Batch Processing**
- Upload multiple products, generate for each
- Queue system with progress indicator
- Useful for catalog generation

**Export Improvements**
- Download all variations as ZIP
- Export with metadata (prompt, seed, settings)
- Bulk download from history

**Preset System**
- Save/load setting combinations
- Share presets via JSON export
- Built-in presets for common use cases

### Medium Priority

**Style Library**
- Save successful style references
- Browse and apply saved styles
- Community style sharing (future)

**Comparison View**
- Side-by-side before/after
- Compare multiple variations
- Swipe/slider comparison tool

**Smart Suggestions**
- Auto-suggest features based on product type
- Recommend styles based on industry
- Learn from user patterns

**Image Enhancement**
- Built-in cropping/resizing
- Background removal
- Color adjustment tools

### Lower Priority / Exploratory

**New Page Ideas**

*Social Media Studio*
- Templates for Instagram, Facebook, Pinterest
- Auto-sizing for different platforms
- Caption generation

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

*Analytics*
- Usage statistics
- Popular styles/settings
- Generation success rates

---

## Technical Improvements

### Performance
- [ ] Image compression before storage
- [ ] Lazy loading for history/favorites
- [ ] Service worker for offline access
- [ ] IndexedDB cleanup for old entries

### Code Quality
- [ ] TypeScript migration (optional)
- [ ] Unit tests for shared utilities
- [ ] E2E tests for critical flows
- [ ] ESLint/Prettier setup

### UX Improvements
- [ ] Onboarding tour for new users
- [ ] Tooltips for all options
- [ ] Undo/redo for settings
- [ ] Mobile responsive improvements
- [ ] Drag-and-drop reordering everywhere

### API
- [ ] Rate limiting awareness
- [ ] Cost estimation before generation
- [ ] Model capability detection
- [ ] Fallback model chains

---

## Ideas Parking Lot

Random ideas to evaluate later:

- Chrome extension for quick generation from any product page
- Figma plugin integration
- Shopify app integration
- WordPress plugin
- API endpoint for programmatic access
- White-label version
- Usage-based pricing model
- Gallery of community generations
- Template marketplace
- AI-powered product description generation
- Automatic A/B testing integration
- Brand kit management (logos, colors, fonts)
- Seasonal auto-theming
- Competitor analysis (style matching)

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

### v1.5 (Near-term)
- Presets system
- Export improvements
- Comparison view

### v2.0 (Future)
- Batch processing
- Style library
- 1-2 new studio pages

---

*Last updated: Dec 2024*
*Add ideas freely - this is a living document*
