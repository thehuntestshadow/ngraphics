# CHANGELOG.md

Version history and completed features for HEFAISTOS.

---

## Version 4.2 (Jan 2026) - Current

### Added
- Unit tests for core utilities (vitest)
- ESLint/Prettier code formatting
- Onboarding tour for new users
- Mobile optimization (touch targets, safe areas)
- Admin CMS (Homepage, Gallery, FAQ management)
- TypeScript via JSDoc annotations

### Fixed
- Admin panel layout issues
- Gallery thumbnail placeholders
- Toggle switch CSS conflicts
- Collapsible sections in studios

### Technical
- Pre-commit hooks for validation
- Visual regression testing skill
- Performance auditing skill

---

## Version 4.1 (Dec 2025) - Commercial Launch

### Added
- **Stripe Integration**
  - Products and prices configured
  - Payment links (no custom checkout)
  - stripe-webhook Edge Function
  - create-portal-session Edge Function

- **Marketing Pages**
  - Pricing page with tier comparison
  - Landing page with galleries
  - Gallery page (curated showcase)
  - FAQ page with categories

- **Account Features**
  - Usage dashboard in account menu
  - Upgrade prompts (contextual CTAs)
  - Billing portal (self-service management)

### Technical
- generate-image Edge Function (API proxy)
- Environment-based configuration
- Security hardening (XSS prevention)

---

## Version 4.0 (Nov 2025) - Infrastructure

### Added
- **Model Video Generator**
  - 3-10 second AI model animations
  - Model motions (sway, showcase, walking, turn)
  - Camera motions (zoom, pan, orbit)
  - Luma AI Dream Machine integration

- **Supabase Integration**
  - Authentication (login/signup)
  - Cloud sync (history/favorites)
  - Storage (generated images)
  - PostgreSQL database

- **Commercial Schema**
  - Subscription tiers table
  - Usage tracking tables
  - Credits system tables

### Technical
- config.js for environment variables
- Production logging toggle
- Settings modal with preferences

---

## Version 3.6 (Oct 2025)

### Added
- **Export Center** (consolidated utility)
  - Resize with platform presets
  - Compress with quality control
  - Watermark (text/logo)
  - Format conversion (JPEG, PNG, WebP)
  - Batch processing
  - 20+ size presets

- **Copywriter Expansion**
  - Email tab (welcome, launch, promo, abandoned cart)
  - Naming tab (product names, taglines, SKUs)
  - Reviews tab (response templates)

---

## Version 3.5 (Sep 2025)

### Added
- **Social Studio**
  - 5 format tabs (Post, Story, Carousel, Pinterest, Thumbnail)
  - 8 overlay types
  - AI caption generation
  - Platform-specific dimensions

- **Ad Creative Generator**
  - 4 platforms (Google, Facebook, Amazon, Instagram)
  - 20 standard ad sizes
  - 9-point text position grid
  - A/B variant generation

---

## Version 3.0 (Aug 2025)

### Added
- **Background Studio**
  - AI background removal
  - Replacement options (solid, gradient, scene, custom)
  - Shadow generation (drop, reflection, natural)
  - Batch processing

- **Badge Generator**
  - Sale badges (discounts, promos)
  - Trust badges (certifications, guarantees)
  - 6 badge styles (starburst, ribbon, circle, banner, tag, shield)

- **Feature Cards**
  - 5 card types (Feature, Spec, In Box, How-To, Before/After)
  - 5 visual styles
  - Gallery-ready output

- **Size Chart Generator**
  - 6 product categories (tops, bottoms, dresses, shoes, accessories, kids)
  - 3 chart styles (table, diagram, international)
  - Editable data tables
  - Unit conversion

- **A+ Content Generator**
  - 5 Amazon EBC module types
  - Comparison charts
  - Image grids
  - Brand story layouts

- **Product Variants**
  - Color variations (6 preset palettes)
  - Material swaps (fabrics, hard materials, finishes)
  - Pattern application (geometric, natural, abstract)

---

## Version 2.5 (Jul 2025)

### Added
- **Comparison Generator**
  - Before/after slider
  - Vs competitor layouts
  - Feature comparison tables
  - Size lineup
  - Multi-product grids

- **Size Visualizer**
  - 9 reference objects (hand, phone, coin, ruler, etc.)
  - 4 display modes
  - Context scenes
  - Dimension callouts

- **FAQ Generator**
  - 6 categories
  - Schema.org JSON-LD output
  - Visual FAQ infographics
  - 4 tone options

---

## Version 2.0 (Jun 2025)

### Added
- **Lifestyle Studio**
  - Product in lifestyle environments
  - Scene, mood, time, season options
  - No overlay mode (pure photography)

- **Copywriter**
  - E-commerce descriptions
  - SEO meta content
  - Social media copy
  - Multi-image analysis

- **Packaging Mockup**
  - Box, bottle, bag, pouch types
  - Scene presets (studio, retail, unboxing)
  - Branding options

---

## Version 1.5 (May 2025)

### Added
- Preset system (save/load settings)
- ZIP export with metadata
- Comparison slider
- Keyboard shortcuts modal
- Cost estimator
- Batch processing mode
- Image info overlay

---

## Version 1.1 (Apr 2025)

### Added
- Unified API client (api.js)
- Image compression before upload
- Service worker caching
- Web Components library
- Event bus architecture
- Reactive state management

---

## Version 1.0 (Mar 2025) - Initial Launch

### Added
- **Infographics Generator**
  - Product feature callouts
  - Icon suggestions
  - Multiple layouts

- **Model Studio**
  - AI models with products
  - Appearance customization
  - Shot types and scenes

- **Bundle Studio**
  - Multi-product compositions
  - Layout styles
  - Container options

### Core Features
- Generation history (localStorage + IndexedDB)
- Favorites with settings preservation
- Keyboard shortcuts
- Seed control
- Multiple variations (1, 2, 4)
- Light/dark themes

---

## Completed Studios (20)

| Category | Studio | Key Features |
|----------|--------|--------------|
| Visual | Infographics | Feature callouts, icons, layouts |
| Visual | Model Studio | AI models, appearances, scenes |
| Visual | Bundle Studio | Multi-product kits, containers |
| Visual | Lifestyle Studio | Environments, moods, seasons |
| Visual | Packaging Mockup | Boxes, bottles, scenes |
| Visual | Background Studio | Remove/replace, shadows |
| Visual | Product Variants | Colors, materials, patterns |
| Visual | Social Studio | Posts, stories, carousels |
| Content | Copywriter | SEO, social, email, naming |
| Content | FAQ Generator | Q&As, schema markup |
| Conversion | Comparison Generator | Before/after, vs competitor |
| Conversion | Size Visualizer | Reference objects, context |
| Conversion | Badge Generator | Sale, trust, 6 styles |
| Conversion | Feature Cards | 5 card types, galleries |
| Conversion | Size Chart | Apparel, footwear sizing |
| Platform | A+ Content | Amazon EBC modules |
| Utility | Export Center | Resize, compress, watermark |
| Video | Model Video | Animations, Luma AI |
| Marketing | Ad Creative | 4 platforms, 20 sizes |

---

## Infrastructure Completed

| Component | Technology | Status |
|-----------|------------|--------|
| Auth | Supabase Auth | Live |
| Database | Supabase PostgreSQL | Live |
| Storage | Supabase Storage | Live |
| API Proxy | Supabase Edge Functions | Live |
| Payments | Stripe | Live |
| Hosting | Coolify on Hetzner | Live |

---

## Technical Milestones

| Milestone | Version | Description |
|-----------|---------|-------------|
| TypeScript (JSDoc) | 4.2 | Type checking without build step |
| Unit Tests | 4.2 | vitest for core utilities |
| Visual Tests | 4.2 | Playwright screenshot comparisons |
| Pre-commit Hooks | 4.2 | Automated validation |
| Cloud Sync | 4.0 | History/favorites across devices |
| Edge Functions | 4.1 | Secure API proxy |
| Web Workers | 1.1 | Background image processing |
| Service Worker | 1.1 | Offline support, caching |
| Web Components | 1.1 | Reusable UI elements |

---

## Design Milestones

| Milestone | Version | Description |
|-----------|---------|-------------|
| Apple-like Aesthetic | 2.0 | Refined typography, soft shadows |
| Premium Toggles | 2.0 | 44x24px Apple-style switches |
| Glassmorphism | 2.0 | Subtle backdrop blur effects |
| 8px Grid | 2.0 | Consistent spacing system |
| Mobile Optimization | 4.2 | Touch targets, safe areas |
| Onboarding Tour | 4.2 | Spotlight effect, step-by-step |

---

*Updated: Jan 2026*
