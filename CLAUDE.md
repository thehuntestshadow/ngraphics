# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Production Environment

**THIS IS A LIVE APPLICATION WITH REAL USERS.**

- **Live URL**: https://hefaistos.xyz
- **Hosting**: Coolify on Hetzner server
- **Backend**: Supabase (auth, database, storage)
  - Project: `rodzatuqkfqcdqgntdnd.supabase.co`

**Production considerations:**
- Test changes locally before deploying
- Avoid breaking changes to existing features
- Database migrations must be backward-compatible
- Consider user data when modifying storage keys or schemas

## Project Overview

NGRAPHICS - AI E-commerce Toolkit. A collection of web-based tools that e-commerce brands need and use every day. Uses the OpenRouter API with various AI models (Gemini, GPT, Flux, Recraft) for image generation and text content.

**What we build:**
- **Visual content tools** - Product photography, infographics, lifestyle shots, model photos
- **Marketing graphics** - Comparisons, size guides, packaging mockups
- **Content writing** - Product descriptions, FAQs, SEO copy
- **Utility tools** - Analyzers, generators, exporters

**Guiding principles:**
- Each tool solves one specific problem well
- Works fully offline; optional accounts for cloud sync
- AI-powered but user-controlled
- Fast iteration: upload → configure → generate → download

## Development

No build process required. To run locally:
- Serve with any static file server (e.g., `python3 -m http.server 8000`)
- For auth testing, use `http://localhost:8000` (configured in Supabase)
- Direct file open (`file://`) won't work with Supabase auth redirects

## Architecture

The application consists of multiple pages, each with its own JS file, sharing common styles:

### Pages

| Page | Files | Purpose |
|------|-------|---------|
| Landing | `index.html`, `landing.js`, `landing.css` | Marketing landing page with product showcase |
| Gallery | `gallery.html`, `gallery.js`, `gallery.css` | Curated showcase of AI-generated examples |
| FAQ | `faq.html`, `faq.css` | Frequently asked questions |
| Pricing | `pricing.html`, `pricing.js`, `pricing.css` | Subscription plans and pricing |
| Infographics | `infographics.html`, `infographics.js` | Generate product infographics with features/callouts |
| Model Studio | `models.html`, `models.js`, `models.css` | Generate AI model photos wearing/holding products |
| Bundle Studio | `bundle.html`, `bundle.js`, `bundle.css` | Create bundle/kit images from multiple products |
| Lifestyle Studio | `lifestyle.html`, `lifestyle.js`, `lifestyle.css` | Product photography in lifestyle environments (no overlays) |
| Copywriter | `copywriter.html`, `copywriter.js`, `copywriter.css` | AI-powered marketing copy generator from product images |
| Packaging Mockup | `packaging.html`, `packaging.js`, `packaging.css` | Product packaging visualization (boxes, bottles, bags, etc.) |
| Comparison | `comparison.html`, `comparison.js`, `comparison.css` | Side-by-side and before/after product comparisons |
| Size Visualizer | `size-visualizer.html`, `size-visualizer.js`, `size-visualizer.css` | Product scale visualization with reference objects |
| FAQ Generator | `faq-generator.html`, `faq-generator.js`, `faq-generator.css` | Generate product Q&As with text and image output |
| Background Studio | `background.html`, `background.js`, `background.css` | Remove and replace product backgrounds |
| Badge Generator | `badge-generator.html`, `badge-generator.js`, `badge-generator.css` | Create sale and trust badges for products |
| Feature Cards | `feature-cards.html`, `feature-cards.js`, `feature-cards.css` | Individual feature cards for product galleries |
| Size Chart | `size-chart.html`, `size-chart.js`, `size-chart.css` | Generate size charts from product measurements |
| A+ Content | `a-plus.html`, `a-plus.js`, `a-plus.css` | Amazon A+ Content (EBC) module generator |
| Product Variants | `product-variants.html`, `product-variants.js`, `product-variants.css` | Generate color, material, and pattern variants from product photos |
| Social Studio | `social-studio.html`, `social-studio.js`, `social-studio.css` | Social media graphics for all platforms (posts, stories, carousels) |
| Export Center | `export-center.html`, `export-center.js`, `export-center.css` | Batch resize, compress, watermark, and convert images |
| Ad Creative | `ad-creative.html`, `ad-creative.js`, `ad-creative.css` | Banner ads for Google, Facebook, Amazon, Instagram |
| Model Video | `model-video.html`, `model-video.js`, `model-video.css` | Animate model photos with motion and camera effects |
| Dashboard | `dashboard.html`, `dashboard.js`, `dashboard.css` | Analytics, storage management, quick access to recent work |
| Admin | `admin.html`, `admin.js`, `admin.css` | User management, analytics, system administration (admin only) |
| Documentation | `docs.html`, `docs.css` | User documentation |

### Shared Resources
- `styles.css` - Base styles, CSS variables, theming, common components
- `core.js` - Core infrastructure: Reactive State, Event Bus, Image Compression, Virtual Scrolling, Lazy Loading
- `i18n.js` - Internationalization module with 10 languages, interface/generation language settings
- `shared.js` - Shared utilities: API handling, history, favorites, UI helpers, upload handling, lightbox, keyboard shortcuts, upgrade prompts, language helpers
- `api.js` - Unified API client with retry logic, rate limiting, response normalization, usage limit checking
- `components.js` - Reusable Web Components and UI elements
- `workers.js` - Web Worker and Service Worker managers
- `image-worker.js` - Web Worker for image processing (compression, thumbnails, enhancement)
- `service-worker.js` - Service Worker for caching and offline support
- `supabase.js` - Supabase client wrapper (auth, profiles, API key storage, usage tracking)
- `auth-ui.js` - Authentication UI (login/signup modal, account menu, settings modal with language settings, usage display)
- `cloud-sync.js` - Cloud sync manager (history/favorites sync to Supabase)

### Documentation Files
- `DESIGN.md` - Design system (colors, spacing, components, patterns)
- `PROMPTS.md` - Prompt engineering patterns for AI image generation
- `ROADMAP.md` - Feature ideas & plans
- `UI_PATTERNS.md` - HTML/CSS patterns for consistent UI
- `API_REFERENCE.md` - Code examples for shared infrastructure
- `TESTING.md` - Testing guide (visual tests, performance, hooks)

## API Integration

Uses OpenRouter's `/api/v1/chat/completions` endpoint with `modalities: ['image', 'text']` for image generation. Response handling supports multiple formats (Gemini's inline_data, OpenAI's image_url, base64 responses).

**Default Model:** Gemini 3 Pro - Best balance of quality and speed for image generation tasks.

---

## Infographics Generator (`infographics.html` + `infographics.js`)

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

### Generated Content (7 tabs)
- **E-commerce**: Title, Short/Long Description, Feature Bullets, Benefits List
- **SEO**: Meta Title (<60 chars), Meta Description (<160 chars), Keywords, Alt Text
- **Social Media**: Instagram, Facebook, Twitter/X posts
- **Email**: Welcome, Launch, Promotional, Abandoned Cart email templates
- **Naming**: Product names, Brand names, Collection names, SKU suggestions
- **Reviews**: Response templates for 5-star, 4-star, neutral, and negative reviews
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

## Badge Generator (`badge-generator.html` + `badge-generator.js`)

Create sale badges (discounts, promotions) and trust badges (quality, certifications) for products.

### Badge Categories
- **Sale & Promo**: Discount %, Sale, New, Limited, Free Shipping, Best Seller
- **Trust & Quality**: Certified, Organic, Eco-Friendly, Made in USA, Premium, Warranty

### Badge Styles (6)
- **Starburst**: Pointed rays radiating outward
- **Ribbon**: Diagonal corner banner
- **Circle**: Clean round badge
- **Banner**: Horizontal strip with fold details
- **Tag**: Pointed bottom price tag style
- **Shield**: Trust/quality shield shape

### Options
- **Color**: 8 preset colors + custom picker
- **Size**: Small (200px), Medium (400px), Large (600px)
- **Background**: Transparent, White, or Black
- **Variations**: 1, 2, or 4 images

### Key Functions
- `generatePrompt()`: Builds badge generation prompt
- `generateBadge()`: Makes API call for badge image
- `selectBadgePreset()`: Applies preset badge text and category

---

## Feature Cards (`feature-cards.html` + `feature-cards.js`)

Create individual feature cards for product listing galleries (Amazon, Etsy image slots).

### Card Types (5)
- **Feature**: Icon + headline + description spotlight
- **Spec**: Technical specifications with label/value pairs
- **In Box**: Package contents list with checkmarks
- **How-To**: Numbered step instructions
- **Before/After**: Split comparison card

### Visual Styles
- Modern, Minimal, Bold, Elegant, Playful

### Options
- **Color**: 8 preset colors + custom picker
- **Size**: Small (400px), Medium (600px), Large (800px)
- **Background**: White, Light, Dark
- **Product Image**: Optional product to incorporate
- **Variations**: 1, 2, or 4 images

### Key Functions
- `generatePrompt()`: Builds card generation prompt based on type
- `generateCard()`: Makes API call for card image
- `validateContent()`: Ensures required fields are filled

---

## Size Chart Generator (`size-chart.html` + `size-chart.js`)

Generate professional size charts from product measurements for apparel, footwear, and accessories.

### Product Categories (6)
- **Tops**: Shirts, blouses, jackets - Chest, Waist, Length measurements
- **Bottoms**: Pants, shorts, skirts - Waist, Hips, Inseam, Length
- **Dresses**: Dresses, jumpsuits - Bust, Waist, Hips, Length
- **Shoes**: Footwear - US, UK, EU sizes with foot length
- **Accessories**: Hats, rings, belts - Head circumference, finger size, belt length
- **Kids**: Children's sizing - Age ranges with Height, Chest, Waist

### Chart Styles (3)
- **Table**: Classic size chart table format
- **Visual Diagram**: Body silhouette with measurement labels
- **International Comparison**: Multi-region size conversion (US, UK, EU, Asia)

### Features
- **Editable Table**: Add/remove rows and columns dynamically
- **Data Presets**: US Standard (S/M/L/XL), US Numeric (0-14), International sizes
- **Unit Toggle**: Inches, centimeters, or show both
- **Brand Name**: Optional brand text on chart
- **Fit Notes**: Add fit guidance (runs large, true to size, etc.)

### Visual Styles
- Clean, Modern, Classic, Bold, Minimal

### Options
- **Background**: White, Light Gray, Dark, Brand Color
- **Aspect Ratio**: 1:1, 4:3, 16:9
- **Variations**: 1, 2, or 4 images
- **Seed Control**: For reproducible generations

### Key Functions
- `generatePrompt()`: Builds size chart prompt from category and data
- `generateChart()`: Makes API call for chart image
- `renderTable()`: Renders editable size table
- `addColumn()`, `removeColumn()`, `addRow()`, `removeRow()`: Table management
- `loadPreset()`: Loads category-specific or data presets

---

## A+ Content Generator (`a-plus.html` + `a-plus.js`)

Generate Amazon A+ Content (Enhanced Brand Content) modules with professional layouts.

### Module Types (5)
- **Image with Text**: Hero product image with marketing headline and body copy (970x600px)
- **Comparison Chart**: Feature comparison table for 2-5 products with checkmarks/values (970x300px)
- **Four-Image Grid**: 2x2 grid layout showing product variants or angles (970x600px)
- **Standard Text**: Text-only marketing section with headline and body (970x300px)
- **Single Image**: Full-width lifestyle or product hero image (970x600px)

### Features
- **Module Switching**: Tabs to switch between module types
- **Comparison Chart**: Add/remove products, feature rows with checkmarks (✓/✗) or text values
- **Four-Grid Modes**: Upload 4 separate images OR generate 4 variants from 1 product
- **Visual Styles**: Clean, Modern, Bold, Premium
- **Color Schemes**: Match Product, White, Dark, Custom brand color

### Comparison Chart
- 2-5 products side by side
- Dynamic feature rows
- Toggle values: checkmark → X → custom text → checkmark
- Optional winner highlight for first product

### Key Functions
- `switchModuleType(type)`: Switch between 5 module types
- `generatePrompt()`: Builds module-specific prompt
- `addComparisonProduct()`, `removeComparisonProduct()`: Manage comparison products
- `addComparisonFeature()`, `toggleFeatureValue()`: Manage feature table
- `switchGridMode(mode)`: Toggle between upload and generate grid modes

### Output Dimensions
All outputs follow Amazon A+ Content specifications at 970px width.

---

## Product Variants (`product-variants.html` + `product-variants.js`)

Generate color, material, and pattern variations from a single product photo. Useful for pre-production mockups and showing unavailable variants.

### Variant Types (3)
- **Color**: Generate product in different colors (preset palettes or custom)
- **Material**: Swap materials/finishes (leather, metal, fabric, etc.)
- **Pattern**: Apply patterns to product (stripes, floral, geometric, etc.)

### Color Options
- **Preset Palettes**: Popular, Earth Tones, Pastels, Bold, Neutrals, Metallics
- **Custom Colors**: Enter custom color names separated by commas

### Material Options (grouped)
- **Fabrics**: Leather, Suede, Velvet, Canvas, Denim, Silk, Wool, Linen
- **Hard Materials**: Metal, Wood, Plastic, Rubber, Glass, Ceramic, Marble, Concrete
- **Finishes**: Matte, Glossy, Satin, Chrome, Brushed Metal, Patent

### Pattern Options (grouped)
- **Geometric**: Stripes, Plaid, Checkered, Chevron, Polka Dots, Geometric
- **Natural**: Floral, Tropical, Animal Print, Leopard, Marble, Wood Grain
- **Abstract**: Abstract, Tie-Dye, Ombre, Watercolor, Splatter
- **Textures**: Quilted, Embossed, Woven
- **Pattern Scale**: Small, Medium, Large

### Key Functions
- `switchVariantType(type)`: Switch between color/material/pattern tabs
- `generateColorPrompt()`, `generateMaterialPrompt()`, `generatePatternPrompt()`: Type-specific prompts
- `selectColorPreset(preset)`: Apply color palette preset
- `toggleMaterial(material)`, `togglePattern(pattern)`: Toggle checkbox selections
- `showVariantResults(results)`: Display variant grid with labels

### Options
- **Variant Count**: 2, 4, 6, or 8 variants
- **Preserve Lighting**: Maintain consistent lighting across variants
- **Aspect Ratio**: 1:1, 4:5, 3:4, 16:9, 9:16
- **Output Quality**: Standard, High, Ultra

---

## Social Studio (`social-studio.html` + `social-studio.js`)

Create social media graphics for all platforms with AI-generated visuals.

### Format Types (5)
- **Post**: Square/feed images (1:1, 4:5)
- **Story/Reel**: Vertical format (9:16)
- **Carousel**: Multi-slide posts (up to 10 slides)
- **Pinterest**: Tall pin format (2:3)
- **Thumbnail**: Video thumbnails (16:9)

### Platforms
Instagram, Facebook, TikTok, Pinterest, Twitter/X, LinkedIn, YouTube

### Style Options
Modern, Minimal, Bold, Elegant, Playful, Dark

### Key Functions
- `switchFormat(format)`: Switch between post/story/carousel/etc.
- `generatePrompt()`: Builds platform-specific prompt
- `generateSocialGraphic()`: API call for image generation
- `selectStyle(style)`, `selectColor(color)`: Visual options

### Options
- **Text Content**: Headline, body text, CTA
- **Color Scheme**: Auto-extract, preset colors, custom color picker
- **Platform Dimensions**: Auto-set based on selected platform
- **Variations**: 1, 2, or 4 images

---

## Export Center (`export-center.html` + `export-center.js`)

Batch image processing utility - resize, compress, watermark, and convert images.

### Tools (4)
- **Resize**: Preset sizes (Amazon, Instagram, Facebook, etc.) or custom dimensions
- **Compress**: Quality slider, max file size targets
- **Watermark**: Text or logo watermarks with position and opacity controls
- **Convert**: JPG, PNG, WebP format conversion

### Key Functions
- `switchTool(tool)`: Switch between resize/compress/watermark/convert
- `processImages()`: Batch process all uploaded images
- `applyWatermark(ctx, canvas)`: Canvas-based watermark application
- `generateFilename(name, width, height)`: Pattern-based naming

### Options
- **Batch Upload**: Process multiple images at once
- **Size Presets**: Platform-specific dimensions
- **Aspect Lock**: Maintain proportions when resizing
- **Fit Modes**: Contain, Cover, Fill
- **Watermark Position**: 9-point grid placement
- **Naming Pattern**: {name}, {size}, {date}, {index} tokens

---

## Ad Creative (`ad-creative.html` + `ad-creative.js`)

Generate banner ads for Google Display, Facebook/Meta, Amazon, and Instagram.

### Platforms (4)
- **Google Display**: 300x250, 728x90, 160x600, 300x600, 320x50, 336x280
- **Facebook/Meta**: 1200x628, 1080x1080, 1080x1920, 1200x1200
- **Amazon**: 1200x628, 970x250, 300x250, 160x600
- **Instagram**: 1080x1080, 1080x1350, 1080x1920, 1080x566

### Key Functions
- `switchPlatform(platform)`: Change platform and render size grid
- `renderSizeGrid(platform)`: Display available sizes for platform
- `selectSize(sizeId)`: Set current ad size
- `generatePrompt()`: Build prompt with ad content, style, position
- `generateAdCreative()`: API call to generate ad

### Options
- **Ad Content**: Headline (30 chars), Description (90 chars), CTA dropdown
- **Price Display**: Optional price tag overlay
- **Badge**: Sale, New, Limited, Best Seller, Free Shipping
- **Text Position**: 9-point grid for text placement
- **Visual Style**: Modern, Bold, Minimal, Elegant, Playful, Dark
- **Color Scheme**: Auto, preset gradients, or custom brand color
- **A/B Variations**: Generate 1, 2, or 4 variants

---

## Model Video (`model-video.html` + `model-video.js`)

Generate short video clips from model photos using Luma AI. Transform static images into dynamic videos with model movements and camera motion.

### Motion Types (3)
- **Model Motion**: Animate the model (subtle sway, product showcase, walking, turn, hair flip, gesture)
- **Camera Motion**: Move the camera (zoom in/out, pan left/right, orbit, static)
- **Combined**: Apply both model and camera motion simultaneously

### Model Motions (6)
- Subtle Sway, Product Showcase, Walking, Turn, Hair Flip, Gesture

### Camera Motions (6)
- Zoom In, Zoom Out, Pan Left, Pan Right, Orbit, Static

### Key Functions
- `switchMotionType(type)`: Toggle between model/camera/combined tabs
- `selectModelMotion(motion)`: Set model motion type
- `selectCameraMotion(motion)`: Set camera motion type
- `generateVideoPrompt()`: Build motion prompt for Luma AI
- `generateVideo()`: Call Luma AI API for video generation
- `pollVideoStatus(id)`: Async polling for generation completion
- `showVideoResult(url)`: Display video player with result

### Options
- **Duration**: 3-10 seconds slider
- **Speed**: Normal, Slow-mo (0.5x), Cinematic (0.75x)
- **Loop**: Seamless loop toggle for social media
- **Intensity**: Subtle, Normal, Dramatic
- **Smoothness**: High (cinematic), Medium, Snappy
- **Aspect Ratio**: 1:1, 4:5, 9:16, 16:9
- **Export**: MP4 download, GIF conversion (coming soon)

### API
Uses Luma AI Dream Machine API (separate API key from OpenRouter).

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

## Admin Panel (`admin.html` + `admin.js`)

Administrative dashboard for user management and system analytics. Requires admin role.

### Features
- User management: search, view, edit roles, manage subscriptions
- System analytics: total users, active subscriptions, generation counts
- User detail modal with profile info, subscription status, usage stats
- Role management (user/admin) and subscription tier editing
- Responsive data tables with search and pagination

### Access Control
- Admin-only access via Supabase RLS policies
- Checks `profiles.role = 'admin'` before allowing access
- Redirects non-admin users to dashboard

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
- Storage keys: `ngraphics_*`, `model_studio_*`, `bundle_studio_*`, `lifestyle_studio_*`, `copywriter_*`, `packaging_*`, `comparison_generator_*`, `size_visualizer_*`, `faq_generator_*`, `background_studio_*`, `badge_generator_*`, `feature_cards_*`, `size_chart_*`, `aplus_generator_*`, `product_variants_*`, `social_studio_*`, `export_center_*`, `ad_creative_*`, `model_video_*`

### Language Settings
- `ngraphics_ui_language` - Interface language (EN, RO, DE, FR, ES, IT, PT, NL, PL, CS)
- `ngraphics_gen_language` - Generation language for AI content
- `copywriter_language` - Legacy key (synced with gen_language for backwards compatibility)

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
- **SharedTheme**: `init()`, `apply()`, `toggle()`, `setupToggle()` - Note: All HTML pages include inline `<script>` in `<head>` to prevent theme flash
- **SharedHeader**: `render(options)` - consistent header across pages
- **SharedDashboard**: `loadAllData()`, `getMetrics()`, `getGenerationTrends()`, `getModelUsage()`, `getRecentActivity()`, `getStorageEstimate()`, `clearOldItems()`
- **SharedUI**: `showError()`, `showSuccess()`, `updateApiStatus()`, `showLoading()`, `hideLoading()`, `toast()`, `confirm()`, `showUpgradeModal()`, `showCreditsPrompt()`, `showUsageWarning()`
- **SharedUpload**: `setup()`, `handleFile()`
- **SharedLightbox**: `setup()`, `open()`, `close()`
- **SharedDownload**: `downloadImage()`
- **SharedKeyboard**: `setup(handlers)` - Ctrl+Enter, Ctrl+D, Escape
- **SharedCollapsible**: `setup()`
- **SharedLanguage**: `getLanguage()`, `getPrompt()`, `getDisplayName()` - generation language helpers

---

## Internationalization (`i18n.js`)

Lightweight i18n module for key UI strings and generation language.

### Supported Languages (10)
EN (English), RO (Romanian), DE (German), FR (French), ES (Spanish), IT (Italian), PT (Portuguese), NL (Dutch), PL (Polish), CS (Czech)

### i18n Object
- `init()` - Initialize from localStorage
- `t(key, fallback)` - Translate key to current UI language
- `getUILanguage()` / `setUILanguage(lang)` - Interface language
- `getGenerationLanguage()` / `setGenerationLanguage(lang)` - AI content language
- `getGenerationPrompt()` - Get language instruction for AI prompts (empty for English)
- `getLanguages()` - Get all supported languages
- `getLanguageInfo(code)` - Get language object by code

### Usage in Studios
Studios use `SharedLanguage.getPrompt()` to append language instructions to AI prompts:
```javascript
prompt += SharedLanguage.getPrompt();
// Returns "" for English, or "\n\nLANGUAGE: German (use proper umlauts: ä, ö, ü, ß)..." for non-English
```

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
- Features: Automatic retries, rate limiting, response normalization, request cancellation, caching, error classification, usage limit checking with upgrade prompts

See `API_REFERENCE.md` for usage examples.
