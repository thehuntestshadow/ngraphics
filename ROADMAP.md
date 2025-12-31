# ROADMAP.md

Feature ideas and future plans for NGRAPHICS. Not commitments, just possibilities.

---

## Vision

**For** e-commerce sellers, marketers, and small brands
**Who** need professional product visuals and marketing tools but lack design resources or budget
**NGRAPHICS** is an AI-powered toolkit that generates marketing-ready content in seconds
**Unlike** hiring photographers, designers, or copywriters, or learning complex tools
**We** let anyone create professional marketing materials with just a product image and a few clicks

### Core Philosophy

NGRAPHICS is a collection of **tools that e-commerce brands need and use every day**. Not just image generation - any tool that helps sellers create better listings, marketing materials, and product content.

**Tool categories we build:**
- **Visual content** - Product photography, infographics, lifestyle shots, model photos
- **Marketing graphics** - Comparisons, size guides, packaging mockups, social media assets
- **Written content** - Product descriptions, FAQs, SEO copy, social captions
- **Utility tools** - Analyzers, generators, optimizers, exporters
- **Platform tools** - Amazon, Etsy, Shopify-specific content generators
- **Workflow tools** - Batch processing, templates, brand management

**Guiding principles:**
- Each tool solves one specific problem well
- No accounts, no subscriptions - works locally in browser
- AI-powered but user-controlled
- Fast iteration: upload → configure → generate → download
- Platform-agnostic but platform-aware (export for specific marketplaces)

### Target Users

| User Type | Pain Points | Tools We Solve With |
|-----------|-------------|---------------------|
| Small brand owner | Can't afford photographer, designer, copywriter | All visual + copy tools |
| Amazon seller | Need A+ content, size guides, comparison charts | Infographics, Size Visualizer, Comparison |
| Etsy seller | Need lifestyle photos, unique descriptions | Lifestyle Studio, Copywriter |
| Dropshipper | Generic supplier photos, need differentiation | Model Studio, Packaging, Infographics |
| Agency/VA | Repetitive work across many products | Batch tools, templates |
| Social media manager | Need platform-sized content constantly | Social Templates (planned) |

### What Makes a Good Tool

Before adding a new tool, it should:
1. **Solve a real problem** - Something sellers actually do regularly
2. **Save significant time** - 10x faster than manual alternative
3. **Require minimal input** - Upload image → get result
4. **Produce professional output** - Better than DIY, close to professional
5. **Work standalone** - No dependencies on other tools (but can integrate)

---

## Current State

### Completed Pages
- **Infographics** - Product marketing infographics with features/callouts
- **Model Studio** - AI model photos wearing/holding products
- **Bundle Studio** - Multi-product bundle/kit images
- **Lifestyle Studio** - Product photography in lifestyle environments (no overlays)
- **Copywriter** - AI-powered marketing copy generator (SEO, social, e-commerce descriptions)
- **Packaging Mockup** - Product packaging visualization (boxes, bottles, bags, scenes)
- **Comparison Generator** - Side-by-side, before/after, and feature comparison images
- **Size Visualizer** - Product scale visualization with reference objects (hand, phone, coin, etc.)
- **FAQ Generator** - AI-generated Q&As with Schema.org JSON-LD and visual infographics
- **Background Studio** - Remove and replace product backgrounds with shadows
- **Badge Generator** - Sale badges (discounts, promos) and trust badges (certifications, guarantees)
- **Feature Cards** - Individual feature cards for product listing galleries
- **Size Chart Generator** - Size charts for apparel, footwear, accessories with presets
- **A+ Content Generator** - Amazon A+ Content modules (Image+Text, Comparison, Grid, Text, Single Image)
- **Product Variants** - Generate color, material, and pattern variations from product photos
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
- [x] IndexedDB cleanup for old entries
- [ ] Lazy loading of page-specific code

### Code Quality
- [x] Unified API client with retries (api.js)
- [x] Reusable Web Components (components.js)
- [x] Event bus for decoupled communication (core.js)
- [x] Reactive state management (core.js)
- [x] Pre-commit hooks for validation (.claude/hooks/)
- [x] Visual regression testing (/visual-test skill)
- [x] Performance auditing (/perf skill)
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

Comprehensive list of potential new studios and tools, organized by category.

### Tool Categories Overview

| Category | Purpose | Examples |
|----------|---------|----------|
| **Image Generation** | Create new visuals from product photos | Infographics, Model Studio, Lifestyle |
| **Video Generation** | Create short product videos (3-30s AI clips, not editing) | Infographic Video, Model Video, Lifestyle Video |
| **Image Processing** | Modify/enhance existing images | Background Studio, Product Variants, Image Enhancer |
| **Content Writing** | Generate text content | Copywriter (includes emails, platform presets) |
| **Social Media** | Platform-optimized content | Social Studio (posts, stories, carousels, pins) |
| **Conversion Tools** | Content that drives sales | Comparisons, badges, testimonials |
| **Utility** | Export and brand management | Export Center, Brand Kit |
| **Workflow** | Efficiency and consistency | Batch processing, templates |

### 🔥 High Priority (Implement Next)

#### **Background Studio** ✅ DONE
Remove/replace product backgrounds - essential for e-commerce.
- AI background removal from product photos
- Replace with: solid colors, gradients, AI-generated scenes, custom uploads
- Shadow generation options (drop shadow, reflection, natural)
- Batch processing for multiple products
- Presets: White (Amazon-ready), Transparent (PNG), Lifestyle scenes
- Before/after comparison slider
- Difficulty: Medium-Hard
- Value: Very High (most requested e-commerce tool)
- **Implemented**: `background.html` with 5 background types, shadow options, scene presets

#### **Social Studio** (Consolidated)
All social media content in one unified tool. *Replaces: Social Templates, Carousel Post Generator, Pin Generator, Story/Reel Cover Generator, Video Thumbnail Generator.*

**Format Tabs:**
- **Posts**: 1:1 (Instagram/Facebook), 4:5 (Instagram), 16:9 (Twitter/LinkedIn)
- **Stories/Reels**: 9:16 vertical format
- **Carousels**: Multi-slide sequences (2-10 slides)
- **Pinterest**: 2:3 vertical pins, Idea pins
- **Thumbnails**: YouTube, TikTok, video covers

**Features:**
- Text overlays, prices, sale badges, CTAs
- Product positioning with drag-and-drop
- Platform-specific safe zones and guidelines
- Caption suggestions (integrates with Copywriter)
- Batch export for all platforms at once
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

### 🎬 Video Generation (New Category)

#### **Infographic Video Generator**
Animated versions of product infographics for social media and listings.
- Animated callouts and feature highlights
- Text reveals, icon animations, product zoom effects
- Duration options: 5s, 10s, 15s, 30s
- Export: MP4, GIF, WebM
- Aspect ratios: 1:1 (Instagram), 9:16 (Stories/Reels), 16:9 (YouTube)
- Background music integration (optional)
- Voiceover text-to-speech (optional)
- Templates: Feature showcase, Benefits list, How-to steps
- Difficulty: Hard
- Value: Very High (video content drives 2x engagement)

#### **Model Video Generator**
Short video clips of AI models with products.
- Model movements: subtle sway, product showcase gestures, walking
- Camera movements: slow zoom, pan, orbit
- Duration: 3-10 seconds (loopable)
- Multiple angles in single video
- Export: MP4, GIF
- Use cases: Product page hero, social ads, email headers
- Difficulty: Hard
- Value: Very High (video models for fraction of real shoot cost)

#### **Lifestyle Video Generator**
Product videos in lifestyle environments with ambient motion.
- Scene animations: steam rising, leaves falling, water ripples, light changes
- Time-lapse effects: day-to-night, seasonal
- Subtle camera movements: dolly, parallax
- Duration: 5-15 seconds
- Background audio: ambient sounds matching scene
- Export: MP4, GIF, cinemagraph
- Use cases: Hero banners, social content, product pages
- Difficulty: Hard
- Value: High (brings static product shots to life)

#### **Product Variants** ✅ DONE
Generate color/material variations from a single photo.
- Upload one product → generate in 5-10 different colors
- Material swaps: leather → suede, metal → wood, matte → glossy
- Pattern application: solid → stripes, prints, textures
- Lighting consistency across variants
- Useful for pre-production mockups or showing unavailable variants
- Batch export with color names
- Difficulty: Medium
- Value: High (huge time saver vs reshooting)
- **Implemented**: `product-variants.html` with 3 variant types (Color, Material, Pattern), 6 color presets, grouped materials/patterns

### 📦 Medium Priority

#### **A+ Content Generator** ✅ DONE
Full Amazon EBC/A+ module generation.
- Standard modules: comparison charts, image with text, brand story
- Premium A+ modules: video placeholders, hotspots, carousels
- Auto-generate from existing product info
- Module arrangement preview
- Export ready for Seller Central upload
- Template library for different categories
- Difficulty: Medium
- Value: High (Amazon sellers need this)
- **Implemented**: `a-plus.html` with 5 module types (Image+Text, Comparison Chart, Four-Image Grid, Standard Text, Single Image)

#### **Size Visualizer** ✅
Show product scale with reference objects.
- Product next to: hand, phone, coin, ruler, common household objects
- Dimension callouts and measurements overlay
- "Fits in your pocket" / "Fits on your desk" context shots
- Comparison with similar products (small/medium/large)
- Technical drawing style with measurements
- Multiple angles with consistent scaling
- Difficulty: Medium
- Value: High (reduces returns from size confusion)
- **Status: Implemented** - 9 reference objects, 4 display modes, context scenes

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

#### **Comparison Generator** ✅
Side-by-side and before/after images.
- Before/After slider compositions
- Us vs. Competitor layouts (feature checkmarks)
- Feature comparison tables as images
- Size comparison (small/medium/large lineup)
- Version comparison (v1 vs v2, old vs new)
- Multi-product comparison grids
- Difficulty: Medium
- Value: Medium-High (conversion optimization)
- **Status: Implemented** - 5 comparison types, 4 layouts, visual styles

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

#### **FAQ Generator** ✅
Auto-generate product Q&As.
- Common questions based on product category
- Technical specifications as Q&A format
- Shipping/returns FAQs
- Usage/care instructions
- Comparison questions ("Is this compatible with...?")
- Schema markup ready output
- Difficulty: Easy
- Value: Medium
- **Status: Implemented** - 6 categories, 4 tones, Schema.org JSON-LD, visual infographics

#### **Copywriter Expansion** (to be added to existing Copywriter)
Instead of separate tools, extend the existing Copywriter with new content types:

**Email Tab:**
- Welcome series (3-5 emails)
- Abandoned cart recovery sequences
- Product launch announcements
- Subject lines + preview text + body + CTAs
- A/B variant subject lines

**Names Tab:**
- Product name suggestions based on features/benefits
- Tagline suggestions
- SKU generation patterns

**Review Responses Tab:**
- Positive review thank-yous
- Negative review damage control
- Question/inquiry responses
- Tone matching

This consolidates 3 planned tools into the existing Copywriter.

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

### 🛒 Conversion & Sales Tools

#### **Testimonial Generator**
Create social proof graphics from reviews.
- Upload screenshot of review → styled testimonial graphic
- Star rating displays with customizable styles
- Customer photo placeholder or avatar
- Quote callout designs (speech bubble, card, minimal)
- Multiple layout templates (horizontal, vertical, grid)
- Batch create from CSV of reviews
- Difficulty: Easy-Medium
- Value: High (social proof increases conversions)

#### **Sale/Promo Badge Generator** ✅ DONE
Create urgency and promotional graphics.
- Sale badges: "50% OFF", "LIMITED TIME", "BEST SELLER"
- Countdown timer graphics (for static use)
- "Only X left" scarcity badges
- Bundle deal graphics ("Buy 2 Get 1")
- Holiday/seasonal badges (Black Friday, Prime Day)
- Ribbon, starburst, circle, banner styles
- Apply to existing product images
- Difficulty: Easy
- Value: Medium-High (urgency drives sales)
- **Implemented**: `badge-generator.html` with 6 badge styles

#### **Trust Badge Generator** ✅ DONE
Create credibility elements for listings.
- "30-Day Money Back Guarantee" badges
- "Free Shipping" badges
- Certification/award style badges
- "As Seen On" media logos layout
- Security badges (SSL, secure checkout style)
- Warranty badges with custom duration
- Difficulty: Easy
- Value: Medium (builds trust)
- **Implemented**: Combined with Sale Badge Generator in `badge-generator.html`

#### **Feature Highlight Cards** ✅ DONE
Individual feature cards for galleries.
- Single feature spotlight with icon + text
- Before/after mini-comparisons
- Specification cards with values
- "What's in the box" item cards
- How-to step cards (1, 2, 3...)
- Compatible with product listing galleries
- Difficulty: Easy
- Value: Medium
- **Implemented**: `feature-cards.html` with 5 card types, 5 visual styles

### 🛠️ Utility Tools

#### **Brand Kit Manager**
Centralized brand asset management. *Includes Color Palette Extractor functionality.*
- Brand colors (primary, secondary, accent, background)
- **Color Palette Extractor**: Extract colors from product images, get complementary suggestions
- Logo uploads (light/dark/icon versions)
- Font preferences and pairings
- Voice/tone guidelines
- Auto-apply across all studios
- Export brand guidelines PDF
- Difficulty: Medium
- Value: High (consistency across content)

#### **Template Library**
Save and reuse successful configurations. *Extends existing preset system.*
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

#### **Export Center** (Consolidated)
All image utilities in one tool. *Replaces: Crop & Resize Tool, Watermark Tool, Image Compressor.*

**Tabs:**
- **Resize**: Preset crops for marketplaces + social, custom aspect ratios, smart crop
- **Compress**: Smart compression, target file size, format conversion (WebP, AVIF)
- **Watermark**: Text/logo watermarks, position presets, opacity control
- **Export**: Multi-format output, metadata embedding, ZIP packaging

**Features:**
- Batch processing across all operations
- Platform presets (Amazon, eBay, Etsy, Instagram, etc.)
- Before/after preview
- Naming convention templates
- Difficulty: Medium
- Value: High (consolidates 4 tools)

### 📅 Additional Tools

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

> **Note:** Seasonal/holiday themes are already available in **Lifestyle Studio** via the Season option (Spring, Summer, Fall, Winter, Holiday).

### 🏪 Platform-Specific Content

> **Note:** Platform-specific content should be **Copywriter presets**, not separate tools. The Copywriter already generates product descriptions and can be extended with platform templates.

**Copywriter Platform Presets (to be added):**
- **Amazon**: Bullet points, backend keywords, A+ text, Brand Story
- **Etsy**: 13 tags, story-telling descriptions, shop announcements
- **Shopify**: Short/long descriptions, collection content, blog tie-ins
- **eBay**: Item specifics, condition descriptions

This keeps one powerful Copywriter tool instead of fragmenting into 4+ separate generators.

---

## Ideas Parking Lot

Random ideas to evaluate later, organized by theme.

### 🔌 Integrations & Extensions
- Chrome extension for quick generation from any product page
- Figma plugin integration
- Shopify app integration
- WordPress/WooCommerce plugin
- Amazon Seller Central integration
- Etsy shop integration
- API endpoint for programmatic access
- Zapier/Make integration
- Slack/Discord bot for team notifications
- Google Sheets integration (bulk data import)
- Canva app integration

### 🌐 Platform & Distribution
- White-label version for agencies
- Gallery of community generations (inspiration)
- Template marketplace (buy/sell templates)
- Affiliate program for creators
- Shared team workspaces
- Public link sharing for client review

### 🤖 AI & Automation
- AI-powered product description generation ✅ (Copywriter)
- Automatic A/B testing integration
- Smart scheduling (best times to post)
- Auto-regenerate on trend changes
- Competitor image analysis
- Style transfer from any image URL
- Auto-tagging and categorization
- Smart cropping with subject detection
- Product recognition and auto-fill

### 🎬 Content Types
- 360° product spin generation
- Product demo GIF creation
- Animated product reveals
- AR-ready images
- 3D model generation from photos
- Short video clips (product zoom, rotate)
- Stop-motion style animations

### 📋 Workflow & Organization
- Approval workflows for teams
- Version history with rollback
- Bulk scheduling to platforms
- Content calendar view
- Campaign organization folders
- Project-based organization
- Client/brand separation
- Keyboard-only power user mode

### 💰 Monetization Ideas
- Credit-based usage model
- Premium templates
- Priority API access
- Custom model fine-tuning
- White-glove onboarding service
- Agency reseller program
- Enterprise self-hosted version

### 📦 E-commerce Specific Ideas
- **SKU Manager** - Organize images by SKU, auto-naming
- **Variant Linker** - Link color/size variants visually
- **Inventory Photo Batch** - Photograph inventory with consistent settings
- **Returns Analyzer** - Identify image quality issues from return reasons
- **Listing Completeness Checker** - Score listings for missing elements
- **Competitor Gallery Scraper** - Analyze competitor image strategies
- **Price Tag Generator** - Create consistent pricing graphics
- **Shipping Info Graphics** - Delivery time, free shipping threshold visuals
- ~~**Size Chart Generator**~~ ✅ - Generate size charts from measurements
- **Material/Ingredient Cards** - Highlight materials or ingredients visually
- **Certification Badge Creator** - Organic, vegan, cruelty-free badges
- **Instruction Manual Generator** - Visual how-to guides
- **Warranty Card Designer** - Professional warranty documentation
- **Thank You Card Generator** - Post-purchase insert cards
- **Packing Slip Designer** - Branded packing slip templates
- **QR Code Generator** - QR codes for product pages, reviews, support
- **Gift Message Cards** - Customizable gift message templates
- **Return Label Generator** - Branded return shipping labels

### 🧪 Experimental
- Voice-to-prompt generation
- Hand-drawn sketch to product image
- Product in 3D room visualizer
- Multi-language auto-translation
- Real-time collaboration editing
- AI style learning from user preferences

---

## Won't Do (Anti-Goals)

Things explicitly out of scope:

- **Full photo editor** - Use Photoshop/Figma for that
- **Video editing/timeline** - We generate short AI clips (3-30s), not edit them
- **Social media posting** - Use native platforms or Buffer/Hootsuite
- **Inventory management** - Not our domain
- **Complex animations** - Short AI-generated clips OK, timeline editing not
- **User accounts/auth** - Keep it simple, local-first
- **Fragmented tools** - Consolidate related features into unified studios

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

### v2.0 (Complete)
- [x] Lifestyle Studio - Product in lifestyle environments
- [x] Copywriter - AI marketing copy generator
- [x] Packaging Mockup - Product packaging visualization

### v2.5 (Complete)
- [x] Comparison Generator - Side-by-side and before/after images
- [x] Size Visualizer - Scale reference with common objects
- [x] FAQ Generator - AI Q&As with Schema.org and visual output

### v3.0 (Current) ✅
- [x] Background Studio - Background removal/replacement
- [x] Badge Generator - Sale and trust badges
- [x] Feature Cards - Individual feature cards for galleries
- [x] Size Chart Generator - Size charts for apparel/footwear/accessories
- [x] A+ Content Generator - Amazon EBC modules
- [x] Product Variants - Color/material/pattern variations

### v3.5 (Next - Consolidation Release)
- [ ] **Social Studio** - All social formats in one tool (posts, stories, carousels, pins, thumbnails)
- [ ] **Ad Creative Generator** - IAB banner ads in multiple sizes
- [ ] Batch Processor Studio - Bulk operations with CSV support

### v3.6 (Utilities & Expansion)
- [ ] **Export Center** - Resize, compress, watermark, export (consolidated utility)
- [ ] **Brand Kit Manager** - Colors, logos, fonts, palette extraction
- [ ] **Copywriter expansion** - Email campaigns, product naming, review responses, platform presets

### v4.0 (Video Generation)
- [ ] Infographic Video Generator - Animated product infographics (5-30s)
- [ ] Model Video Generator - AI model video clips with products (3-10s)
- [ ] Lifestyle Video Generator - Ambient lifestyle product videos (5-15s)

### v4.5 (Polish & Advanced)
- [ ] Template Library - Cross-studio templates
- [ ] Image Enhancer - AI upscaling
- [ ] Testimonial Generator - Review quote graphics
- [ ] Catalog Generator - Multi-product lookbooks

---

## What to Work On Next?

### By User Need

| User Need | Recommended Tools | Status |
|-----------|-------------------|--------|
| **Better product photos** | Background Studio, Product Variants | ✅ Done |
| **Social media content** | **Social Studio** (consolidated) | 🔜 v3.5 |
| **Video content** | Infographic/Model/Lifestyle Video | 🔜 v4.0 |
| **Increase conversions** | Badge Generator, Testimonial Generator | ✅ Badges done |
| **Amazon optimization** | A+ Content, Size Chart, Size Visualizer | ✅ Done |
| **Save time** | Batch Processor, Export Center | 🔜 v3.5-3.6 |
| **Brand consistency** | Brand Kit Manager | 🔜 v3.6 |
| **Marketing copy** | Copywriter (with email/platform expansion) | ✅ + 🔜 v3.6 |

### By Effort

| Effort | Tools |
|--------|-------|
| **Medium** | Social Studio, Ad Creative Generator |
| **Medium** | Export Center, Brand Kit Manager |
| **Medium** | Copywriter expansion (emails, platforms) |
| **Medium-Hard** | Batch Processor Studio |
| **Hard** | Video Generators (3 tools) |

### By Category

**Image Generation**
- ✅ Infographics, Model Studio, Bundle, Lifestyle, Packaging, Background Studio, Product Variants
- 🔜 Social Studio, Ad Creative Generator

**Video Generation**
- 🔜 Infographic Video, Model Video, Lifestyle Video

**Content Writing**
- ✅ Copywriter, FAQ Generator
- 🔜 Copywriter expansion (emails, names, reviews, platform presets)

**Conversion Tools**
- ✅ Comparison, Size Visualizer, Badge Generator, Feature Cards, Size Chart, A+ Content
- 🔜 Testimonial Generator

**Utility**
- 🔜 Export Center (resize/compress/watermark), Brand Kit, Image Enhancer

### Quick Reference: Priority Matrix

```
                        HIGH VALUE
                            │
        Background ✅     ──┼── Social Studio
        A+ Content ✅     ──┤   Testimonial Gen
        Ad Creative       ──┤   Infographic Video
        Product Variants ✅──┤   Model Video
                            │
        Size Chart ✅ ──────┼── Lifestyle Video
        Batch Processor   ──┤
        Export Center     ──┤
        Brand Kit         ──┤
                            │
        ────────────────────┼────────────────────
        LESS EFFORT         │         MORE EFFORT
                            │
        Badge Gen ✅      ──┼── Listing Analyzer
        Feature Cards ✅  ──┤   Catalog Generator
        Copywriter exp.   ──┤
                            │
                        LOW VALUE
```

### Consolidation Summary

| Before (Fragmented) | After (Consolidated) |
|---------------------|----------------------|
| Social Templates, Carousel Post, Pin Generator, Story/Reel Cover, Video Thumbnail | **Social Studio** |
| Crop & Resize, Watermark, Image Compressor, Export Center | **Export Center** |
| Email Campaign, Product Naming, Review Responder | **Copywriter expansion** |
| Amazon Optimizer, Etsy Listing, Shopify Product Page | **Copywriter presets** |
| Color Palette Extractor | **Brand Kit feature** |
| Seasonal Studio | **Lifestyle Studio** (already has seasons) |
| Price Comparison Table | **Comparison Generator** (already does this) |
| Specification Sheet | **Feature Cards** (Spec type exists) |

**Result:** ~25 planned tools → ~12 focused tools

### Completed Tools ✅

| Category | Tool | Key Features |
|----------|------|--------------|
| Visual | Infographics | Product feature callouts, icons |
| Visual | Model Studio | AI models wearing/holding products |
| Visual | Bundle Studio | Multi-product kit images |
| Visual | Lifestyle Studio | Product in lifestyle scenes |
| Visual | Packaging Mockup | Box, bottle, bag mockups |
| Visual | Background Studio | Remove/replace backgrounds, shadows |
| Content | Copywriter | SEO descriptions, social copy |
| Content | FAQ Generator | Q&As with Schema.org |
| Conversion | Comparison Generator | Before/after, vs competitor |
| Conversion | Size Visualizer | Scale with reference objects |
| Conversion | Badge Generator | Sale & trust badges, 6 styles |
| Conversion | Feature Cards | 5 card types for galleries |
| Conversion | Size Chart Generator | Apparel, footwear, accessories sizing |
| Platform | A+ Content Generator | 5 Amazon EBC module types |
| Visual | Product Variants | Color, material, pattern variations |

---

*Last updated: Dec 2024 (consolidated roadmap - reduced ~25 tools to ~12 focused studios)*
*Add ideas freely - this is a living document*
