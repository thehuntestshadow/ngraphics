# ROADMAP.md

Feature ideas and future plans for NGRAPHICS. Not commitments, just possibilities.

---

## Vision

**For** e-commerce sellers, marketers, and small brands
**Who** need professional product visuals but lack design resources or budget
**NGRAPHICS** is an AI-powered studio that generates marketing-ready images in seconds
**Unlike** hiring photographers or learning complex design tools
**We** let anyone create infographics, model photos, lifestyle shots, and bundle images with just a product image and a few clicks

---

## Current State

### Completed Pages
- **Infographics** - Product marketing infographics with features/callouts
- **Model Studio** - AI model photos wearing/holding products
- **Bundle Studio** - Multi-product bundle/kit images
- **Lifestyle Studio** - Product photography in lifestyle environments (no overlays)
- **Copywriter** - AI-powered marketing copy generator (SEO, social, e-commerce descriptions)
- **Packaging Mockup** - Product packaging visualization (boxes, bottles, bags, scenes)
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

See **Future Page Ideas** section below for comprehensive list of potential new studios.

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

## Future Page Ideas

Comprehensive list of potential new studios and tools, organized by priority.

### 🔥 High Priority (Implement Next)

#### **Background Studio**
Remove/replace product backgrounds - essential for e-commerce.
- AI background removal from product photos
- Replace with: solid colors, gradients, AI-generated scenes, custom uploads
- Shadow generation options (drop shadow, reflection, natural)
- Batch processing for multiple products
- Presets: White (Amazon-ready), Transparent (PNG), Lifestyle scenes
- Before/after comparison slider
- Difficulty: Medium-Hard
- Value: Very High (most requested e-commerce tool)

#### **Social Templates**
Platform-optimized social media graphics with product placement.
- Instagram: Post (1:1), Story (9:16), Carousel (multiple slides)
- Facebook: Post, Cover photo, Ad creative
- Pinterest: Standard pin (2:3), Idea pin
- TikTok/Reels: Thumbnail, cover frame
- Templates with text overlays, prices, sale badges, CTAs
- Drag-and-drop product positioning
- Auto-sizing for each platform
- Caption suggestions (integrates with Copywriter)
- Difficulty: Medium
- Value: Very High (essential for modern marketing)

#### **Ad Creative Generator**
Banner ads and paid media creatives in multiple sizes.
- Standard IAB sizes: 300x250, 728x90, 160x600, 320x50, 300x600, etc.
- Platform-specific: Google Display, Facebook/Meta, Amazon Sponsored Brands
- Auto-generate headline + CTA text variations
- A/B variant generation (2-4 versions per size)
- Brand color/logo integration
- Export as image set or HTML5
- Animated GIF option
- Difficulty: Medium-Hard
- Value: Very High (direct revenue driver)

#### **Product Variants**
Generate color/material variations from a single photo.
- Upload one product → generate in 5-10 different colors
- Material swaps: leather → suede, metal → wood, matte → glossy
- Pattern application: solid → stripes, prints, textures
- Lighting consistency across variants
- Useful for pre-production mockups or showing unavailable variants
- Batch export with color names
- Difficulty: Medium
- Value: High (huge time saver vs reshooting)

### 📦 Medium Priority

#### **A+ Content Generator** (Amazon Enhanced Brand Content)
Full Amazon EBC/A+ module generation.
- Standard modules: comparison charts, image with text, brand story
- Premium A+ modules: video placeholders, hotspots, carousels
- Auto-generate from existing product info
- Module arrangement preview
- Export ready for Seller Central upload
- Template library for different categories
- Difficulty: Medium
- Value: High (Amazon sellers need this)

#### **Size Visualizer**
Show product scale with reference objects.
- Product next to: hand, phone, coin, ruler, common household objects
- Dimension callouts and measurements overlay
- "Fits in your pocket" / "Fits on your desk" context shots
- Comparison with similar products (small/medium/large)
- Technical drawing style with measurements
- Multiple angles with consistent scaling
- Difficulty: Medium
- Value: High (reduces returns from size confusion)

#### **Packaging Mockup**
Visualize products in retail packaging.
- Box/carton mockups (shipping boxes, retail display boxes)
- Bottle/jar labels and packaging
- Hang tags and product labels
- Unboxing scene generation
- Gift wrapping options
- Shelf placement visualization (retail context)
- 3D box rotation views
- Difficulty: Medium-Hard
- Value: High (pre-production visualization)

#### **Comparison Generator**
Side-by-side and before/after images.
- Before/After slider compositions
- Us vs. Competitor layouts (feature checkmarks)
- Feature comparison tables as images
- Size comparison (small/medium/large lineup)
- Version comparison (v1 vs v2, old vs new)
- Multi-product comparison grids
- Difficulty: Medium
- Value: Medium-High (conversion optimization)

#### **Video Thumbnail Generator**
Thumbnails for YouTube, TikTok, tutorials.
- Product review thumbnail styles
- Unboxing thumbnails with excitement elements
- Tutorial/How-to frames with numbered steps
- "Top 10" / Listicle styles
- Face + product compositions (reaction style)
- Text overlays optimized for small screens
- Platform-specific sizes (YouTube, TikTok, Instagram)
- Difficulty: Easy-Medium
- Value: Medium-High (video content creators)

#### **Batch Processor Studio**
Bulk operations across multiple products.
- Upload CSV + images → batch generate all content types
- Apply same settings/templates to multiple products
- Queue management with visual progress
- Pause/resume/cancel operations
- Individual item preview before processing
- Export all results as organized ZIP
- Error handling with retry options
- Difficulty: Medium-Hard
- Value: High (efficiency for large catalogs)

### 🎨 Content Generation Tools

#### **Email Campaign Writer**
Full marketing email sequences (extends Copywriter).
- Welcome series (3-5 emails)
- Abandoned cart recovery sequences
- Product launch announcements
- Re-engagement campaigns
- Seasonal/holiday promotions
- Subject lines + preview text + body + CTAs
- A/B variant subject lines
- Difficulty: Easy-Medium
- Value: Medium-High

#### **FAQ Generator**
Auto-generate product Q&As.
- Common questions based on product category
- Technical specifications as Q&A format
- Shipping/returns FAQs
- Usage/care instructions
- Comparison questions ("Is this compatible with...?")
- Schema markup ready output
- Difficulty: Easy
- Value: Medium

#### **Review Responder**
AI-assisted review response drafts.
- Positive review thank-you templates
- Negative review damage control responses
- Question/inquiry responses
- Tone matching (professional, friendly, apologetic)
- Multi-language support
- Bulk response generation
- Difficulty: Easy
- Value: Medium

#### **Product Naming Studio**
Generate product and brand names.
- Product name suggestions based on features/benefits
- Brand name brainstorming with style options
- SKU generation patterns
- Tagline suggestions
- Domain availability hints
- Trademark conflict warnings
- Difficulty: Easy
- Value: Medium

### 📊 Analytics & Optimization

#### **Listing Analyzer**
Analyze and score existing product listings.
- Paste competitor URL → get analysis
- SEO score with specific suggestions
- Image quality assessment
- Copy effectiveness rating
- Keyword gap analysis
- Actionable improvement checklist
- Before/after comparison after improvements
- Difficulty: Medium-Hard
- Value: High

#### **Trend Spotter**
Discover trending styles and keywords.
- Category trend reports
- Seasonal trend predictions
- Competitor monitoring alerts
- Hashtag suggestions with volume
- Color/style trend analysis
- Best posting times by platform
- Difficulty: Hard
- Value: Medium

### 🛠️ Utility Tools

#### **Brand Kit Manager**
Centralized brand asset management.
- Brand colors (primary, secondary, accent, background)
- Logo uploads (light/dark/icon versions)
- Font preferences and pairings
- Voice/tone guidelines
- Auto-apply across all studios
- Export brand guidelines PDF
- Difficulty: Medium
- Value: High (consistency across content)

#### **Template Library**
Save and reuse successful configurations.
- Save any generation as a reusable template
- Category organization (by product type, campaign, season)
- Import/export templates as JSON
- Template preview gallery
- One-click application to new products
- Template versioning
- Difficulty: Medium
- Value: High

#### **Image Enhancer**
AI upscaling and quality improvement.
- Resolution upscaling (2x, 4x)
- Noise reduction
- Sharpening controls
- Color correction
- Lighting adjustment
- Remove compression artifacts
- Batch processing
- Difficulty: Medium
- Value: Medium

#### **Export Center**
Unified export with format/size options.
- Resize for all platforms at once
- Format conversion (JPG, PNG, WebP, AVIF)
- Quality/compression settings
- Watermark application (text or logo)
- Metadata embedding (EXIF, alt text)
- ZIP packaging organized by platform
- Naming convention templates
- Difficulty: Medium
- Value: Medium

### 📅 Seasonal & Themed

#### **Seasonal Studio**
Holiday and seasonal themed product images.
- Christmas, Valentine's, Halloween, Easter, etc.
- Summer/Winter/Fall/Spring themes
- Sale events: Black Friday, Prime Day, Cyber Monday
- Cultural holidays (Diwali, Lunar New Year, etc.)
- Props and decorations automatically added
- Seasonal color grading presets
- Calendar-based suggestions
- Difficulty: Medium
- Value: Medium

#### **Catalog Generator**
Multi-product layouts for catalogs/lookbooks.
- Grid layouts (2x2, 3x3, 4x4, custom)
- Lookbook spreads with lifestyle context
- Product line showcases
- Collection pages with headers
- Price sheet layouts
- Print-ready PDF export
- Difficulty: Medium-Hard
- Value: Medium

### 🏪 Platform-Specific Tools

#### **Amazon Optimizer**
Complete Amazon listing optimization.
- A+ Content generation (see above)
- Main image and gallery optimization
- Bullet point generator
- Backend keyword suggestions
- Brand Story module creation
- Difficulty: Medium
- Value: High (Amazon is dominant marketplace)

#### **Etsy Listing Generator**
Optimized for Etsy's unique format.
- 13 tag generator with trending analysis
- Description with story-telling format
- Shop announcement generator
- About section content
- Difficulty: Easy-Medium
- Value: Medium

#### **Shopify Product Page**
Full product page content generation.
- Product description (short + long)
- Collection page content
- Blog post tie-ins
- Email capture popup copy
- Difficulty: Easy-Medium
- Value: Medium

---

## Ideas Parking Lot

Random ideas to evaluate later:

### Integrations & Extensions
- Chrome extension for quick generation from any product page
- Figma plugin integration
- Shopify app integration
- WordPress/WooCommerce plugin
- Amazon Seller Central integration
- Etsy shop integration
- API endpoint for programmatic access
- Zapier/Make integration
- Slack/Discord bot for team notifications

### Platform & Distribution
- White-label version for agencies
- Gallery of community generations (inspiration)
- Template marketplace (buy/sell templates)
- Affiliate program for creators

### AI & Automation
- AI-powered product description generation ✅ (Copywriter)
- Automatic A/B testing integration
- Smart scheduling (best times to post)
- Auto-regenerate on trend changes
- Competitor image analysis
- Style transfer from any image URL

### Content Types
- 360° product spin generation
- Product demo GIF creation
- Animated product reveals
- AR-ready images
- 3D model generation from photos

### Workflow
- Approval workflows for teams
- Version history with rollback
- Bulk scheduling to platforms
- Content calendar view
- Campaign organization folders

### Monetization Ideas
- Credit-based usage model
- Premium templates
- Priority API access
- Custom model fine-tuning
- White-glove onboarding service

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

### v1.0 (Complete)
Core generation across 3 studios with history/favorites

### v1.1 (Complete)
- [x] Unified API client
- [x] Image compression
- [x] Service worker caching
- [x] Web Components library
- [x] Event bus architecture

### v1.5 (Complete)
- [x] Presets system
- [x] ZIP export with metadata
- [x] Comparison slider
- [x] Keyboard shortcuts modal
- [x] Cost estimator
- [x] Batch processing
- [x] Image info overlay

### v2.0 (Current)
- [x] Lifestyle Studio - Product in lifestyle environments
- [x] Copywriter - AI marketing copy generator
- [x] Packaging Mockup - Product packaging visualization
- [ ] Style library
- [ ] Prompt templates

### v2.5 (Next)
- [ ] Background Studio - Background removal/replacement
- [ ] Social Templates - Platform-optimized graphics
- [ ] Ad Creative Generator - Banner ads in multiple sizes
- [ ] Product Variants - Color/material variations

### v3.0 (Future)
- [ ] A+ Content Generator - Amazon EBC
- [ ] Size Visualizer - Scale reference images
- [ ] Packaging Mockup - Retail packaging visualization
- [ ] Batch Processor Studio - Bulk operations
- [ ] Brand Kit Manager - Centralized brand assets

---

## What to Work On Next?

Pick based on your goals:

| Goal | Recommended Feature | Effort |
|------|---------------------|--------|
| E-commerce essentials | Background Studio | Medium-Hard |
| Social media marketing | Social Templates | Medium |
| Paid advertising | Ad Creative Generator | Medium-Hard |
| Product photography | Product Variants | Medium |
| Amazon sellers | A+ Content Generator | Medium |
| User convenience | Prompt Templates | Medium |
| Better UX | Onboarding Tour | Medium |
| Mobile users | Mobile Optimization | Hard |
| Efficiency | Batch Processor Studio | Medium-Hard |
| Brand consistency | Brand Kit Manager | Medium |

### Quick Reference: Priority Matrix

```
                    HIGH VALUE
                        │
    Background Studio ──┼── Social Templates
    Ad Creative       ──┤
    Product Variants  ──┤
                        │
    A+ Content ─────────┼── Size Visualizer
    Batch Processor   ──┤── Packaging Mockup
    Brand Kit         ──┤
                        │
    ────────────────────┼────────────────────
    LESS EFFORT         │         MORE EFFORT
                        │
    FAQ Generator ──────┼── Listing Analyzer
    Email Campaign    ──┤── Trend Spotter
    Review Responder  ──┤
                        │
                    LOW VALUE
```

---

*Last updated: Dec 2024*
*Add ideas freely - this is a living document*
